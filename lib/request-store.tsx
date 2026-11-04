'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type CartItem = {
  serviceId: string
  cantidad: number
}

type RequestStore = {
  barrio: string
  setBarrio: (barrio: string) => void
  professionalId: string | null
  items: CartItem[]
  itemCount: number
  setRequest: (professionalId: string, serviceIds: string[]) => void
  setQuantity: (serviceId: string, cantidad: number) => void
  removeItem: (serviceId: string) => void
  clearCart: () => void
}

const RequestContext = createContext<RequestStore | null>(null)

export function RequestProvider({ defaultBarrio, children }: { defaultBarrio: string; children: React.ReactNode }) {
  const [barrio, setBarrio] = useState(defaultBarrio)
  const [professionalId, setProfessionalId] = useState<string | null>(null)
  const [items, setItems] = useState<CartItem[]>([])

  const setRequest = useCallback((id: string, serviceIds: string[]) => {
    setProfessionalId(id)
    setItems(serviceIds.map((serviceId) => ({ serviceId, cantidad: 1 })))
  }, [])

  const setQuantity = useCallback((serviceId: string, cantidad: number) => {
    const safe = Math.min(Math.max(cantidad, 1), 10)
    setItems((current) => current.map((item) => (item.serviceId === serviceId ? { ...item, cantidad: safe } : item)))
  }, [])

  const removeItem = useCallback((serviceId: string) => {
    setItems((current) => {
      const next = current.filter((item) => item.serviceId !== serviceId)
      if (next.length === 0) setProfessionalId(null)
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setProfessionalId(null)
  }, [])

  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0)

  const value = useMemo<RequestStore>(
    () => ({ barrio, setBarrio, professionalId, items, itemCount, setRequest, setQuantity, removeItem, clearCart }),
    [barrio, professionalId, items, itemCount, setRequest, setQuantity, removeItem, clearCart],
  )

  return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>
}

export function useRequestStore() {
  const context = useContext(RequestContext)
  if (!context) throw new Error('useRequestStore debe usarse dentro de RequestProvider')
  return context
}
