'use client'

import Link from 'next/link'
import { CalendarDays, CheckCircle2, Clock, MapPin } from 'lucide-react'
import { ProfessionalPhoto } from '@/components/professional-photo'
import { useCatalog } from '@/lib/catalog-context'
import { formatPrice } from '@/lib/data'
import type { SubmittedRequest } from '@/lib/requests'

export function RequestSuccess({ request }: { request: SubmittedRequest }) {
  const { getProfessional } = useCatalog()
  const professional = getProfessional(request.professionalId)

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 pt-10 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-accent">
        <CheckCircle2 className="size-10 text-primary" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-balance text-3xl font-extrabold tracking-tight">¡Solicitud enviada!</h1>
        <p className="text-pretty text-muted-foreground">
          {request.professionalNombre.split(' ')[0]} recibió tu pedido y te va a contactar por teléfono para enviarte la cotización final.
        </p>
      </div>

      <div className="flex w-full flex-col gap-4 rounded-3xl bg-secondary p-5 text-left">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-muted-foreground">Número de solicitud</p>
          <p className="rounded-full bg-background px-3 py-1 text-sm font-extrabold text-primary">{request.id}</p>
        </div>

        {professional && (
          <div className="flex items-center gap-3 rounded-2xl bg-background p-3">
            <ProfessionalPhoto nombre={professional.nombre} foto={professional.foto} sizes="56px" className="size-14 rounded-xl" />
            <div>
              <p className="font-bold">{professional.nombre}</p>
              <p className="text-sm text-muted-foreground">{professional.oficio}</p>
            </div>
          </div>
        )}

        <ul className="flex flex-col gap-1.5 text-sm">
          {request.items.map((item) => (
            <li key={item.nombre} className="flex justify-between gap-3">
              <span>
                {item.cantidad} × {item.nombre}
              </span>
              <span className="font-semibold">{formatPrice(item.precio * item.cantidad)}</span>
            </li>
          ))}
          <li className="flex justify-between gap-3 text-muted-foreground">
            <span>Visita y traslado</span>
            <span className="font-semibold text-foreground">{formatPrice(request.costoVisita)}</span>
          </li>
          <li className="mt-2 flex items-baseline justify-between gap-3 border-t border-border pt-3">
            <span className="font-bold">Total estimado</span>
            <span className="text-xl font-extrabold text-primary">{formatPrice(request.total)}</span>
          </li>
        </ul>

        <ul className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
          <li className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            {request.direccion}
          </li>
          <li className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="first-letter:uppercase">{request.fecha}</span>
          </li>
          <li className="flex items-start gap-2">
            <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            {request.franja}
          </li>
        </ul>
      </div>

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="flex h-14 items-center justify-center rounded-2xl bg-primary text-base font-bold text-primary-foreground hover:opacity-90 sm:flex-1"
        >
          Volver al inicio
        </Link>
        <Link
          href="/mis-solicitudes"
          className="flex h-14 items-center justify-center rounded-2xl bg-secondary text-base font-bold hover:bg-accent sm:flex-1"
        >
          Ver mis solicitudes
        </Link>
      </div>
    </div>
  )
}
