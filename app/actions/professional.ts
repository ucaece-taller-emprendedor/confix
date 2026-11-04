'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { BARRIOS, CATEGORIES, SERVICE_UNITS } from '@/lib/data'
import { db } from '@/lib/db'
import { professionalProfile, user, type StoredService } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/session'

export type ProfileInput = {
  nombre: string
  categoria: string
  oficio: string
  barrio: string
  horario: string
  costoVisita: number
  descripcion: string
  servicios: { nombre: string; detalle: string; precio: number; unidad: string }[]
}

export type ProfileResult = { ok: true } | { ok: false; error: string }

function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
}

export async function saveProfessionalProfile(input: ProfileInput): Promise<ProfileResult> {
  const current = await getCurrentUser()
  if (!current) return { ok: false, error: 'Iniciá sesión para continuar.' }
  if (current.role === 'admin') return { ok: false, error: 'Las cuentas de administración no pueden ofrecer servicios.' }

  const nombre = String(input.nombre ?? '').trim()
  const oficio = String(input.oficio ?? '').trim()
  const horario = String(input.horario ?? '').trim()
  const descripcion = String(input.descripcion ?? '').trim()
  const costoVisita = Math.floor(Number(input.costoVisita))

  if (nombre.length < 3 || nombre.length > 60) return { ok: false, error: 'Ingresá un nombre público de 3 a 60 caracteres.' }
  if (!CATEGORIES.some((c) => c.id === input.categoria)) return { ok: false, error: 'Elegí una categoría.' }
  if (oficio.length < 3 || oficio.length > 40) return { ok: false, error: 'Ingresá tu oficio (ej: Plomero matriculado).' }
  if (!BARRIOS.includes(input.barrio)) return { ok: false, error: 'Elegí tu barrio.' }
  if (horario.length < 3 || horario.length > 40) return { ok: false, error: 'Ingresá tu horario de atención.' }
  if (!Number.isFinite(costoVisita) || costoVisita < 0 || costoVisita > 100000) {
    return { ok: false, error: 'El costo de visita debe estar entre $0 y $100.000.' }
  }
  if (descripcion.length < 20 || descripcion.length > 600) {
    return { ok: false, error: 'Contá un poco más sobre tu trabajo (entre 20 y 600 caracteres).' }
  }

  const rawServices = Array.isArray(input.servicios) ? input.servicios.slice(0, 8) : []
  if (rawServices.length === 0) return { ok: false, error: 'Agregá al menos un servicio.' }

  const [existing] = await db.select().from(professionalProfile).where(eq(professionalProfile.userId, current.id)).limit(1)
  const profileId = existing?.id ?? `${slugify(nombre) || 'profesional'}-${randomBytes(2).toString('hex')}`

  const servicios: StoredService[] = []
  for (const [index, service] of rawServices.entries()) {
    const servicioNombre = String(service.nombre ?? '').trim()
    const precio = Math.floor(Number(service.precio))
    if (servicioNombre.length < 3 || servicioNombre.length > 60) {
      return { ok: false, error: `Revisá el nombre del servicio ${index + 1}.` }
    }
    if (!Number.isFinite(precio) || precio < 100 || precio > 5000000) {
      return { ok: false, error: `Revisá el precio del servicio ${index + 1}.` }
    }
    servicios.push({
      id: `${profileId}-${index + 1}`,
      nombre: servicioNombre,
      detalle: String(service.detalle ?? '').trim().slice(0, 100),
      precio,
      unidad: SERVICE_UNITS.includes(service.unidad) ? service.unidad : SERVICE_UNITS[0],
    })
  }

  const values = {
    nombre,
    categoria: input.categoria,
    oficio,
    barrio: input.barrio,
    horario,
    costoVisita,
    descripcion,
    servicios,
  }

  try {
    if (existing) {
      await db.update(professionalProfile).set(values).where(eq(professionalProfile.id, existing.id))
    } else {
      await db.transaction(async (tx) => {
        await tx.insert(professionalProfile).values({ id: profileId, userId: current.id, ...values })
        await tx.update(user).set({ role: 'profesional' }).where(eq(user.id, current.id))
      })
    }
  } catch (error) {
    console.error('No se pudo guardar el perfil profesional', error)
    return { ok: false, error: 'No pudimos guardar tu perfil. Probá de nuevo.' }
  }

  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function getMyProfile(userId: string) {
  const [row] = await db.select().from(professionalProfile).where(eq(professionalProfile.userId, userId)).limit(1)
  return row ?? null
}
