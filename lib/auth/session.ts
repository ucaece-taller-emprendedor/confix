import { cache } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { homeForRole, toRole, type Role, type SessionUser } from '@/lib/auth/roles'

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return null
    const { id, name, email } = session.user
    return { id, name, email, role: toRole((session.user as { role?: unknown }).role) }
  } catch {
    return null
  }
})

type Guard = { ok: true; user: SessionUser } | { ok: false; error: string }

/**
 * Autorización para server actions y endpoints: verifica sesión y rol en el servidor.
 * Nunca confiar en que la interfaz oculte botones.
 */
export async function checkRole(roles: Role[]): Promise<Guard> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Iniciá sesión para continuar.' }
  if (!roles.includes(user.role)) return { ok: false, error: 'No tenés permisos para hacer esto.' }
  return { ok: true, user }
}

/**
 * Autorización para páginas y layouts: si no hay sesión manda al login del área,
 * y si el rol no alcanza lo manda a su propio panel.
 */
export async function requireRole(roles: Role[], next: string): Promise<SessionUser> {
  const area = next.startsWith('/admin') ? 'admin' : 'app'
  const user = await getCurrentUser()
  if (!user) {
    redirect(area === 'admin' ? '/admin/login' : `/app/ingresar?next=${encodeURIComponent(next)}`)
  }
  if (!roles.includes(user.role)) redirect(area === 'admin' ? '/app' : homeForRole(user.role))
  return user
}

/** Cualquier usuario con sesión (cliente, profesional o admin). */
export function requireUser(next: string) {
  return requireRole(['cliente', 'profesional', 'admin'], next)
}
