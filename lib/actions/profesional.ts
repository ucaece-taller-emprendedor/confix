'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { checkRole } from '@/lib/auth/session'
import { getBarrios, getCategories } from '@/lib/catalog'
import { SERVICE_UNITS } from '@/lib/data'
import { db } from '@/lib/db'
import { professionalProfile, user, type StoredService } from '@/lib/db/schema'
import { primerError } from '@/lib/validations'
import { perfilSchema, type PerfilInput } from '@/lib/validations/profesional'

export type ProfileInput = PerfilInput

export type ProfileResult = { ok: true } | { ok: false; error: string }

function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
}

/**
 * Crea o actualiza el perfil del profesional. El perfil nuevo queda en estado "pendiente"
 * hasta que un administrador lo apruebe; editarlo no cambia el estado.
 */
export async function saveProfessionalProfile(input: ProfileInput): Promise<ProfileResult> {
  const guard = await checkRole(['cliente', 'profesional'])
  if (!guard.ok) {
    const admin = guard.error !== 'Iniciá sesión para continuar.'
    return { ok: false, error: admin ? 'Las cuentas de administración no pueden ofrecer servicios.' : guard.error }
  }
  const current = guard.user

  const parsed = perfilSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: primerError(parsed.error) }
  const datos = parsed.data

  const [categorias, barrios] = await Promise.all([getCategories(), getBarrios()])
  if (!categorias.some((c) => c.id === datos.categoria)) return { ok: false, error: 'Elegí una categoría.' }
  if (!barrios.includes(datos.barrio)) return { ok: false, error: 'Elegí tu barrio.' }

  const [existing] = await db.select().from(professionalProfile).where(eq(professionalProfile.userId, current.id)).limit(1)
  const profileId = existing?.id ?? `${slugify(datos.nombre) || 'profesional'}-${randomBytes(2).toString('hex')}`

  const servicios: StoredService[] = datos.servicios.map((service, index) => ({
    id: `${profileId}-${index + 1}`,
    nombre: service.nombre,
    detalle: service.detalle,
    precio: service.precio,
    unidad: SERVICE_UNITS.includes(service.unidad) ? service.unidad : SERVICE_UNITS[0],
  }))

  const values = {
    nombre: datos.nombre,
    categoria: datos.categoria,
    oficio: datos.oficio,
    barrio: datos.barrio,
    horario: datos.horario,
    costoVisita: datos.costoVisita,
    descripcion: datos.descripcion,
    servicios,
  }

  try {
    if (existing) {
      await db.update(professionalProfile).set(values).where(eq(professionalProfile.id, existing.id))
    } else {
      await db.transaction(async (tx) => {
        await tx.insert(professionalProfile).values({ id: profileId, userId: current.id, ...values })
        await tx.update(user).set({ role: 'profesional', updatedAt: new Date() }).where(eq(user.id, current.id))
      })
    }
  } catch (error) {
    console.error('No se pudo guardar el perfil profesional', error)
    return { ok: false, error: 'No pudimos guardar tu perfil. Probá de nuevo.' }
  }

  revalidatePath('/app', 'layout')
  revalidatePath('/admin', 'layout')
  return { ok: true }
}

export async function getMyProfile(userId: string) {
  const guard = await checkRole(['cliente', 'profesional', 'admin'])
  if (!guard.ok || (guard.user.id !== userId && guard.user.role !== 'admin')) return null
  const [row] = await db.select().from(professionalProfile).where(eq(professionalProfile.userId, userId)).limit(1)
  return row ?? null
}
