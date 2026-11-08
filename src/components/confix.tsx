import { Droplets, Hammer, PaintRoller, Star, Wrench, Zap, type LucideIcon } from 'lucide-react'
import { ETIQUETA_ESTADO_SOLICITUD, formatoPuntaje, type CategoriaId, type EstadoSolicitud } from '@/lib/tipos'

const iconos: Record<string, LucideIcon> = { plomeria: Droplets, electricidad: Zap, pintura: PaintRoller, carpinteria: Hammer }

/** Las categorías nuevas que cargue el admin usan una herramienta genérica. */
export function IconoCategoria({ id, className }: { id: CategoriaId; className?: string }) {
  const Icono = iconos[id] ?? Wrench
  return <Icono className={className} aria-hidden="true" />
}

const iniciales = (nombre: string) =>
  nombre.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('')

export function FotoProfesional({ nombre, foto, className = '' }: { nombre: string; foto: string; className?: string }) {
  return (
    <div className={`relative shrink-0 overflow-hidden bg-acento ${className}`}>
      {foto ? (
        <img src={foto} alt={`Foto de ${nombre}`} loading="lazy" className="size-full object-cover" />
      ) : (
        <span role="img" aria-label={`Iniciales de ${nombre}`} className="flex size-full items-center justify-center text-lg font-extrabold text-primario">
          {iniciales(nombre)}
        </span>
      )}
    </div>
  )
}

export function Puntaje({ valor, cantidad, className = '' }: { valor: number; cantidad?: number; className?: string }) {
  if (valor === 0) {
    return (
      <span className={`inline-flex items-center gap-1 text-sm font-semibold text-primario ${className}`}>
        <Star className="size-4" aria-hidden="true" /> Nuevo
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${className}`}>
      <Star className="size-4 fill-primario text-primario" aria-hidden="true" />
      <span>{formatoPuntaje(valor)}</span>
      {typeof cantidad === 'number' && <span className="font-normal text-suave">({cantidad})</span>}
      <span className="sr-only">de 5 estrellas</span>
    </span>
  )
}

export function Estrellas({ valor }: { valor: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className={`size-3.5 ${n <= Math.round(valor) ? 'fill-primario text-primario' : 'text-borde'}`} aria-hidden="true" />
      ))}
    </span>
  )
}

const ESTILO_ESTADO: Record<EstadoSolicitud, string> = {
  pendiente: 'bg-acento text-acento-texto',
  aceptada: 'bg-primario text-primario-texto',
  completada: 'bg-ok/15 text-ok',
  rechazada: 'bg-peligro/10 text-peligro',
  cancelada: 'bg-borde text-suave',
}
export function EstadoSolicitudEtiqueta({ estado }: { estado: EstadoSolicitud }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-bold ${ESTILO_ESTADO[estado]}`}>{ETIQUETA_ESTADO_SOLICITUD[estado]}</span>
}
