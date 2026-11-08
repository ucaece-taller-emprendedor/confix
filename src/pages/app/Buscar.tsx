import { Clock, Search, SearchX, Star, X } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { IconoCategoria } from '@/components/confix'
import { ProfesionalFila } from '@/components/ProfesionalCard'
import { Cargando } from '@/components/ui'
import { useCatalogo } from '@/lib/CatalogoContext'
import { normalizar } from '@/lib/tipos'

type Orden = 'cercania' | 'calificacion' | 'precio'
const ETIQUETA_ORDEN: Record<Orden, string> = { cercania: 'Más cercanos', calificacion: 'Mejor calificados', precio: 'Menor precio' }

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={activo}
      className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${activo ? 'bg-primario text-primario-texto' : 'bg-secundario hover:bg-acento'}`}>
      {children}
    </button>
  )
}

/** /app/buscar — buscar por texto, categoría y barrio; comparar por cercanía, calificación o precio. */
export default function Buscar() {
  const { profesionales, categorias, barrios, cargando } = useCatalogo()
  const [params] = useSearchParams()
  const [texto, setTexto] = useState(params.get('q') ?? '')
  const [categoria, setCategoria] = useState(params.get('categoria') ?? 'todas')
  const [barrio, setBarrio] = useState('todos')
  const [soloHoy, setSoloHoy] = useState(false)
  const [destacados, setDestacados] = useState(false)
  const [orden, setOrden] = useState<Orden>('cercania')

  const resultados = useMemo(() => {
    const termino = normalizar(texto.trim())
    return profesionales
      .filter(p => {
        if (categoria !== 'todas' && p.categoria !== categoria) return false
        if (barrio !== 'todos' && p.barrio !== barrio) return false
        if (soloHoy && !p.disponibleHoy) return false
        if (destacados && p.puntaje < 4.8) return false
        if (!termino) return true
        const pajar = normalizar([p.nombre, p.oficio, p.barrio, ...p.servicios.map(s => s.nombre)].join(' '))
        return termino.split(/\s+/).every(w => pajar.includes(w))
      })
      .sort((a, b) => {
        if (orden === 'calificacion') return b.puntaje - a.puntaje || b.cantidadResenas - a.cantidadResenas
        if (orden === 'precio') return Math.min(...a.servicios.map(s => s.precio)) - Math.min(...b.servicios.map(s => s.precio))
        return a.distanciaKm - b.distanciaKm
      })
  }, [profesionales, texto, categoria, barrio, soloHoy, destacados, orden])

  if (cargando) return <Cargando />
  const hayFiltros = texto !== '' || categoria !== 'todas' || barrio !== 'todos' || soloHoy || destacados
  const limpiar = () => { setTexto(''); setCategoria('todas'); setBarrio('todos'); setSoloHoy(false); setDestacados(false); setOrden('cercania') }
  const scrollChips = '-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden'

  return (
    <div className="flex flex-col gap-5 pt-6">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Buscar profesionales</h1>

      <form role="search" onSubmit={e => e.preventDefault()} className="relative">
        <label htmlFor="buscar-texto" className="sr-only">Buscar profesionales o servicios</label>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primario" aria-hidden="true" />
        <input id="buscar-texto" type="search" value={texto} onChange={e => setTexto(e.target.value)} placeholder="Ej: destape, tablero, Esteban"
          className="h-14 w-full rounded-2xl bg-secundario pl-12 pr-12 text-base font-medium outline-none placeholder:text-suave focus-visible:ring-2 focus-visible:ring-primario [&::-webkit-search-cancel-button]:hidden" />
        {texto && (
          <button type="button" onClick={() => setTexto('')} aria-label="Borrar búsqueda" className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-suave hover:bg-fondo">
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </form>

      <div className="flex flex-col gap-3">
        <div role="group" aria-label="Categorías" className={scrollChips}>
          <Chip activo={categoria === 'todas'} onClick={() => setCategoria('todas')}>Todas</Chip>
          {categorias.map(c => (
            <Chip key={c.id} activo={categoria === c.id} onClick={() => setCategoria(c.id)}>
              <IconoCategoria id={c.id} className="size-4" /> {c.nombre}
            </Chip>
          ))}
        </div>
        <div role="group" aria-label="Filtros" className={scrollChips}>
          <Chip activo={soloHoy} onClick={() => setSoloHoy(v => !v)}><Clock className="size-4" aria-hidden="true" /> Disponible hoy</Chip>
          <Chip activo={destacados} onClick={() => setDestacados(v => !v)}><Star className="size-4" aria-hidden="true" /> 4,8 o más</Chip>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-suave" aria-live="polite">
          <span className="font-bold text-texto">{resultados.length}</span> {resultados.length === 1 ? 'profesional encontrado' : 'profesionales encontrados'}
        </p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-suave">Barrio</span>
            <select value={barrio} onChange={e => setBarrio(e.target.value)} className="h-10 rounded-full bg-secundario px-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primario">
              <option value="todos">Todos</option>
              {barrios.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-suave">Ordenar</span>
            <select value={orden} onChange={e => setOrden(e.target.value as Orden)} className="h-10 rounded-full bg-secundario px-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primario">
              {(Object.keys(ETIQUETA_ORDEN) as Orden[]).map(k => <option key={k} value={k}>{ETIQUETA_ORDEN[k]}</option>)}
            </select>
          </label>
        </div>
      </div>

      {resultados.length > 0 ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {resultados.map(p => <li key={p.id}><ProfesionalFila p={p} /></li>)}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-secundario px-6 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-fondo"><SearchX className="size-7 text-primario" aria-hidden="true" /></span>
          <h2 className="text-lg font-bold">No encontramos resultados</h2>
          <p className="max-w-xs text-sm text-suave">Probá con otra palabra o quitá algún filtro para ver más profesionales.</p>
          {hayFiltros && <button type="button" onClick={limpiar} className="mt-2 h-12 rounded-2xl bg-primario px-6 text-sm font-bold text-primario-texto hover:opacity-90">Limpiar filtros</button>}
        </div>
      )}
    </div>
  )
}
