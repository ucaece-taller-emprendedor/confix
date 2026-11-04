import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import { getCurrentUser } from '@/lib/auth/session'
import { homeForRole, safeNextPath } from '@/lib/auth/roles'
import { googleHabilitado } from '@/lib/env'

export const metadata: Metadata = {
  title: 'Crear cuenta | CONFIX',
  description: 'Registrate en CONFIX como cliente o como profesional.',
}

export default async function RegistroPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const params = await searchParams
  const next = safeNextPath(params.next)
  const user = await getCurrentUser()
  if (user) redirect(next !== '/app' ? next : homeForRole(user.role))

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 pt-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Crear cuenta</h1>
        <p className="mt-2 text-muted-foreground">Es gratis. Elegí si vas a contratar o a ofrecer servicios.</p>
      </div>
      <AuthForm mode="registro" next={next} googleEnabled={googleHabilitado} />
    </div>
  )
}
