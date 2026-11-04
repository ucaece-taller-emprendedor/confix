import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import { getCurrentUser } from '@/lib/auth/session'
import { homeForRole, safeNextPath } from '@/lib/auth/roles'
import { googleHabilitado } from '@/lib/env'

export const metadata: Metadata = {
  title: 'Ingresar | CONFIX',
  description: 'Ingresá a tu cuenta de CONFIX para pedir cotizaciones y seguir tus solicitudes.',
}

export default async function IngresarPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const params = await searchParams
  const next = safeNextPath(params.next)
  const user = await getCurrentUser()
  if (user) redirect(next !== '/app' ? next : homeForRole(user.role))

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 pt-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Ingresar</h1>
        <p className="mt-2 text-muted-foreground">Entrá a tu cuenta para pedir cotizaciones y seguir tus solicitudes.</p>
      </div>
      <AuthForm mode="ingresar" next={next} googleEnabled={googleHabilitado} />
    </div>
  )
}
