import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BadgeCheck, Briefcase, CalendarDays, Clock, MapPin, MessageCircle } from 'lucide-react'
import { BackButton } from '@/components/back-button'
import { ProfessionalPhoto } from '@/components/professional-photo'
import { Rating, Stars } from '@/components/rating'
import { ServicePicker } from '@/components/service-picker'
import { getProfessionalById } from '@/lib/catalog'
import { formatDistance, formatRating, type WeekDay } from '@/lib/data'
import { cn } from '@/lib/utils'

const WEEK: WeekDay[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const professional = await getProfessionalById(id)
  if (!professional) return { title: 'Profesional no encontrado | CONFIX' }
  return {
    title: `${professional.nombre}, ${professional.oficio.toLowerCase()} | CONFIX`,
    description: professional.descripcion.slice(0, 150),
  }
}

export default async function ProfessionalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const professional = await getProfessionalById(id)
  if (!professional) notFound()

  const stats = [
    { label: 'Años de experiencia', value: professional.nuevo ? '—' : `${professional.anosExperiencia}` },
    { label: 'Trabajos realizados', value: `${professional.trabajosRealizados}` },
    { label: 'Calificación', value: professional.nuevo ? 'Nuevo' : formatRating(professional.puntaje) },
  ]

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-32 pt-4">
      <BackButton fallbackHref="/app/buscar" />

      <section aria-labelledby="nombre-profesional" className="flex flex-col items-center gap-4 rounded-3xl bg-secondary p-6 text-center sm:flex-row sm:text-left">
        <ProfessionalPhoto
          nombre={professional.nombre}
          foto={professional.foto}
          sizes="144px"
          priority
          className="size-32 rounded-3xl sm:size-36"
        />
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-semibold text-primary">
            <BadgeCheck className="size-4" aria-hidden="true" />
            Profesional verificado
          </span>
          <h1 id="nombre-profesional" className="text-2xl font-extrabold tracking-tight md:text-3xl">
            {professional.nombre}
          </h1>
          <p className="text-base text-muted-foreground">{professional.oficio}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-start">
            <Rating value={professional.puntaje} count={professional.cantidadResenas} />
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              {professional.barrio} · a {formatDistance(professional.distanciaKm)}
            </span>
          </div>
        </div>
      </section>

      <dl className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1 rounded-3xl bg-secondary px-2 py-4 text-center">
            <dt className="order-2 text-xs font-medium text-muted-foreground">{stat.label}</dt>
            <dd className="order-1 text-xl font-extrabold text-primary">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="titulo-sobre" className="flex flex-col gap-3">
        <h2 id="titulo-sobre" className="text-lg font-bold">
          Sobre {professional.nombre.split(' ')[0]}
        </h2>
        <p className="text-pretty leading-relaxed text-muted-foreground">{professional.descripcion}</p>
        <p className="inline-flex items-center gap-2 text-sm font-medium">
          <MessageCircle className="size-4 text-primary" aria-hidden="true" />
          {professional.respuesta}
        </p>
      </section>

      <section aria-labelledby="titulo-disponibilidad" className="flex flex-col gap-3 rounded-3xl bg-secondary p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 id="titulo-disponibilidad" className="flex items-center gap-2 text-lg font-bold">
            <CalendarDays className="size-5 text-primary" aria-hidden="true" />
            Disponibilidad
          </h2>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold',
              professional.disponibleHoy ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground',
            )}
          >
            {professional.disponibleHoy ? 'Disponible hoy' : 'Desde mañana'}
          </span>
        </div>
        <ul className="grid grid-cols-7 gap-1.5">
          {WEEK.map((day) => {
            const active = professional.dias.includes(day)
            return (
              <li
                key={day}
                className={cn(
                  'flex h-11 items-center justify-center rounded-xl text-xs font-bold sm:text-sm',
                  active ? 'bg-accent text-accent-foreground' : 'bg-background text-muted-foreground/60 line-through',
                )}
              >
                {day}
                <span className="sr-only">{active ? ' disponible' : ' no disponible'}</span>
              </li>
            )
          })}
        </ul>
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4 text-primary" aria-hidden="true" />
          Horario de atención: {professional.horario}
        </p>
      </section>

      <ServicePicker professional={professional} />

      <section aria-labelledby="titulo-resenas" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 id="titulo-resenas" className="flex items-center gap-2 text-lg font-bold">
            <Briefcase className="size-5 text-primary" aria-hidden="true" />
            Reseñas
          </h2>
          <span className="text-sm text-muted-foreground">{professional.cantidadResenas} opiniones</span>
        </div>
        {professional.resenas.length === 0 && (
          <p className="rounded-3xl bg-secondary p-4 text-sm text-muted-foreground">
            Todavía no tiene reseñas. Después de tu primer trabajo con {professional.nombre.split(' ')[0]} vas a poder dejar la tuya.
          </p>
        )}
        <ul className="flex flex-col gap-3">
          {professional.resenas.map((review) => (
            <li key={`${review.autor}-${review.fecha}`} className="flex flex-col gap-2 rounded-3xl bg-secondary p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                    {review.autor.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{review.autor}</p>
                    <p className="text-xs text-muted-foreground">{review.fecha}</p>
                  </div>
                </div>
                <Stars value={review.puntaje} />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{review.texto}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
