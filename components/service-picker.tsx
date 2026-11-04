'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, Wrench } from 'lucide-react'
import { formatPrice, type Professional } from '@/lib/data'
import { useRequestStore } from '@/lib/request-store'
import { cn } from '@/lib/utils'

export function ServicePicker({ professional }: { professional: Professional }) {
  const router = useRouter()
  const { setRequest } = useRequestStore()
  const [selected, setSelected] = useState<string[]>([professional.servicios[0].id])

  const subtotal = professional.servicios
    .filter((service) => selected.includes(service.id))
    .reduce((sum, service) => sum + service.precio, 0)

  function toggle(serviceId: string) {
    setSelected((current) =>
      current.includes(serviceId) ? current.filter((id) => id !== serviceId) : [...current, serviceId],
    )
  }

  function requestQuote() {
    if (selected.length === 0) return
    setRequest(professional.id, selected)
    router.push('/solicitud')
  }

  return (
    <>
      <section aria-labelledby="titulo-servicios" className="flex flex-col gap-3">
        <div>
          <h2 id="titulo-servicios" className="flex items-center gap-2 text-lg font-bold">
            <Wrench className="size-5 text-primary" aria-hidden="true" />
            Servicios
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Elegí uno o más servicios para tu cotización.</p>
        </div>
        <ul className="flex flex-col gap-3">
          {professional.servicios.map((service) => {
            const checked = selected.includes(service.id)
            return (
              <li key={service.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggle(service.id)}
                  className={cn(
                    'flex w-full items-center gap-4 rounded-3xl border-2 p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                    checked ? 'border-primary bg-accent' : 'border-transparent bg-secondary hover:bg-accent/60',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                      checked ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40 bg-background',
                    )}
                  >
                    {checked && <Check className="size-4" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold text-foreground">{service.nombre}</span>
                    <span className="block text-sm text-muted-foreground">{service.detalle}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-base font-extrabold text-foreground">{formatPrice(service.precio)}</span>
                    <span className="block text-xs text-muted-foreground">{service.unidad}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {selected.length === 0
                ? 'Elegí un servicio'
                : `${selected.length} ${selected.length === 1 ? 'servicio' : 'servicios'} · desde`}
            </p>
            <p className="text-lg font-extrabold">{formatPrice(subtotal)}</p>
          </div>
          <button
            type="button"
            onClick={requestQuote}
            disabled={selected.length === 0}
            className="h-14 flex-1 rounded-2xl bg-primary text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            Pedir cotización
          </button>
        </div>
      </div>
    </>
  )
}
