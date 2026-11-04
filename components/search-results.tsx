'use client'

import { useMemo, useState } from 'react'
import { Clock, SearchX, Search, Star, X } from 'lucide-react'
import { CategoryIcon } from '@/components/category-icon'
import { ProfessionalCardRow } from '@/components/professional-card'
import { useCatalog } from '@/lib/catalog-context'
import { normalize, type CategoryId } from '@/lib/data'
import { cn } from '@/lib/utils'

type CategoryFilter = CategoryId | 'todas'
type SortKey = 'cercania' | 'calificacion' | 'precio'

const sortLabels: Record<SortKey, string> = {
  cercania: 'Más cercanos',
  calificacion: 'Mejor calificados',
  precio: 'Menor precio',
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-accent',
      )}
    >
      {children}
    </button>
  )
}

export function SearchResults({
  initialQuery,
  initialCategory,
}: {
  initialQuery: string
  initialCategory: CategoryFilter
}) {
  const { professionals, categories } = useCatalog()
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState<CategoryFilter>(initialCategory)
  const [onlyToday, setOnlyToday] = useState(false)
  const [topRated, setTopRated] = useState(false)
  const [sort, setSort] = useState<SortKey>('cercania')

  const results = useMemo(() => {
    const term = normalize(query.trim())
    const filtered = professionals.filter((p) => {
      if (category !== 'todas' && p.categoria !== category) return false
      if (onlyToday && !p.disponibleHoy) return false
      if (topRated && p.puntaje < 4.8) return false
      if (!term) return true
      const haystack = normalize(
        [p.nombre, p.oficio, p.barrio, ...p.servicios.map((s) => s.nombre)].join(' '),
      )
      return term.split(/\s+/).every((word) => haystack.includes(word))
    })

    return filtered.sort((a, b) => {
      if (sort === 'calificacion') return b.puntaje - a.puntaje || b.cantidadResenas - a.cantidadResenas
      if (sort === 'precio') {
        return Math.min(...a.servicios.map((s) => s.precio)) - Math.min(...b.servicios.map((s) => s.precio))
      }
      return a.distanciaKm - b.distanciaKm
    })
  }, [professionals, query, category, onlyToday, topRated, sort])

  const hasFilters = query !== '' || category !== 'todas' || onlyToday || topRated

  function clearFilters() {
    setQuery('')
    setCategory('todas')
    setOnlyToday(false)
    setTopRated(false)
    setSort('cercania')
  }

  return (
    <div className="flex flex-col gap-5 pt-6">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Buscar profesionales</h1>

      <form role="search" onSubmit={(event) => event.preventDefault()} className="relative">
        <label htmlFor="search-input" className="sr-only">
          Buscar profesionales o servicios
        </label>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary" aria-hidden="true" />
        <input
          id="search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ej: destape, tablero, Esteban"
          className="h-14 w-full rounded-2xl bg-secondary pl-12 pr-12 text-base font-medium outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Borrar búsqueda"
            className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-background"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </form>

      <div className="flex flex-col gap-3">
        <div role="group" aria-label="Categorías" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
          <Chip active={category === 'todas'} onClick={() => setCategory('todas')}>
            Todas
          </Chip>
          {categories.map((item) => (
            <Chip key={item.id} active={category === item.id} onClick={() => setCategory(item.id)}>
              <CategoryIcon id={item.id} className="size-4" />
              {item.nombre}
            </Chip>
          ))}
        </div>

        <div role="group" aria-label="Filtros" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
          <Chip active={onlyToday} onClick={() => setOnlyToday((v) => !v)}>
            <Clock className="size-4" aria-hidden="true" />
            Disponible hoy
          </Chip>
          <Chip active={topRated} onClick={() => setTopRated((v) => !v)}>
            <Star className="size-4" aria-hidden="true" />
            4,8 o más
          </Chip>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <span className="font-bold text-foreground">{results.length}</span>{' '}
          {results.length === 1 ? 'profesional encontrado' : 'profesionales encontrados'}
        </p>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Ordenar</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="h-10 rounded-full bg-secondary px-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {(Object.keys(sortLabels) as SortKey[]).map((key) => (
              <option key={key} value={key}>
                {sortLabels[key]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {results.length > 0 ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {results.map((professional) => (
            <li key={professional.id}>
              <ProfessionalCardRow professional={professional} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-secondary px-6 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-background">
            <SearchX className="size-7 text-primary" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-bold">No encontramos resultados</h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            Probá con otra palabra o quitá algún filtro para ver más profesionales.
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-2 h-12 rounded-2xl bg-primary px-6 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
