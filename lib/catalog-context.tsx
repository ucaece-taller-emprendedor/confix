'use client'

import { createContext, useContext, useMemo } from 'react'
import type { Professional } from '@/lib/data'

type CatalogValue = {
  professionals: Professional[]
  getProfessional: (id: string) => Professional | undefined
}

const CatalogContext = createContext<CatalogValue | null>(null)

export function CatalogProvider({
  professionals,
  children,
}: {
  professionals: Professional[]
  children: React.ReactNode
}) {
  const value = useMemo<CatalogValue>(
    () => ({
      professionals,
      getProfessional: (id) => professionals.find((professional) => professional.id === id),
    }),
    [professionals],
  )
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) throw new Error('useCatalog debe usarse dentro de CatalogProvider')
  return context
}
