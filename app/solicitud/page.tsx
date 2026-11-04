import type { Metadata } from 'next'
import { RequestFlow } from '@/components/request-flow'
import { getCurrentUser } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Mi solicitud | CONFIX',
  description: 'Revisá el resumen de tu servicio, completá la dirección y confirmá tu solicitud de cotización.',
}

export default async function RequestPage() {
  const user = await getCurrentUser()
  return <RequestFlow user={user ? { id: user.id, name: user.name } : null} />
}
