import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type ItemCarrito = { serviceId: string; cantidad: number }

type SolicitudStore = {
  barrio: string
  setBarrio: (barrio: string) => void
  professionalId: string | null
  items: ItemCarrito[]
  cantidadTotal: number
  armar: (professionalId: string, serviceIds: string[]) => void
  setCantidad: (serviceId: string, cantidad: number) => void
  quitar: (serviceId: string) => void
  vaciar: () => void
}

const Ctx = createContext<SolicitudStore | null>(null)

/** Solicitud en armado (servicios elegidos de UN profesional). Vive en memoria hasta confirmarla. */
export function SolicitudProvider({ children }: { children: ReactNode }) {
  const [barrio, setBarrio] = useState('')
  const [professionalId, setProfessionalId] = useState<string | null>(null)
  const [items, setItems] = useState<ItemCarrito[]>([])

  const armar = useCallback((id: string, serviceIds: string[]) => {
    setProfessionalId(id)
    setItems(serviceIds.map(serviceId => ({ serviceId, cantidad: 1 })))
  }, [])
  const setCantidad = useCallback((serviceId: string, cantidad: number) => {
    const seguro = Math.min(Math.max(cantidad, 1), 10)
    setItems(actual => actual.map(i => (i.serviceId === serviceId ? { ...i, cantidad: seguro } : i)))
  }, [])
  const quitar = useCallback((serviceId: string) => {
    setItems(actual => {
      const sig = actual.filter(i => i.serviceId !== serviceId)
      if (sig.length === 0) setProfessionalId(null)
      return sig
    })
  }, [])
  const vaciar = useCallback(() => {
    setItems([])
    setProfessionalId(null)
  }, [])

  const cantidadTotal = items.reduce((s, i) => s + i.cantidad, 0)
  const valor = useMemo<SolicitudStore>(
    () => ({ barrio, setBarrio, professionalId, items, cantidadTotal, armar, setCantidad, quitar, vaciar }),
    [barrio, professionalId, items, cantidadTotal, armar, setCantidad, quitar, vaciar],
  )
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSolicitud() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useSolicitud debe usarse dentro de SolicitudProvider')
  return c
}
