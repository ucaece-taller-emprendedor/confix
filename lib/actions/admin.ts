'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { checkRole } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { barrio, categoria, professionalProfile, user } from '@/lib/db/schema'
import { primerError } from '@/lib/validations'
import { barrioSchema, categoriaSchema, estadoProfesionalSchema, rolSchema } from '@/lib/validations/admin'

type Result = { ok: boolean; error?: string }

// Toda acción de este archivo exige rol admin validado en el servidor.
function refrescar() {
  revalidatePath('/admin', 'layout')
  revalidatePath('/app', 'layout')
}

export async function setUserRole(userId: string, role: string): Promise<Result> {
  const guard = await checkRole(['admin'])
  if (!guard.ok) return guard
  const rol = rolSchema.safeParse(role)
  if (!rol.success) return { ok: false, error: 'Rol inválido.' }
  if (userId === guard.user.id) return { ok: false, error: 'No podés cambiar tu propio rol.' }

  const updated = await db.update(user).set({ role: rol.data, updatedAt: new Date() }).where(eq(user.id, String(userId))).returning({ id: user.id })
  if (updated.length === 0) return { ok: false, error: 'No encontramos al usuario.' }
  refrescar()
  return { ok: true }
}

export async function setProfessionalStatus(profileId: string, estado: string): Promise<Result> {
  const guard = await checkRole(['admin'])
  if (!guard.ok) return guard
  const nuevo = estadoProfesionalSchema.safeParse(estado)
  if (!nuevo.success) return { ok: false, error: 'Estado inválido.' }

  const updated = await db
    .update(professionalProfile)
    .set({ estado: nuevo.data })
    .where(eq(professionalProfile.id, String(profileId)))
    .returning({ id: professionalProfile.id })
  if (updated.length === 0) return { ok: false, error: 'No encontramos al profesional.' }
  refrescar()
  return { ok: true }
}

export async function createCategory(input: { id: string; nombre: string; descripcion: string }): Promise<Result> {
  const guard = await checkRole(['admin'])
  if (!guard.ok) return guard
  const parsed = categoriaSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: primerError(parsed.error) }

  const [existente] = await db.select({ id: categoria.id }).from(categoria).where(eq(categoria.id, parsed.data.id)).limit(1)
  if (existente) return { ok: false, error: 'Ya existe una categoría con ese identificador.' }

  const todas = await db.select({ id: categoria.id }).from(categoria)
  await db.insert(categoria).values({ ...parsed.data, orden: todas.length + 1 })
  refrescar()
  return { ok: true }
}

export async function setCategoryActive(id: string, activa: boolean): Promise<Result> {
  const guard = await checkRole(['admin'])
  if (!guard.ok) return guard
  await db.update(categoria).set({ activa: Boolean(activa) }).where(eq(categoria.id, String(id)))
  refrescar()
  return { ok: true }
}

export async function createBarrio(input: { nombre: string }): Promise<Result> {
  const guard = await checkRole(['admin'])
  if (!guard.ok) return guard
  const parsed = barrioSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: primerError(parsed.error) }

  const [existente] = await db.select({ nombre: barrio.nombre }).from(barrio).where(eq(barrio.nombre, parsed.data.nombre)).limit(1)
  if (existente) return { ok: false, error: 'Ese barrio ya existe.' }

  const todos = await db.select({ nombre: barrio.nombre }).from(barrio)
  await db.insert(barrio).values({ nombre: parsed.data.nombre, orden: todos.length + 1 })
  refrescar()
  return { ok: true }
}

export async function setBarrioActive(nombre: string, activo: boolean): Promise<Result> {
  const guard = await checkRole(['admin'])
  if (!guard.ok) return guard
  await db.update(barrio).set({ activo: Boolean(activo) }).where(eq(barrio.nombre, String(nombre)))
  refrescar()
  return { ok: true }
}
