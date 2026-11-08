import { collection, query, where } from 'firebase/firestore'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { ListaSolicitudes } from '@/components/ListaSolicitudes'
import { Alerta, Cargando } from '@/components/ui'
import { useColeccion } from '@/hooks/useColeccion'
import { db } from '@/lib/firebase'
import { masNuevasPrimero, type Solicitud } from '@/lib/tipos'

/** /app/mis-solicitudes — el cliente ve y puede cancelar sus pedidos. */
export default function MisSolicitudes() {
  const { usuario } = useAuth()
  const uid = usuario?.uid
  const consulta = useMemo(() => (uid ? query(collection(db, 'requests'), where('clientId', '==', uid)) : null), [uid])
  const { datos, cargando, error } = useColeccion<Solicitud>(consulta)
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pt-6">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Mis solicitudes</h1>
      {error && <Alerta>{error}</Alerta>}
      {cargando ? <Cargando /> : <ListaSolicitudes solicitudes={masNuevasPrimero(datos)} modo="cliente" vacio="Todavía no enviaste ninguna solicitud. Buscá un profesional y pedí tu primera cotización." />}
      <Link to="/app/buscar" className="flex h-14 items-center justify-center rounded-2xl bg-secundario text-base font-bold hover:bg-acento">Buscar profesionales</Link>
    </div>
  )
}
