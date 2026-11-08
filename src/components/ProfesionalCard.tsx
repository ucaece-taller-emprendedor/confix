import { ChevronRight, MapPin } from 'lucide-react'
import { Link } from 'react-router'
import { formatoDistancia, formatoPrecio, type Profesional } from '@/lib/tipos'
import { FotoProfesional, Puntaje } from './confix'

function Disponibilidad({ disponible }: { disponible: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${disponible ? 'bg-acento text-acento-texto' : 'bg-fondo text-suave'}`}>
      <span className={`size-1.5 rounded-full ${disponible ? 'bg-primario' : 'bg-suave/60'}`} />
      {disponible ? 'Disponible hoy' : 'Desde mañana'}
    </span>
  )
}

export function ProfesionalVertical({ p }: { p: Profesional }) {
  return (
    <Link to={`/app/profesional/${p.id}`} className="group flex flex-col gap-3 rounded-3xl bg-secundario p-3 transition-colors hover:bg-acento">
      <FotoProfesional nombre={p.nombre} foto={p.foto} className="aspect-square w-full rounded-2xl" />
      <div className="flex flex-col gap-1 px-1 pb-1">
        <h3 className="truncate text-base font-bold">{p.nombre}</h3>
        <p className="text-sm text-suave">{p.oficio}</p>
        <div className="mt-1 flex items-center justify-between">
          <Puntaje valor={p.puntaje} cantidad={p.cantidadResenas} />
          <span className="inline-flex items-center gap-1 text-xs font-medium text-suave">
            <MapPin className="size-3.5 text-primario" aria-hidden="true" />
            {formatoDistancia(p.distanciaKm)}
          </span>
        </div>
      </div>
    </Link>
  )
}

export function ProfesionalFila({ p }: { p: Profesional }) {
  const minimo = Math.min(...p.servicios.map(s => s.precio))
  return (
    <Link to={`/app/profesional/${p.id}`} className="group flex items-center gap-4 rounded-3xl bg-secundario p-3 transition-colors hover:bg-acento">
      <FotoProfesional nombre={p.nombre} foto={p.foto} className="size-24 rounded-2xl" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold">{p.nombre}</h3>
            <p className="text-sm text-suave">{p.oficio} · {p.barrio}</p>
          </div>
          <ChevronRight className="mt-1 size-5 shrink-0 text-primario" aria-hidden="true" />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Puntaje valor={p.puntaje} cantidad={p.cantidadResenas} />
          <span className="inline-flex items-center gap-1 text-xs font-medium text-suave">
            <MapPin className="size-3.5 text-primario" aria-hidden="true" />
            {formatoDistancia(p.distanciaKm)}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <Disponibilidad disponible={p.disponibleHoy} />
          <span className="text-xs text-suave">Desde <span className="text-sm font-bold text-texto">{formatoPrecio(minimo)}</span></span>
        </div>
      </div>
    </Link>
  )
}
