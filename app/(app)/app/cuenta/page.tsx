import type { Metadata } from 'next'
import Link from 'next/link'
import { ClipboardList, ShieldCheck, Store } from 'lucide-react'
import { SignOutButton } from '@/components/sign-out-button'
import { ROLE_LABELS } from '@/lib/auth/roles'
import { requireUser } from '@/lib/auth/session'

export const metadata: Metadata = { title: 'Mi cuenta | CONFIX' }

const linkClass = 'flex h-14 items-center gap-3 rounded-2xl bg-secondary px-4 text-base font-bold hover:bg-accent'

export default async function CuentaPage() {
  const user = await requireUser('/app/cuenta')

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 pt-6">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Mi cuenta</h1>

      <section className="flex flex-col gap-1 rounded-3xl bg-secondary p-5" aria-label="Datos de la cuenta">
        <p className="text-lg font-bold">{user.name}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <p className="mt-2 inline-flex w-fit rounded-full bg-background px-3 py-1 text-xs font-bold text-primary">
          {ROLE_LABELS[user.role]}
        </p>
      </section>

      <nav className="flex flex-col gap-3" aria-label="Accesos de la cuenta">
        {user.role !== 'admin' && (
          <Link href="/app/mis-solicitudes" className={linkClass}>
            <ClipboardList className="size-5 text-primary" aria-hidden="true" />
            Mis solicitudes
          </Link>
        )}
        {user.role !== 'admin' && (
          <Link href="/app/panel" className={linkClass}>
            <Store className="size-5 text-primary" aria-hidden="true" />
            {user.role === 'profesional' ? 'Mi panel profesional' : 'Quiero ofrecer mis servicios'}
          </Link>
        )}
        {user.role === 'admin' && (
          <Link href="/admin" className={linkClass}>
            <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
            Ir al panel de administración
          </Link>
        )}
      </nav>

      <SignOutButton />
    </div>
  )
}
