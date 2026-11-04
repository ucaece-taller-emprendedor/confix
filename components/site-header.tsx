'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, MapPin, User, Wrench } from 'lucide-react'
import { BARRIOS } from '@/lib/data'
import type { SessionUser } from '@/lib/roles'
import { useRequestStore } from '@/lib/request-store'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/buscar', label: 'Buscar' },
  { href: '/solicitud', label: 'Mi solicitud' },
]

export function SiteHeader({ user }: { user: SessionUser | null }) {
  const pathname = usePathname()
  const { barrio, setBarrio, itemCount } = useRequestStore()

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="CONFIX, ir al inicio">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wrench className="size-5" aria-hidden="true" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-foreground">CONFIX</span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {link.label}
                {link.href === '/solicitud' && itemCount > 0 && (
                  <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                    {itemCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
        <label className="relative flex items-center">
          <span className="sr-only">Tu zona</span>
          <MapPin className="pointer-events-none absolute left-3 size-4 text-primary" aria-hidden="true" />
          <select
            value={barrio}
            onChange={(event) => setBarrio(event.target.value)}
            className="h-10 appearance-none rounded-full bg-secondary pl-9 pr-9 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {BARRIOS.map((item) => (
              <option key={item} value={item}>
                {item}, CABA
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 size-4 text-muted-foreground" aria-hidden="true" />
        </label>
        <Link
          href={user ? '/cuenta' : '/ingresar'}
          className="hidden h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 md:inline-flex"
        >
          <User className="size-4" aria-hidden="true" />
          {user ? user.name.split(' ')[0] : 'Ingresar'}
        </Link>
        </div>
      </div>
    </header>
  )
}
