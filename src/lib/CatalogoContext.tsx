import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { db } from '@/lib/firebase'
import type { Barrio, Categoria, Profesional } from '@/lib/tipos'

type CatalogoValor = {
  profesionales: Profesional[]
  categorias: Categoria[]
  barrios: string[]
  cargando: boolean
  error: string | null
  profesional: (id: string) => Profesional | undefined
}

const CatalogoContext = createContext<CatalogoValor | null>(null)

/** Catálogo público en tiempo real: categorías, barrios y profesionales APROBADOS (las reglas no dejan ver otros). */
export function CatalogoProvider({ children }: { children: ReactNode }) {
  const [profesionales, setProfesionales] = useState<Profesional[] | null>(null)
  const [categorias, setCategorias] = useState<Categoria[] | null>(null)
  const [barrios, setBarrios] = useState<Barrio[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fallo = () => setError('No se pudo cargar el catálogo. Revisá tu conexión.')
    const u1 = onSnapshot(query(collection(db, 'professionals'), where('estado', '==', 'aprobado')), s => setProfesionales(s.docs.map(d => ({ ...(d.data() as Omit<Profesional, 'id'>), id: d.id }))), fallo)
    const u2 = onSnapshot(collection(db, 'categories'), s => setCategorias(s.docs.map(d => ({ ...(d.data() as Omit<Categoria, 'id'>), id: d.id }))), fallo)
    const u3 = onSnapshot(collection(db, 'barrios'), s => setBarrios(s.docs.map(d => ({ ...(d.data() as Omit<Barrio, 'id'>), id: d.id }))), fallo)
    return () => {
      u1()
      u2()
      u3()
    }
  }, [])

  const valor = useMemo<CatalogoValor>(() => {
    const lista = [...(profesionales ?? [])].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    return {
      profesionales: lista,
      categorias: (categorias ?? []).filter(c => c.activa).sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, 'es')),
      barrios: (barrios ?? []).filter(b => b.activo).sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, 'es')).map(b => b.nombre),
      cargando: profesionales === null || categorias === null || barrios === null,
      error,
      profesional: id => lista.find(p => p.id === id),
    }
  }, [profesionales, categorias, barrios, error])

  return <CatalogoContext.Provider value={valor}>{children}</CatalogoContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCatalogo() {
  const c = useContext(CatalogoContext)
  if (!c) throw new Error('useCatalogo debe usarse dentro de CatalogoProvider')
  return c
}
