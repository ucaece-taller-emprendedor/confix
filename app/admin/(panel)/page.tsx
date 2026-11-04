import type { Metadata } from 'next'
import Link from 'next/link'
import { count, eq } from 'drizzle-orm'
import { requireRole } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { professionalProfile, serviceRequest, user } from '@/lib/db/schema'

export const metadata: Metadata = { title: 'Administración | CONFIX' }

async function total(query: Promise<{ total: number }[]>) {
  return (await query)[0]?.total ?? 0
}

export default async function AdminHomePage() {
  await requireRole(['admin'], '/admin')

  const [usuarios, pendientes, aprobados, solicitudes] = await Promise.all([
    total(db.select({ total: count() }).from(user)),
    total(db.select({ total: count() }).from(professionalProfile).where(eq(professionalProfile.estado, 'pendiente'))),
    total(db.select({ total: count() }).from(professionalProfile).where(eq(professionalProfile.estado, 'aprobado'))),
    total(db.select({ total: count() }).from(serviceRequest)),
  ])

  const cards = [
    { label: 'Usuarios', value: usuarios, href: '/admin/usuarios' },
    { label: 'Profesionales pendientes', value: pendientes, href: '/admin/profesionales', destacado: pendientes > 0 },
    { label: 'Profesionales aprobados', value: aprobados, href: '/admin/profesionales' },
    { label: 'Solicitudes', value: solicitudes, href: '/admin/solicitudes' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Resumen</h1>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((card) => (
          <li key={card.label}>
            <Link
              href={card.href}
              className={`flex h-full flex-col gap-1 rounded-3xl p-5 transition-colors hover:bg-accent ${card.destacado ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary'}`}
            >
              <span className="text-3xl font-extrabold">{card.value}</span>
              <span className="text-sm font-semibold">{card.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
