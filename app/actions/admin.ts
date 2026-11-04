'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { professionalProfile, user } from '@/lib/db/schema'
import { ROLES, type Role } from '@/lib/roles'
import { getCurrentUser } from '@/lib/session'

type Result = { ok: boolean; error?: string }

async function requireAdmin() {
  const current = await getCurrentUser()
  return current?.role === 'admin' ? current : null
}

export async function setUserRole(userId: string, role: Role): Promise<Result> {
  const admin = await requireAdmin()
  if (!admin) return { ok: false, error: 'No tenés permisos para hacer esto.' }
  if (!ROLES.includes(role)) return { ok: false, error: 'Rol inválido.' }
  if (userId === admin.id) return { ok: false, error: 'No podés cambiar tu propio rol.' }

  await db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.id, String(userId)))
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function setProfessionalStatus(profileId: string, estado: 'aprobado' | 'suspendido' | 'pendiente'): Promise<Result> {
  const admin = await requireAdmin()
  if (!admin) return { ok: false, error: 'No tenés permisos para hacer esto.' }
  if (!['aprobado', 'suspendido', 'pendiente'].includes(estado)) return { ok: false, error: 'Estado inválido.' }

  await db.update(professionalProfile).set({ estado }).where(eq(professionalProfile.id, String(profileId)))
  revalidatePath('/', 'layout')
  return { ok: true }
}
