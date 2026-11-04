import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Wrench } from 'lucide-react'
import { AdminLoginForm } from '@/components/admin/admin-login-form'
import { getCurrentUser } from '@/lib/auth/session'

export const metadata: Metadata = {
  title: 'Ingreso de administración | CONFIX',
  robots: { index: false },
}

export default async function AdminLoginPage() {
  const user = await getCurrentUser()
  if (user?.role === 'admin') redirect('/admin')

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-4 py-10">
      <Link href="/" className="flex items-center gap-2" aria-label="CONFIX, ir al inicio">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Wrench className="size-5" aria-hidden="true" />
        </span>
        <span className="text-xl font-extrabold tracking-tight">CONFIX</span>
      </Link>
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Administración</h1>
        <p className="mt-2 text-muted-foreground">Acceso solo para cuentas de administración.</p>
      </div>
      <AdminLoginForm />
    </main>
  )
}
