'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { CalendarDays, MapPin, Phone } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { updateRequestStatus } from '@/lib/actions/solicitudes'
import { formatPrice } from '@/lib/data'
import type { ReceivedRequest, RequestStatus, SubmittedRequest } from '@/lib/requests'

type Action = { next: RequestStatus; label: string; primary?: boolean }

function actionsFor(mode: 'cliente' | 'profesional', status: RequestStatus): Action[] {
  if (mode === 'cliente') return status === 'pendiente' || status === 'aceptada' ? [{ next: 'cancelada', label: 'Cancelar solicitud' }] : []
  if (status === 'pendiente') return [{ next: 'aceptada', label: 'Aceptar', primary: true }, { next: 'rechazada', label: 'Rechazar' }]
  if (status === 'aceptada') return [{ next: 'completada', label: 'Marcar como completada', primary: true }, { next: 'rechazada', label: 'Rechazar' }]
  return []
}

export function RequestList({
  requests,
  mode,
  emptyText,
}: {
  requests: (SubmittedRequest | ReceivedRequest)[]
  mode: 'cliente' | 'profesional'
  emptyText: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function change(id: string, next: RequestStatus) {
    setError('')
    startTransition(async () => {
      const result = await updateRequestStatus(id, next)
      if (!result.ok) setError(result.error ?? 'No pudimos actualizar la solicitud.')
      router.refresh()
    })
  }

  if (requests.length === 0) {
    return <p className="rounded-3xl bg-secondary px-6 py-10 text-center text-sm text-muted-foreground">{emptyText}</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
      <ul className="flex flex-col gap-3">
        {requests.map((request) => (
          <li key={request.id} className="flex flex-col gap-3 rounded-3xl bg-secondary p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-primary">{request.id}</p>
                <p className="font-bold">{mode === 'cliente' ? request.professionalNombre : request.contacto.nombre}</p>
              </div>
              <StatusBadge status={request.estado} />
            </div>
            <ul className="flex flex-col gap-1 text-sm">
              {request.items.map((item) => (
                <li key={item.nombre} className="flex justify-between gap-3">
                  <span>
                    {item.cantidad} × {item.nombre}
                  </span>
                  <span className="font-semibold">{formatPrice(item.precio * item.cantidad)}</span>
                </li>
              ))}
              <li className="mt-1 flex justify-between gap-3 border-t border-border pt-2 font-bold">
                <span>Total estimado</span>
                <span className="text-primary">{formatPrice(request.total)}</span>
              </li>
            </ul>
            <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {request.direccion}
              </li>
              <li className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="first-letter:uppercase">
                  {request.fecha} · {request.franja}
                </span>
              </li>
              {mode === 'profesional' && (
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {request.contacto.telefono}
                </li>
              )}
              {request.notas && <li className="italic">“{request.notas}”</li>}
            </ul>
            {actionsFor(mode, request.estado).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {actionsFor(mode, request.estado).map((action) => (
                  <button
                    key={action.next}
                    type="button"
                    disabled={pending}
                    onClick={() => change(request.id, action.next)}
                    className={
                      action.primary
                        ? 'h-11 rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60'
                        : 'h-11 rounded-2xl bg-background px-5 text-sm font-bold hover:bg-accent disabled:opacity-60'
                    }
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
