'use server'

import { randomInt } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { and, desc, eq } from 'drizzle-orm'
import { getProfessionalById } from '@/lib/catalog'
import { BARRIOS } from '@/lib/data'
import { db } from '@/lib/db'
import { serviceRequest } from '@/lib/db/schema'
import { toRequestStatus, type ReceivedRequest, type RequestStatus, type SubmittedRequest } from '@/lib/requests'
import { getCurrentUser } from '@/lib/session'

type RequestRow = typeof serviceRequest.$inferSelect

export type SubmitRequestInput = {
  professionalId: string
  items: { serviceId: string; cantidad: number }[]
  calle: string
  piso: string
  barrio: string
  fecha: string
  franja: string
  notas: string
  nombre: string
  telefono: string
}

export type SubmitRequestResult = { ok: true; request: SubmittedRequest } | { ok: false; error: string }

export function toSubmittedRequest(row: RequestRow): ReceivedRequest {
  return {
    id: row.id,
    clientId: row.clientId,
    professionalId: row.professionalId,
    professionalNombre: row.professionalNombre,
    items: row.items,
    direccion: row.direccion,
    fecha: row.fecha,
    franja: row.franja,
    notas: row.notas ?? '',
    contacto: { nombre: row.contactoNombre, telefono: row.contactoTelefono },
    costoVisita: row.costoVisita,
    total: row.total,
    estado: toRequestStatus(row.estado),
    createdAt: row.createdAt.toISOString(),
  }
}

export async function submitServiceRequest(input: SubmitRequestInput): Promise<SubmitRequestResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Iniciá sesión para confirmar tu solicitud.' }

  const professional = await getProfessionalById(String(input.professionalId))
  if (!professional) return { ok: false, error: 'Este profesional ya no está disponible.' }
  if (professional.ownerId && professional.ownerId === user.id) {
    return { ok: false, error: 'No podés pedirte un servicio a vos mismo.' }
  }

  const calle = String(input.calle ?? '').trim().slice(0, 120)
  const piso = String(input.piso ?? '').trim().slice(0, 30)
  const barrio = String(input.barrio ?? '')
  const nombre = String(input.nombre ?? '').trim().slice(0, 80)
  const telefono = String(input.telefono ?? '').trim().slice(0, 30)
  const fecha = String(input.fecha ?? '').trim().slice(0, 80)
  const franja = String(input.franja ?? '').trim().slice(0, 60)
  const notas = String(input.notas ?? '').trim().slice(0, 500)

  if (calle.length < 4 || !/\d/.test(calle)) return { ok: false, error: 'Revisá la dirección del servicio.' }
  if (!BARRIOS.includes(barrio)) return { ok: false, error: 'Elegí un barrio válido.' }
  if (nombre.length < 3) return { ok: false, error: 'Ingresá tu nombre completo.' }
  if (telefono.replace(/\D/g, '').length < 8) return { ok: false, error: 'Ingresá un teléfono válido.' }
  if (!fecha || !franja) return { ok: false, error: 'Elegí el día y la franja horaria.' }

  const wanted = Array.isArray(input.items) ? input.items.slice(0, 10) : []
  const lines: { nombre: string; precio: number; cantidad: number }[] = []
  for (const item of wanted) {
    const service = professional.servicios.find((s) => s.id === item.serviceId)
    const cantidad = Math.floor(Number(item.cantidad))
    if (!service || !Number.isFinite(cantidad) || cantidad < 1 || cantidad > 10) continue
    if (lines.some((line) => line.nombre === service.nombre)) continue
    lines.push({ nombre: service.nombre, precio: service.precio, cantidad })
  }
  if (lines.length === 0) return { ok: false, error: 'Elegí al menos un servicio.' }

  const subtotal = lines.reduce((sum, line) => sum + line.precio * line.cantidad, 0)
  const id = `CFX-${randomInt(100000, 999999)}`

  try {
    const [row] = await db
      .insert(serviceRequest)
      .values({
        id,
        clientId: user.id,
        professionalId: professional.id,
        professionalUserId: professional.ownerId ?? null,
        professionalNombre: professional.nombre,
        items: lines,
        direccion: `${calle}${piso ? `, ${piso}` : ''} · ${barrio}, CABA`,
        fecha,
        franja,
        notas: notas || null,
        contactoNombre: nombre,
        contactoTelefono: telefono,
        costoVisita: professional.costoVisita,
        total: subtotal + professional.costoVisita,
      })
      .returning()

    revalidatePath('/mis-solicitudes')
    revalidatePath('/panel')
    revalidatePath('/admin')
    return { ok: true, request: toSubmittedRequest(row) }
  } catch (error) {
    console.error('No se pudo guardar la solicitud', error)
    return { ok: false, error: 'No pudimos guardar tu solicitud. Probá de nuevo en unos minutos.' }
  }
}

export async function getMyRequests(userId: string): Promise<SubmittedRequest[]> {
  const rows = await db.select().from(serviceRequest).where(eq(serviceRequest.clientId, userId)).orderBy(desc(serviceRequest.createdAt))
  return rows.map(toSubmittedRequest)
}

export async function getReceivedRequests(userId: string): Promise<ReceivedRequest[]> {
  const rows = await db
    .select()
    .from(serviceRequest)
    .where(eq(serviceRequest.professionalUserId, userId))
    .orderBy(desc(serviceRequest.createdAt))
  return rows.map(toSubmittedRequest)
}

const PROFESSIONAL_TRANSITIONS: Record<string, RequestStatus[]> = {
  pendiente: ['aceptada', 'rechazada'],
  aceptada: ['completada', 'rechazada'],
}

export async function updateRequestStatus(requestId: string, next: RequestStatus): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Iniciá sesión para continuar.' }

  const [row] = await db.select().from(serviceRequest).where(eq(serviceRequest.id, String(requestId))).limit(1)
  if (!row) return { ok: false, error: 'No encontramos la solicitud.' }

  const isProfessionalOwner = row.professionalUserId === user.id
  const isClientOwner = row.clientId === user.id

  const allowed =
    (isProfessionalOwner && (PROFESSIONAL_TRANSITIONS[row.estado] ?? []).includes(next)) ||
    (isClientOwner && next === 'cancelada' && (row.estado === 'pendiente' || row.estado === 'aceptada'))

  if (!allowed) return { ok: false, error: 'No podés realizar este cambio.' }

  await db
    .update(serviceRequest)
    .set({ estado: next })
    .where(and(eq(serviceRequest.id, row.id), eq(serviceRequest.estado, row.estado)))

  revalidatePath('/mis-solicitudes')
  revalidatePath('/panel')
  revalidatePath('/admin')
  return { ok: true }
}
