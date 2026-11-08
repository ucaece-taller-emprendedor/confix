import { doc, updateDoc } from 'firebase/firestore'
import { CalendarDays, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import { Alerta, EstadoVacio } from '@/components/ui'
import { db } from '@/lib/firebase'
import { formatoPrecio, type EstadoSolicitud, type Solicitud } from '@/lib/tipos'
import { mensajeDeError } from '@/lib/validations/form'
import { EstadoSolicitudEtiqueta } from './confix'

type Accion = { siguiente: EstadoSolicitud; etiqueta: string; primaria?: boolean }

/** Qué puede hacer cada parte desde cada estado (las reglas de Firestore validan lo mismo). */
function accionesPara(modo: 'cliente' | 'profesional', estado: EstadoSolicitud): Accion[] {
  if (modo === 'cliente') return estado === 'pendiente' || estado === 'aceptada' ? [{ siguiente: 'cancelada', etiqueta: 'Cancelar solicitud' }] : []
  if (estado === 'pendiente') return [{ siguiente: 'aceptada', etiqueta: 'Aceptar', primaria: true }, { siguiente: 'rechazada', etiqueta: 'Rechazar' }]
  if (estado === 'aceptada') return [{ siguiente: 'completada', etiqueta: 'Marcar como completada', primaria: true }, { siguiente: 'rechazada', etiqueta: 'Rechazar' }]
  return []
}

export function ListaSolicitudes({ solicitudes, modo, vacio }: { solicitudes: Solicitud[]; modo: 'cliente' | 'profesional'; vacio: string }) {
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)

  async function cambiar(id: string, siguiente: EstadoSolicitud) {
    setError('')
    setOcupado(true)
    try {
      await updateDoc(doc(db, 'requests', id), { estado: siguiente })
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setOcupado(false)
    }
  }

  if (solicitudes.length === 0) return <EstadoVacio>{vacio}</EstadoVacio>

  return (
    <div className="flex flex-col gap-3">
      {error && <Alerta>{error}</Alerta>}
      <ul className="flex flex-col gap-3">
        {solicitudes.map(s => (
          <li key={s.id} className="flex flex-col gap-3 rounded-3xl bg-secundario p-5" data-testid={`solicitud-${s.id}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-primario">{s.id}</p>
                <p className="font-bold">{modo === 'cliente' ? s.professionalNombre : s.contactoNombre}</p>
              </div>
              <EstadoSolicitudEtiqueta estado={s.estado} />
            </div>
            <ul className="flex flex-col gap-1 text-sm">
              {s.items.map(i => (
                <li key={i.nombre} className="flex justify-between gap-3"><span>{i.cantidad} × {i.nombre}</span><span className="font-semibold">{formatoPrecio(i.precio * i.cantidad)}</span></li>
              ))}
              <li className="mt-1 flex justify-between gap-3 border-t border-borde pt-2 font-bold"><span>Total estimado</span><span className="text-primario">{formatoPrecio(s.total)}</span></li>
            </ul>
            <ul className="flex flex-col gap-1.5 text-sm text-suave">
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-primario" aria-hidden="true" /> {s.direccion}</li>
              <li className="flex items-start gap-2"><CalendarDays className="mt-0.5 size-4 shrink-0 text-primario" aria-hidden="true" /> <span className="first-letter:uppercase">{s.fecha} · {s.franja}</span></li>
              {modo === 'profesional' && <li className="flex items-start gap-2"><Phone className="mt-0.5 size-4 shrink-0 text-primario" aria-hidden="true" /> {s.contactoTelefono}</li>}
              {s.notas && <li className="italic">“{s.notas}”</li>}
            </ul>
            {accionesPara(modo, s.estado).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {accionesPara(modo, s.estado).map(a => (
                  <button key={a.siguiente} type="button" disabled={ocupado} onClick={() => void cambiar(s.id, a.siguiente)}
                    className={a.primaria ? 'h-11 rounded-2xl bg-primario px-5 text-sm font-bold text-primario-texto hover:opacity-90 disabled:opacity-60' : 'h-11 rounded-2xl bg-fondo px-5 text-sm font-bold hover:bg-acento disabled:opacity-60'}>
                    {a.etiqueta}
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
