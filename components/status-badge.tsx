import { REQUEST_STATUS_LABELS, type RequestStatus } from '@/lib/requests'
import { cn } from '@/lib/utils'

const STYLES: Record<RequestStatus, string> = {
  pendiente: 'bg-accent text-accent-foreground',
  aceptada: 'bg-primary text-primary-foreground',
  completada: 'bg-emerald-100 text-emerald-800',
  rechazada: 'bg-destructive/10 text-destructive',
  cancelada: 'bg-muted text-muted-foreground',
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-bold', STYLES[status])}>
      {REQUEST_STATUS_LABELS[status]}
    </span>
  )
}
