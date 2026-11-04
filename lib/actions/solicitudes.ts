'use server'

import { randomInt } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { and, desc, eq } from 'drizzle-orm'
import { checkRole } from '@/lib/auth/session'
import { getBarrios, getProfessionalById } from '@/lib/catalog'
import { db } from '@/lib/db'
import { serviceRequest } from '@/lib/db/schema'
import { toRequestStatus, toSubmittedRequest, type ReceivedRequest, type RequestStatus, type SubmittedRequest } from '@/lib/requests'
import { primerError } from '@/lib/validations'
import { estadoSolicitudSchema, solicitudSchema, type SolicitudInput } from '@/lib/validations/solicitud'

export type SubmitRequestInput = SolicitudInput

export type SubmitRequestResult = { ok: true; request: SubmittedRequest } | { ok: false; error: string }

export async function submitServiceRequest(input: SubmitRequestInput): Promise<SubmitRequestResult> {
  const guard = await checkRole(['cliente', 'profesional'])
  if (!guard.ok) return { ok: false, error: guard.error === 'Iniciá sesión para continuar.' ? 'Iniciá sesión para confirmar tu solicitud.' : guard.error }
  const user = guard.user

  const parsed = solicitudSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: primerError(parsed.error) }
  const datos = parsed.data

  const professional = await getProfessionalById(datos.professionalId)
  if (!professional) return { ok: false, error: 'Este profesional ya no está disponible.' }
  if (professional.ownerId && professional.ownerId === user.id) {
    return { ok: false, error: 'No podés pedirte un servicio a vos mismo.' }
  }

  const barrios = await getBarrios()
  if (!barrios.includes(datos.barrio)) return { ok: false, error: 'Elegí un barrio válido.' }

  const lines: { nombre: string; precio: number; cantidad: number }[] = []
  for (const item of datos.items) {
    const service = professional.servicios.find((s) => s.id === item.serviceId)
    if (!service || lines.some((line) => line.nombre === service.nombre)) continue
    lines.push({ nombre: service.nombre, precio: service.precio, cantidad: item.cantidad })
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
        direccion: `${datos.calle}${datos.piso ? `, ${datos.piso}` : ''} · ${datos.barrio}, CABA`,
        fecha: datos.fecha,
        franja: datos.franja,
        notas: datos.notas || null,
        contactoNombre: datos.nombre,
        contactoTelefono: datos.telefono,
        costoVisita: professional.costoVisita,
        total: subtotal + professional.costoVisita,
      })
      .returning()

    revalidatePath('/app/mis-solicitudes')
    revalidatePath('/app/panel')
    revalidatePath('/admin', 'layout')
    return { ok: true, request: toSubmittedRequest(row) }
  } catch (error) {
    console.error('No se pudo guardar la solicitud', error)
    return { ok: false, error: 'No pudimos guardar tu solicitud. Probá de nuevo en unos minutos.' }
  }
}

export async function getMyRequests(userId: string): Promise<SubmittedRequest[]> {
  const guard = await checkRole(['cliente', 'profesional', 'admin'])
  if (!guard.ok || (guard.user.id !== userId && guard.user.role !== 'admin')) return []
  const rows = await db.select().from(serviceRequest).where(eq(serviceRequest.clientId, userId)).orderBy(desc(serviceRequest.createdAt))
  return rows.map(toSubmittedRequest)
}

export async function getReceivedRequests(userId: string): Promise<ReceivedRequest[]> {
  const guard = await checkRole(['profesional', 'admin'])
  if (!guard.ok || (guard.user.id !== userId && guard.user.role !== 'admin')) return []
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
  const guard = await checkRole(['cliente', 'profesional'])
  if (!guard.ok) return { ok: false, error: guard.error }
  const user = guard.user

  const estado = estadoSolicitudSchema.safeParse(next)
  if (!estado.success) return { ok: false, error: 'Estado inválido.' }

  const [row] = await db.select().from(serviceRequest).where(eq(serviceRequest.id, String(requestId))).limit(1)
  if (!row) return { ok: false, error: 'No encontramos la solicitud.' }

  const isProfessionalOwner = row.professionalUserId === user.id
  const isClientOwner = row.clientId === user.id
  const actual = toRequestStatus(row.estado)

  const allowed =
    (isProfessionalOwner && (PROFESSIONAL_TRANSITIONS[actual] ?? []).includes(estado.data)) ||
    (isClientOwner && estado.data === 'cancelada' && (actual === 'pendiente' || actual === 'aceptada'))

  if (!allowed) return { ok: false, error: 'No podés realizar este cambio.' }

  await db
    .update(serviceRequest)
    .set({ estado: estado.data })
    .where(and(eq(serviceRequest.id, row.id), eq(serviceRequest.estado, row.estado)))

  revalidatePath('/app/mis-solicitudes')
  revalidatePath('/app/panel')
  revalidatePath('/admin', 'layout')
  return { ok: true }
}
