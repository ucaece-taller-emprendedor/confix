import Link from 'next/link'
import { ChevronRight, MapPin } from 'lucide-react'
import { ProfessionalPhoto } from '@/components/professional-photo'
import { Rating } from '@/components/rating'
import { formatDistance, formatPrice, type Professional } from '@/lib/data'
import { cn } from '@/lib/utils'

type CardProps = {
  professional: Professional
  className?: string
}

function Avatar({ professional, className, sizes }: { professional: Professional; className?: string; sizes: string }) {
  return <ProfessionalPhoto nombre={professional.nombre} foto={professional.foto} sizes={sizes} className={className} />
}

function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold',
        available ? 'bg-accent text-accent-foreground' : 'bg-background text-muted-foreground',
      )}
    >
      <span className={cn('size-1.5 rounded-full', available ? 'bg-primary' : 'bg-muted-foreground/60')} />
      {available ? 'Disponible hoy' : 'Desde mañana'}
    </span>
  )
}

export function ProfessionalCardVertical({ professional, className }: CardProps) {
  return (
    <Link
      href={`/app/profesional/${professional.id}`}
      className={cn(
        'group flex flex-col gap-3 rounded-3xl bg-secondary p-3 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring',
        className,
      )}
    >
      <Avatar professional={professional} className="aspect-square w-full rounded-2xl" sizes="(min-width: 768px) 240px, 60vw" />
      <div className="flex flex-col gap-1 px-1 pb-1">
        <h3 className="truncate text-base font-bold text-foreground">{professional.nombre}</h3>
        <p className="text-sm text-muted-foreground">{professional.oficio}</p>
        <div className="mt-1 flex items-center justify-between">
          <Rating value={professional.puntaje} count={professional.cantidadResenas} />
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <MapPin className="size-3.5 text-primary" aria-hidden="true" />
            {formatDistance(professional.distanciaKm)}
          </span>
        </div>
      </div>
    </Link>
  )
}

export function ProfessionalCardRow({ professional, className }: CardProps) {
  const minPrice = Math.min(...professional.servicios.map((s) => s.precio))

  return (
    <Link
      href={`/app/profesional/${professional.id}`}
      className={cn(
        'group flex items-center gap-4 rounded-3xl bg-secondary p-3 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring',
        className,
      )}
    >
      <Avatar professional={professional} className="size-24 shrink-0 rounded-2xl" sizes="96px" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-foreground">{professional.nombre}</h3>
            <p className="text-sm text-muted-foreground">
              {professional.oficio} · {professional.barrio}
            </p>
          </div>
          <ChevronRight className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Rating value={professional.puntaje} count={professional.cantidadResenas} />
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <MapPin className="size-3.5 text-primary" aria-hidden="true" />
            {formatDistance(professional.distanciaKm)}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <AvailabilityBadge available={professional.disponibleHoy} />
          <span className="text-xs text-muted-foreground">
            Desde <span className="text-sm font-bold text-foreground">{formatPrice(minPrice)}</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
