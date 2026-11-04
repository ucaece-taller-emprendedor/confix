'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, X } from 'lucide-react'

export function HomeSearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = query.trim()
    router.push(trimmed ? `/app/buscar?q=${encodeURIComponent(trimmed)}` : '/app/buscar')
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex items-center gap-2">
      <div className="relative flex-1">
        <label htmlFor="home-search" className="sr-only">
          Buscar profesionales o servicios
        </label>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary" aria-hidden="true" />
        <input
          id="home-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="¿Qué servicio buscás?"
          className="h-14 w-full rounded-2xl bg-secondary pl-12 pr-11 text-base font-medium text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
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
      </div>
      <button
        type="submit"
        className="flex h-14 shrink-0 items-center justify-center rounded-2xl bg-primary px-5 text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Buscar
      </button>
    </form>
  )
}
