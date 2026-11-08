import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { CalendarDays, CheckCircle2, ClipboardList, Clock, Loader2, MapPin, Minus, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { FotoProfesional, Puntaje } from '@/components/confix'
import { Cargando } from '@/components/ui'
import { useCatalogo } from '@/lib/CatalogoContext'
import { db } from '@/lib/firebase'
import { useSolicitud } from '@/lib/SolicitudContext'
import { formatoPrecio, type DiaSemana, type LineaSolicitud, type Profesional } from '@/lib/tipos'
import { solicitudSchema } from '@/lib/validations/confix'
import { mensajeDeError, type Errores } from '@/lib/validations/form'

const FRANJAS = [
  { id: 'manana', etiqueta: 'Mañana', detalle: '8 a 12 h' },
  { id: 'tarde', etiqueta: 'Tarde', detalle: '12 a 17 h' },
  { id: 'noche', etiqueta: 'Noche', detalle: '17 a 21 h' },
]
const DIAS_JS: DiaSemana[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

type Dia = { clave: string; titulo: string; numero: number; largo: string; disponible: boolean }

function armarDias(p: Profesional): Dia[] {
  const hoy = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const f = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i)
    const dia = DIAS_JS[f.getDay()] as DiaSemana
    return {
      clave: `${f.getFullYear()}-${f.getMonth() + 1}-${f.getDate()}`,
      titulo: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : dia,
      numero: f.getDate(),
      largo: f.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }),
      disponible: p.dias.includes(dia) && (i > 0 || p.disponibleHoy),
    }
  })
}

/** Número de solicitud legible: CFX-XXXXXX. */
function nuevoNumero() {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return `CFX-${Array.from(bytes, b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('')}`
}

const entrada = 'h-14 w-full rounded-2xl border-2 border-transparent bg-secundario px-4 text-base font-medium outline-none transition-colors placeholder:text-suave focus-visible:border-primario aria-[invalid=true]:border-peligro'

function Campo({ id, etiqueta, error, ayuda, children }: { id: string; etiqueta: string; error?: string | undefined; ayuda?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">{etiqueta}</label>
      {children}
      {error ? <p className="text-sm font-medium text-peligro">{error}</p> : ayuda ? <p className="text-xs text-suave">{ayuda}</p> : null}
    </div>
  )
}

type Enviada = { id: string; profesional: Profesional; items: LineaSolicitud[]; costoVisita: number; total: number; direccion: string; fecha: string; franja: string }

function Confirmada({ s }: { s: Enviada }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 pt-10 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-acento"><CheckCircle2 className="size-10 text-primario" aria-hidden="true" /></span>
      <div className="flex flex-col gap-2">
        <h1 className="text-balance text-3xl font-extrabold tracking-tight">¡Solicitud enviada!</h1>
        <p className="text-pretty text-suave">{s.profesional.nombre.split(' ')[0]} recibió tu pedido y te va a contactar por teléfono para enviarte la cotización final.</p>
      </div>
      <div className="flex w-full flex-col gap-4 rounded-3xl bg-secundario p-5 text-left">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-suave">Número de solicitud</p>
          <p className="rounded-full bg-fondo px-3 py-1 text-sm font-extrabold text-primario" data-testid="numero-solicitud">{s.id}</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-fondo p-3">
          <FotoProfesional nombre={s.profesional.nombre} foto={s.profesional.foto} className="size-14 rounded-xl" />
          <div><p className="font-bold">{s.profesional.nombre}</p><p className="text-sm text-suave">{s.profesional.oficio}</p></div>
        </div>
        <ul className="flex flex-col gap-1.5 text-sm">
          {s.items.map(i => <li key={i.nombre} className="flex justify-between gap-3"><span>{i.cantidad} × {i.nombre}</span><span className="font-semibold">{formatoPrecio(i.precio * i.cantidad)}</span></li>)}
          <li className="flex justify-between gap-3 text-suave"><span>Visita y traslado</span><span className="font-semibold text-texto">{formatoPrecio(s.costoVisita)}</span></li>
          <li className="mt-2 flex items-baseline justify-between gap-3 border-t border-borde pt-3"><span className="font-bold">Total estimado</span><span className="text-xl font-extrabold text-primario">{formatoPrecio(s.total)}</span></li>
        </ul>
        <ul className="flex flex-col gap-2 border-t border-borde pt-4 text-sm">
          <li className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-primario" aria-hidden="true" /> {s.direccion}</li>
          <li className="flex items-start gap-2"><CalendarDays className="mt-0.5 size-4 shrink-0 text-primario" aria-hidden="true" /> <span className="first-letter:uppercase">{s.fecha}</span></li>
          <li className="flex items-start gap-2"><Clock className="mt-0.5 size-4 shrink-0 text-primario" aria-hidden="true" /> {s.franja}</li>
        </ul>
      </div>
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <Link to="/app" className="flex h-14 items-center justify-center rounded-2xl bg-primario text-base font-bold text-primario-texto hover:opacity-90 sm:flex-1">Volver al inicio</Link>
        <Link to="/app/mis-solicitudes" className="flex h-14 items-center justify-center rounded-2xl bg-secundario text-base font-bold hover:bg-acento sm:flex-1">Ver mis solicitudes</Link>
      </div>
    </div>
  )
}

function Formulario({ p, onEnviada }: { p: Profesional; onEnviada: (s: Enviada) => void }) {
  const { usuario, perfil } = useAuth()
  const { items, setCantidad, quitar, vaciar, barrio: barrioElegido } = useSolicitud()
  const { barrios } = useCatalogo()
  const [dias, setDias] = useState<Dia[]>([])
  const [diaClave, setDiaClave] = useState<string | null>(null)
  const [franja, setFranja] = useState<string | null>(null)
  const [errores, setErrores] = useState<Errores>({})
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [zona, setZona] = useState(barrioElegido || p.barrio)

  useEffect(() => {
    // Los días dependen de la fecha actual: se calculan en el navegador.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDias(armarDias(p))
  }, [p])

  const lineas = items.flatMap(i => {
    const s = p.servicios.find(x => x.id === i.serviceId)
    return s ? [{ s, cantidad: i.cantidad }] : []
  })
  const subtotal = lineas.reduce((t, l) => t + l.s.precio * l.cantidad, 0)
  const total = subtotal + p.costoVisita
  const esCliente = perfil?.role === 'cliente' && perfil.status === 'activo'

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!usuario || !esCliente || enviando) return
    const f = new FormData(e.currentTarget)
    const dia = dias.find(d => d.clave === diaClave)
    const fr = FRANJAS.find(x => x.id === franja)
    const r = solicitudSchema.safeParse({
      calle: f.get('calle') ?? '', piso: f.get('piso') ?? '', barrio: zona, fecha: dia?.largo ?? '', franja: fr ? `${fr.etiqueta} (${fr.detalle})` : '',
      notas: f.get('notas') ?? '', nombre: f.get('nombre') ?? '', telefono: f.get('telefono') ?? '',
    })
    if (!r.success) {
      const errs: Errores = {}
      for (const i of r.error.issues) errs[String(i.path[0])] ??= i.message
      setErrores(errs)
      return
    }
    setErrores({})
    setError('')
    const d = r.data
    const itemsFinal: LineaSolicitud[] = lineas.map(l => ({ nombre: l.s.nombre, precio: l.s.precio, cantidad: l.cantidad }))
    const direccion = `${d.calle}${d.piso ? `, ${d.piso}` : ''} · ${d.barrio}, CABA`
    const id = nuevoNumero()
    setEnviando(true)
    try {
      await setDoc(doc(db, 'requests', id), {
        clientId: usuario.uid, professionalId: p.id, professionalOwnerId: p.ownerId, professionalNombre: p.nombre, items: itemsFinal,
        direccion, piso: d.piso, barrio: d.barrio, fecha: d.fecha, franja: d.franja, notas: d.notas, contactoNombre: d.nombre, contactoTelefono: d.telefono,
        costoVisita: p.costoVisita, total, estado: 'pendiente', isDemo: false, createdAt: serverTimestamp(),
      })
      vaciar()
      onEnviada({ id, profesional: p, items: itemsFinal, costoVisita: p.costoVisita, total, direccion, fecha: d.fecha, franja: d.franja })
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={e => void enviar(e)} noValidate className="flex flex-col gap-6 pt-6">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Tu solicitud</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="titulo-resumen" className="flex flex-col gap-4 rounded-3xl bg-secundario p-4 md:p-5">
            <h2 id="titulo-resumen" className="text-lg font-bold">Resumen del servicio</h2>
            <Link to={`/app/profesional/${p.id}`} className="flex items-center gap-3 rounded-2xl bg-fondo p-3 hover:bg-acento/50">
              <FotoProfesional nombre={p.nombre} foto={p.foto} className="size-14 rounded-xl" />
              <div className="min-w-0"><p className="truncate text-base font-bold">{p.nombre}</p><p className="text-sm text-suave">{p.oficio}</p></div>
              <Puntaje valor={p.puntaje} className="ml-auto" />
            </Link>
            <ul className="flex flex-col gap-3">
              {lineas.map(({ s, cantidad }) => (
                <li key={s.id} className="flex items-center gap-3 rounded-2xl bg-fondo p-3">
                  <div className="min-w-0 flex-1"><p className="text-sm font-bold">{s.nombre}</p><p className="text-xs text-suave">{formatoPrecio(s.precio)} · {s.unidad}</p></div>
                  <div className="flex items-center gap-1 rounded-full bg-secundario p-1">
                    <button type="button" onClick={() => setCantidad(s.id, cantidad - 1)} disabled={cantidad <= 1} aria-label={`Quitar una unidad de ${s.nombre}`} className="flex size-9 items-center justify-center rounded-full bg-fondo text-primario disabled:opacity-40"><Minus className="size-4" aria-hidden="true" /></button>
                    <span className="w-6 text-center text-sm font-bold" aria-live="polite">{cantidad}</span>
                    <button type="button" onClick={() => setCantidad(s.id, cantidad + 1)} disabled={cantidad >= 10} aria-label={`Agregar una unidad de ${s.nombre}`} className="flex size-9 items-center justify-center rounded-full bg-fondo text-primario disabled:opacity-40"><Plus className="size-4" aria-hidden="true" /></button>
                  </div>
                  <button type="button" onClick={() => quitar(s.id)} aria-label={`Quitar ${s.nombre} de la solicitud`} className="flex size-10 items-center justify-center rounded-full text-suave hover:bg-secundario hover:text-peligro"><Trash2 className="size-5" aria-hidden="true" /></button>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between text-sm">
              <Link to={`/app/profesional/${p.id}`} className="font-semibold text-primario hover:underline">Agregar más servicios</Link>
              <button type="button" onClick={vaciar} className="font-semibold text-suave hover:text-peligro">Vaciar solicitud</button>
            </div>
          </section>

          <section aria-labelledby="titulo-direccion" className="flex flex-col gap-4">
            <h2 id="titulo-direccion" className="text-lg font-bold">Dirección del servicio</h2>
            <Campo id="calle" etiqueta="Calle y altura" error={errores.calle}><input id="calle" name="calle" autoComplete="street-address" placeholder="Ej: Thames 1450" aria-invalid={!!errores.calle} className={entrada} /></Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo id="piso" etiqueta="Piso / Depto (opcional)" error={errores.piso}><input id="piso" name="piso" placeholder="Ej: 3° B" className={entrada} /></Campo>
              <Campo id="zona" etiqueta="Barrio" error={errores.barrio}>
                <select id="zona" value={zona} onChange={e => setZona(e.target.value)} className={`${entrada} appearance-none`}>
                  {barrios.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </Campo>
            </div>
          </section>

          <section aria-labelledby="titulo-cuando" className="flex flex-col gap-4">
            <h2 id="titulo-cuando" className="text-lg font-bold">¿Cuándo te viene bien?</h2>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold" id="label-dia">Día</span>
              <div role="radiogroup" aria-labelledby="label-dia" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
                {dias.length === 0 && <div className="h-20 w-full animate-pulse rounded-2xl bg-secundario" />}
                {dias.map(d => (
                  <button key={d.clave} type="button" role="radio" aria-checked={diaClave === d.clave} disabled={!d.disponible} onClick={() => setDiaClave(d.clave)}
                    className={`flex h-20 w-[4.5rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl text-sm font-semibold transition-colors ${diaClave === d.clave ? 'bg-primario text-primario-texto' : 'bg-secundario hover:bg-acento'} ${d.disponible ? '' : 'cursor-not-allowed opacity-40 hover:bg-secundario'}`}>
                    <span className="text-xs">{d.titulo}</span><span className="text-xl font-extrabold">{d.numero}</span>
                  </button>
                ))}
              </div>
              {errores.fecha && <p className="text-sm font-medium text-peligro">{errores.fecha}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold" id="label-franja">Franja horaria</span>
              <div role="radiogroup" aria-labelledby="label-franja" className="grid grid-cols-3 gap-2">
                {FRANJAS.map(x => (
                  <button key={x.id} type="button" role="radio" aria-checked={franja === x.id} onClick={() => setFranja(x.id)}
                    className={`flex h-16 flex-col items-center justify-center rounded-2xl text-sm font-semibold transition-colors ${franja === x.id ? 'bg-primario text-primario-texto' : 'bg-secundario hover:bg-acento'}`}>
                    {x.etiqueta}<span className={`text-xs font-medium ${franja === x.id ? 'opacity-85' : 'text-suave'}`}>{x.detalle}</span>
                  </button>
                ))}
              </div>
              {errores.franja && <p className="text-sm font-medium text-peligro">{errores.franja}</p>}
            </div>
          </section>

          <section aria-labelledby="titulo-contacto" className="flex flex-col gap-4">
            <h2 id="titulo-contacto" className="text-lg font-bold">Tus datos</h2>
            <Campo id="nombre" etiqueta="Nombre y apellido" error={errores.nombre}><input id="nombre" name="nombre" defaultValue={perfil?.displayName ?? ''} autoComplete="name" placeholder="Ej: María Rodríguez" aria-invalid={!!errores.nombre} className={entrada} /></Campo>
            <Campo id="telefono" etiqueta="Teléfono" error={errores.telefono} ayuda="Solo lo verá el profesional que elegiste."><input id="telefono" name="telefono" type="tel" inputMode="tel" autoComplete="tel" placeholder="Ej: 11 5555 1234" aria-invalid={!!errores.telefono} className={entrada} /></Campo>
            <Campo id="notas" etiqueta="Contanos qué necesitás (opcional)" error={errores.notas}><textarea id="notas" name="notas" rows={4} maxLength={500} placeholder="Ej: Se pierde agua debajo de la bacha de la cocina." className="w-full resize-none rounded-2xl border-2 border-transparent bg-secundario p-4 text-base font-medium outline-none transition-colors placeholder:text-suave focus-visible:border-primario" /></Campo>
          </section>
        </div>

        <aside aria-labelledby="titulo-precio" className="flex flex-col gap-4 rounded-3xl bg-secundario p-5 lg:sticky lg:top-24">
          <h2 id="titulo-precio" className="text-lg font-bold">Precio estimado</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-suave">Servicios</dt><dd className="font-semibold">{formatoPrecio(subtotal)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-suave">Visita y traslado</dt><dd className="font-semibold">{formatoPrecio(p.costoVisita)}</dd></div>
            <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-borde pt-4"><dt className="text-base font-bold">Total estimado</dt><dd className="text-2xl font-extrabold text-primario">{formatoPrecio(total)}</dd></div>
          </dl>
          <p className="text-xs leading-relaxed text-suave">Es un valor orientativo. {p.nombre.split(' ')[0]} te enviará la cotización final después de evaluar el trabajo. No se cobra nada al confirmar.</p>
          {error && <p role="alert" className="rounded-2xl bg-peligro/10 px-4 py-3 text-sm font-semibold text-peligro">{error}</p>}
          {!usuario ? (
            <>
              <p className="text-sm font-medium">Para confirmar tu solicitud necesitás una cuenta de CONFIX.</p>
              <Link to="/app/ingresar" state={{ desde: '/app/solicitud' }} className="flex h-14 w-full items-center justify-center rounded-2xl bg-primario text-base font-bold text-primario-texto hover:opacity-90">Ingresar para confirmar</Link>
              <Link to="/app/registro" className="text-center text-sm font-bold text-primario hover:underline">Crear una cuenta</Link>
            </>
          ) : !esCliente ? (
            <p className="rounded-2xl bg-fondo p-4 text-sm font-medium">Solo las cuentas de cliente activas pueden pedir cotizaciones.</p>
          ) : (
            <button type="submit" disabled={enviando || lineas.length === 0} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primario text-base font-bold text-primario-texto transition-opacity hover:opacity-90 disabled:opacity-60">
              {enviando && <Loader2 className="size-5 animate-spin" aria-hidden="true" />} Confirmar solicitud
            </button>
          )}
        </aside>
      </div>
    </form>
  )
}

/** /app/solicitud — armar y confirmar el pedido de cotización. */
export default function SolicitudPagina() {
  const { professionalId, items } = useSolicitud()
  const { profesional, cargando } = useCatalogo()
  const { cargando: authCargando } = useAuth()
  const [enviada, setEnviada] = useState<Enviada | null>(null)

  if (cargando || authCargando) return <Cargando />
  if (enviada) return <Confirmada s={enviada} />
  const p = professionalId ? profesional(professionalId) : undefined
  if (p && items.length > 0) return <Formulario p={p} onEnviada={setEnviada} />

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pt-6">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Mi solicitud</h1>
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-secundario px-6 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-fondo"><ClipboardList className="size-7 text-primario" aria-hidden="true" /></span>
        <h2 className="text-lg font-bold">Todavía no armaste ninguna solicitud</h2>
        <p className="max-w-xs text-sm text-suave">Buscá un profesional, elegí los servicios que necesitás y pedí tu cotización.</p>
        <Link to="/app/buscar" className="mt-2 inline-flex h-14 items-center gap-2 rounded-2xl bg-primario px-6 text-base font-bold text-primario-texto hover:opacity-90"><Search className="size-5" aria-hidden="true" /> Buscar profesionales</Link>
      </div>
      <Link to="/app/mis-solicitudes" className="flex h-14 items-center justify-center rounded-2xl bg-secundario text-base font-bold hover:bg-acento">Ver mis solicitudes enviadas</Link>
    </div>
  )
}
