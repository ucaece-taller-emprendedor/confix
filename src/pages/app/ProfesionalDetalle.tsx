import { BadgeCheck, Briefcase, CalendarDays, Check, ChevronLeft, Clock, MapPin, MessageCircle, Wrench } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Estrellas, FotoProfesional, Puntaje } from '@/components/confix'
import { Cargando } from '@/components/ui'
import { useCatalogo } from '@/lib/CatalogoContext'
import { useSolicitud } from '@/lib/SolicitudContext'
import { formatoDistancia, formatoPrecio, formatoPuntaje, SEMANA, type Profesional } from '@/lib/tipos'

function Servicios({ p }: { p: Profesional }) {
  const navegar = useNavigate()
  const { armar } = useSolicitud()
  const [elegidos, setElegidos] = useState<string[]>([p.servicios[0]?.id ?? ''])
  const subtotal = p.servicios.filter(s => elegidos.includes(s.id)).reduce((t, s) => t + s.precio, 0)
  const alternar = (id: string) => setElegidos(a => (a.includes(id) ? a.filter(x => x !== id) : [...a, id]))

  return (
    <>
      <section aria-labelledby="titulo-servicios" className="flex flex-col gap-3">
        <div>
          <h2 id="titulo-servicios" className="flex items-center gap-2 text-lg font-bold"><Wrench className="size-5 text-primario" aria-hidden="true" /> Servicios</h2>
          <p className="mt-1 text-sm text-suave">Elegí uno o más servicios para tu cotización.</p>
        </div>
        <ul className="flex flex-col gap-3">
          {p.servicios.map(s => {
            const marcado = elegidos.includes(s.id)
            return (
              <li key={s.id}>
                <button type="button" role="checkbox" aria-checked={marcado} onClick={() => alternar(s.id)}
                  className={`flex w-full items-center gap-4 rounded-3xl border-2 p-4 text-left transition-colors ${marcado ? 'border-primario bg-acento' : 'border-transparent bg-secundario hover:bg-acento/60'}`}>
                  <span className={`flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${marcado ? 'border-primario bg-primario text-primario-texto' : 'border-suave/40 bg-fondo'}`}>
                    {marcado && <Check className="size-4" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold">{s.nombre}</span>
                    <span className="block text-sm text-suave">{s.detalle}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-base font-extrabold">{formatoPrecio(s.precio)}</span>
                    <span className="block text-xs text-suave">{s.unidad}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-borde bg-fondo/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs text-suave">{elegidos.length === 0 ? 'Elegí un servicio' : `${elegidos.length} ${elegidos.length === 1 ? 'servicio' : 'servicios'} · desde`}</p>
            <p className="text-lg font-extrabold">{formatoPrecio(subtotal)}</p>
          </div>
          <button type="button" disabled={elegidos.length === 0}
            onClick={() => { armar(p.id, elegidos); navegar('/app/solicitud') }}
            className="h-14 flex-1 rounded-2xl bg-primario text-base font-bold text-primario-texto transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
            Pedir cotización
          </button>
        </div>
      </div>
    </>
  )
}

/** /app/profesional/:id — perfil público de un profesional aprobado. */
export default function ProfesionalDetalle() {
  const { id = '' } = useParams()
  const { profesional, cargando } = useCatalogo()
  const navegar = useNavigate()
  if (cargando) return <Cargando />
  const p = profesional(id)
  if (!p) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-2xl font-bold">Profesional no encontrado</h1>
        <p className="mt-2 text-suave">Es posible que el perfil ya no esté publicado.</p>
        <Link to="/app/buscar" className="mt-6 inline-flex h-12 items-center rounded-2xl bg-primario px-6 font-bold text-primario-texto">Buscar profesionales</Link>
      </div>
    )
  }
  const nuevo = p.cantidadResenas === 0
  const primerNombre = p.nombre.split(' ')[0]
  const stats = [
    { etiqueta: 'Años de experiencia', valor: nuevo ? '—' : `${p.anosExperiencia}` },
    { etiqueta: 'Trabajos realizados', valor: `${p.trabajosRealizados}` },
    { etiqueta: 'Calificación', valor: nuevo ? 'Nuevo' : formatoPuntaje(p.puntaje) },
  ]

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-32 pt-4">
      <button type="button" onClick={() => navegar(-1)} className="inline-flex h-11 w-fit items-center gap-1 rounded-full pr-4 text-sm font-semibold text-primario hover:underline">
        <ChevronLeft className="size-5" aria-hidden="true" /> Volver
      </button>

      <section aria-labelledby="nombre-profesional" className="flex flex-col items-center gap-4 rounded-3xl bg-secundario p-6 text-center sm:flex-row sm:text-left">
        <FotoProfesional nombre={p.nombre} foto={p.foto} className="size-32 rounded-3xl sm:size-36" />
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-fondo px-3 py-1 text-xs font-semibold text-primario"><BadgeCheck className="size-4" aria-hidden="true" /> Profesional verificado</span>
          <h1 id="nombre-profesional" className="text-2xl font-extrabold tracking-tight md:text-3xl">{p.nombre}</h1>
          <p className="text-base text-suave">{p.oficio}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-start">
            <Puntaje valor={p.puntaje} cantidad={p.cantidadResenas} />
            <span className="inline-flex items-center gap-1 text-sm text-suave"><MapPin className="size-4 text-primario" aria-hidden="true" /> {p.barrio} · a {formatoDistancia(p.distanciaKm)}</span>
          </div>
        </div>
      </section>

      <dl className="grid grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.etiqueta} className="flex flex-col items-center gap-1 rounded-3xl bg-secundario px-2 py-4 text-center">
            <dt className="order-2 text-xs font-medium text-suave">{s.etiqueta}</dt>
            <dd className="order-1 text-xl font-extrabold text-primario">{s.valor}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="titulo-sobre" className="flex flex-col gap-3">
        <h2 id="titulo-sobre" className="text-lg font-bold">Sobre {primerNombre}</h2>
        <p className="text-pretty leading-relaxed text-suave">{p.descripcion}</p>
        <p className="inline-flex items-center gap-2 text-sm font-medium"><MessageCircle className="size-4 text-primario" aria-hidden="true" /> {p.respuesta}</p>
      </section>

      <section aria-labelledby="titulo-disponibilidad" className="flex flex-col gap-3 rounded-3xl bg-secundario p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 id="titulo-disponibilidad" className="flex items-center gap-2 text-lg font-bold"><CalendarDays className="size-5 text-primario" aria-hidden="true" /> Disponibilidad</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.disponibleHoy ? 'bg-primario text-primario-texto' : 'bg-fondo text-suave'}`}>{p.disponibleHoy ? 'Disponible hoy' : 'Desde mañana'}</span>
        </div>
        <ul className="grid grid-cols-7 gap-1.5">
          {SEMANA.map(d => {
            const activo = p.dias.includes(d)
            return (
              <li key={d} className={`flex h-11 items-center justify-center rounded-xl text-xs font-bold sm:text-sm ${activo ? 'bg-acento text-acento-texto' : 'bg-fondo text-suave/60 line-through'}`}>
                {d}<span className="sr-only">{activo ? ' disponible' : ' no disponible'}</span>
              </li>
            )
          })}
        </ul>
        <p className="inline-flex items-center gap-2 text-sm text-suave"><Clock className="size-4 text-primario" aria-hidden="true" /> Horario de atención: {p.horario}</p>
      </section>

      <Servicios p={p} />

      <section aria-labelledby="titulo-resenas" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 id="titulo-resenas" className="flex items-center gap-2 text-lg font-bold"><Briefcase className="size-5 text-primario" aria-hidden="true" /> Reseñas</h2>
          <span className="text-sm text-suave">{p.cantidadResenas} opiniones</span>
        </div>
        {p.resenas.length === 0 && <p className="rounded-3xl bg-secundario p-4 text-sm text-suave">Todavía no tiene reseñas. Después de tu primer trabajo con {primerNombre} vas a poder dejar la tuya.</p>}
        <ul className="flex flex-col gap-3">
          {p.resenas.map(r => (
            <li key={`${r.autor}-${r.fecha}`} className="flex flex-col gap-2 rounded-3xl bg-secundario p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-acento text-sm font-bold text-acento-texto">{r.autor.charAt(0)}</span>
                  <div><p className="text-sm font-bold">{r.autor}</p><p className="text-xs text-suave">{r.fecha}</p></div>
                </div>
                <Estrellas valor={r.puntaje} />
              </div>
              <p className="text-sm leading-relaxed text-suave">{r.texto}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
