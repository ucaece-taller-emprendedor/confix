import type { Metadata } from 'next'
import Link from 'next/link'
import { RequestList } from '@/components/request-list'
import { getMyRequests } from '@/lib/actions/solicitudes'
import { requireRole } from '@/lib/auth/session'

export const metadata: Metadata = { title: 'Mis solicitudes | CONFIX' }

export default async function MisSolicitudesPage() {
  const user = await requireRole(['cliente', 'profesional'], '/app/mis-solicitudes')
  const requests = await getMyRequests(user.id)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pt-6">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Mis solicitudes</h1>
      <RequestList
        requests={requests}
        mode="cliente"
        emptyText="Todavía no enviaste ninguna solicitud. Buscá un profesional y pedí tu primera cotización."
      />
      <Link href="/app/buscar" className="flex h-14 items-center justify-center rounded-2xl bg-secondary text-base font-bold hover:bg-accent">
        Buscar profesionales
      </Link>
    </div>
  )
}
