import { cache } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { toRole, type Role, type SessionUser } from '@/lib/roles'

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

export async function requireUser(next: string, roles?: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) redirect(`/ingresar?next=${encodeURIComponent(next)}`)
  if (roles && !roles.includes(user.role)) redirect('/cuenta')
  return user
}
