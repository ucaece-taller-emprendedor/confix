import { onSnapshot, type DocumentReference } from 'firebase/firestore'
import { useEffect, useState } from 'react'

/** Escucha un documento en tiempo real. `datos` es null si no existe. Pasar `null` mientras no se puede consultar. La referencia tiene que estar memoizada. */
export function useDocumento<T>(ref: DocumentReference | null): { datos: (T & { id: string }) | null; cargando: boolean; error: string | null } {
  const [estado, setEstado] = useState<{ datos: (T & { id: string }) | null; cargando: boolean; error: string | null }>({ datos: null, cargando: ref !== null, error: null })
  useEffect(() => {
    if (!ref) return
    return onSnapshot(
      ref,
      snap => setEstado({ datos: snap.exists() ? ({ ...(snap.data() as T), id: snap.id }) : null, cargando: false, error: null }),
      () => setEstado({ datos: null, cargando: false, error: 'No se pudieron cargar los datos.' }),
    )
  }, [ref])
  return estado
}
