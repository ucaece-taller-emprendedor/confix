import type { Metadata } from 'next'
import { desc } from 'drizzle-orm'
import { StatusBadge } from '@/components/status-badge'
import { requireRole } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { serviceRequest } from '@/lib/db/schema'
import { formatPrice } from '@/lib/data'
import { toRequestStatus } from '@/lib/requests'

export const metadata: Metadata = { title: 'Solicitudes | Administración CONFIX' }

export default async function AdminSolicitudesPage() {
  await requireRole(['admin'], '/admin/solicitudes')
  const rows = await db.select().from(serviceRequest).orderBy(desc(serviceRequest.createdAt)).limit(100)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Solicitudes</h1>
      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary p-4">
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-primary">{row.id}</p>
              <p className="font-bold">
                {row.contactoNombre} → {row.professionalNombre}
              </p>
              <p className="text-sm text-muted-foreground">{row.direccion}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold">{formatPrice(row.total)}</span>
              <StatusBadge status={toRequestStatus(row.estado)} />
            </div>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="rounded-3xl bg-secondary px-6 py-10 text-center text-sm text-muted-foreground">Todavía no hay solicitudes.</li>
        )}
      </ul>
    </div>
  )
}
