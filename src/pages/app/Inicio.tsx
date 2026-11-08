import { ArrowRight, BadgeCheck, Search, ShieldCheck, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { IconoCategoria } from '@/components/confix'
import { ProfesionalFila, ProfesionalVertical } from '@/components/ProfesionalCard'
import { Cargando } from '@/components/ui'
import { useCatalogo } from '@/lib/CatalogoContext'

function BuscadorInicio() {
  const navegar = useNavigate()
  const [texto, setTexto] = useState('')
  function enviar(e: FormEvent) {
    e.preventDefault()
    const t = texto.trim()
    navegar(t ? `/app/buscar?q=${encodeURIComponent(t)}` : '/app/buscar')
  }
  return (
    <form onSubmit={enviar} role="search" className="flex items-center gap-2">
      <div className="relative flex-1">
        <label htmlFor="buscador-inicio" className="sr-only">Buscar profesionales o servicios</label>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primario" aria-hidden="true" />
        <input id="buscador-inicio" type="search" value={texto} onChange={e => setTexto(e.target.value)} placeholder="¿Qué servicio buscás?"
          className="h-14 w-full rounded-2xl bg-secundario pl-12 pr-11 text-base font-medium outline-none placeholder:text-suave focus-visible:ring-2 focus-visible:ring-primario [&::-webkit-search-cancel-button]:hidden" />
        {texto && (
          <button type="button" onClick={() => setTexto('')} aria-label="Borrar búsqueda" className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-suave hover:bg-fondo">
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <button type="submit" className="flex h-14 shrink-0 items-center justify-center rounded-2xl bg-primario px-5 text-base font-bold text-primario-texto hover:opacity-90">Buscar</button>
    </form>
  )
}

/** /app — inicio público: buscador, categorías y profesionales. */
export default function Inicio() {
  const { profesionales, categorias, cargando } = useCatalogo()
  if (cargando) return <Cargando />
  const cercanos = [...profesionales].sort((a, b) => a.distanciaKm - b.distanciaKm).slice(0, 5)
  const recomendados = [...profesionales].sort((a, b) => b.puntaje - a.puntaje || b.cantidadResenas - a.cantidadResenas).slice(0, 4)

  return (
    <div className="flex flex-col gap-8 pt-6">
      <section aria-labelledby="titulo-inicio" className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-primario">Hola, ¿cómo andás?</p>
          <h1 id="titulo-inicio" className="mt-1 text-balance text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">¿Qué necesitás arreglar hoy?</h1>
        </div>
        <BuscadorInicio />
      </section>

      <section aria-labelledby="titulo-categorias" className="flex flex-col gap-4">
        <h2 id="titulo-categorias" className="text-lg font-bold">Categorías</h2>
        <ul className="grid grid-cols-4 gap-3">
          {categorias.map(c => (
            <li key={c.id}>
              <Link to={`/app/buscar?categoria=${c.id}`} className="flex flex-col items-center gap-2 rounded-3xl bg-secundario px-1 py-4 text-center transition-colors hover:bg-acento">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-fondo shadow-sm md:size-14">
                  <IconoCategoria id={c.id} className="size-6 text-primario md:size-7" />
                </span>
                <span className="text-xs font-semibold md:text-sm">{c.nombre}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Beneficios" className="flex items-center gap-4 rounded-3xl bg-primario p-5 text-primario-texto">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/20"><ShieldCheck className="size-6" aria-hidden="true" /></span>
        <div className="flex-1">
          <p className="text-base font-bold">Pedí tu cotización sin cargo</p>
          <p className="text-sm opacity-85">Profesionales verificados y precios claros antes de contratar.</p>
        </div>
        <Link to="/app/buscar" aria-label="Ver profesionales" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-fondo text-primario transition-transform hover:scale-105">
          <ArrowRight className="size-5" aria-hidden="true" />
        </Link>
      </section>

      {profesionales.length === 0 ? (
        <p className="rounded-3xl bg-secundario p-8 text-center text-sm text-suave">Todavía no hay profesionales publicados.</p>
      ) : (
        <>
          <section aria-labelledby="titulo-cercanos" className="flex flex-col gap-4">
            <div className="flex items-end justify-between">
              <h2 id="titulo-cercanos" className="text-lg font-bold">Profesionales cercanos</h2>
              <Link to="/app/buscar" className="text-sm font-semibold text-primario hover:underline">Ver todos</Link>
            </div>
            <ul className="-mx-4 flex scroll-px-4 snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
              {cercanos.map((p, i) => (
                <li key={p.id} className={`w-[62%] shrink-0 snap-start sm:w-[40%] md:w-auto ${i === 4 ? 'md:hidden' : ''}`}>
                  <ProfesionalVertical p={p} />
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="titulo-recomendados" className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <h2 id="titulo-recomendados" className="text-lg font-bold">Recomendados para vos</h2>
              <BadgeCheck className="size-5 text-primario" aria-hidden="true" />
            </div>
            <ul className="grid gap-3 md:grid-cols-2">
              {recomendados.map(p => <li key={p.id}><ProfesionalFila p={p} /></li>)}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
