'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardList, Home, Search, User } from 'lucide-react'
import type { SessionUser } from '@/lib/auth/roles'
import { useRequestStore } from '@/lib/request-store'
import { cn } from '@/lib/utils'

export function BottomNav({ user }: { user: SessionUser | null }) {
  const pathname = usePathname()
  const { itemCount } = useRequestStore()

  const items = [
    { href: '/app', label: 'Inicio', icon: Home },
    { href: '/app/buscar', label: 'Buscar', icon: Search },
    { href: '/app/solicitud', label: 'Solicitud', icon: ClipboardList },
    user
      ? { href: '/app/cuenta', label: 'Cuenta', icon: User }
      : { href: '/app/ingresar', label: 'Ingresar', icon: User },
  ]

  if (pathname.startsWith('/app/profesional/')) return null

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex h-16 max-w-md items-stretch justify-around px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === '/app' ? pathname === '/app' : pathname.startsWith(href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <span
                  className={cn(
                    'relative flex h-8 w-14 items-center justify-center rounded-full transition-colors',
                    active && 'bg-accent',
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {href === '/app/solicitud' && itemCount > 0 && (
                    <span className="absolute -right-0.5 -top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {itemCount}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
