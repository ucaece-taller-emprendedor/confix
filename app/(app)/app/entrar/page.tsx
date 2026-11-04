import { redirect } from 'next/navigation'
import { homeForRole, safeNextPath } from '@/lib/auth/roles'
import { getCurrentUser } from '@/lib/auth/session'

// Punto de llegada después de ingresar o registrarse (también vuelve acá Google):
// el rol se lee en el servidor y manda a cada uno a su panel.
export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const params = await searchParams
  const user = await getCurrentUser()
  if (!user) redirect('/app/ingresar')
  const next = safeNextPath(params.next, '')
  redirect(next || homeForRole(user.role))
}
