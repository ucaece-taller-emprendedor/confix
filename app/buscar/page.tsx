import type { Metadata } from 'next'
import { SearchResults } from '@/components/search-results'
import { CATEGORIES, type CategoryId } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Buscar profesionales | CONFIX',
  description: 'Filtrá por categoría, calificación y disponibilidad para encontrar al profesional ideal.',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; categoria?: string | string[] }>
}) {
  const params = await searchParams
  const q = Array.isArray(params.q) ? params.q[0] : params.q
  const categoriaParam = Array.isArray(params.categoria) ? params.categoria[0] : params.categoria
  const categoria = CATEGORIES.find((c) => c.id === categoriaParam)?.id as CategoryId | undefined

  return (
    <SearchResults
      key={`${q ?? ''}|${categoria ?? ''}`}
      initialQuery={q ?? ''}
      initialCategory={categoria ?? 'todas'}
    />
  )
}
