import Link from 'next/link'
import { ShieldCheck, Wrench } from 'lucide-react'
import { AdminNav } from '@/components/admin/admin-nav'
import { SignOutButton } from '@/components/sign-out-button'
import { requireRole } from '@/lib/auth/session'

// Cada página del panel vuelve a validar el rol; esto es la primera barrera.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(['admin'], '/admin')

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/admin" className="flex items-center gap-2" aria-label="CONFIX administración">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Wrench className="size-5" aria-hidden="true" />
            </span>
            <span className="text-xl font-extrabold tracking-tight">CONFIX</span>
            <span className="hidden items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground sm:inline-flex">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Administración
            </span>
          </Link>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-16 pt-6">
        <AdminNav />
        {children}
        <div className="max-w-xs">
          <SignOutButton />
        </div>
      </main>
    </>
  )
}
