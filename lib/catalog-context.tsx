'use client'

import { createContext, useContext, useMemo } from 'react'
import type { Category, Professional } from '@/lib/data'

type CatalogValue = {
  professionals: Professional[]
  categories: Category[]
  barrios: string[]
  getProfessional: (id: string) => Professional | undefined
}

const CatalogContext = createContext<CatalogValue | null>(null)

export function CatalogProvider({
  professionals,
  categories,
  barrios,
  children,
}: {
  professionals: Professional[]
  categories: Category[]
  barrios: string[]
  children: React.ReactNode
}) {
  const value = useMemo<CatalogValue>(
    () => ({
      professionals,
      categories,
      barrios,
      getProfessional: (id) => professionals.find((professional) => professional.id === id),
    }),
    [professionals, categories, barrios],
  )
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) throw new Error('useCatalog debe usarse dentro de CatalogProvider')
  return context
}
