import { collection, doc, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { Plus, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '@/auth/useAuth'
import { ListaSolicitudes } from '@/components/ListaSolicitudes'
import { Alerta, Boton, Campo, CampoTexto, Cargando, Selector } from '@/components/ui'
import { useColeccion } from '@/hooks/useColeccion'
import { useDocumento } from '@/hooks/useDocumento'
import { useCatalogo } from '@/lib/CatalogoContext'
import { db } from '@/lib/firebase'
import { masNuevasPrimero, UNIDADES_SERVICIO, type Profesional, type Solicitud } from '@/lib/tipos'
import { MAX_SERVICIOS, perfilProfesionalSchema } from '@/lib/validations/confix'
import { mensajeDeError, type Errores } from '@/lib/validations/form'

type ServicioForm = { nombre: string; detalle: string; precio: string; unidad: string }
const servicioVacio = (): ServicioForm => ({ nombre: '', detalle: '', precio: '', unidad: UNIDADES_SERVICIO[0] as string })

const ESTADOS = {
  pendiente: { etiqueta: 'Pendiente de aprobación', detalle: 'Un administrador está revisando tu perfil. Cuando lo apruebe vas a aparecer en las búsquedas.', clase: 'bg-acento text-acento-texto' },
  aprobado: { etiqueta: 'Perfil aprobado', detalle: 'Tu perfil ya es visible para los clientes.', clase: 'bg-ok/15 text-ok' },
  suspendido: { etiqueta: 'Perfil suspendido', detalle: 'Tu perfil no está visible. Contactá a la administración si creés que es un error.', clase: 'bg-peligro/10 text-peligro' },
} as const

function FormularioPerfil({ uid, actual }: { uid: string; actual: Profesional | null }) {
  const { perfil } = useAuth()
  const { categorias, barrios } = useCatalogo()
  const [servicios, setServicios] = useState<ServicioForm[]>(
    actual ? actual.servicios.map(s => ({ nombre: s.nombre, detalle: s.detalle, precio: String(s.precio), unidad: s.unidad })) : [servicioVacio()],
  )
  const [errores, setErrores] = useState<Errores>({})
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cambiarServicio = (i: number, campo: keyof ServicioForm, valor: string) => setServicios(l => l.map((s, j) => (j === i ? { ...s, [campo]: valor } : s)))

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setOk('')
    const f = new FormData(e.currentTarget)
    const r = perfilProfesionalSchema.safeParse({
      nombre: f.get('nombre') ?? '', categoria: f.get('categoria') ?? '', oficio: f.get('oficio') ?? '', barrio: f.get('barrio') ?? '',
      horario: f.get('horario') ?? '', costoVisita: f.get('costoVisita') ?? '', descripcion: f.get('descripcion') ?? '', servicios,
    })
    if (!r.success) {
      const errs: Errores = {}
      for (const i of r.error.issues) errs[String(i.path[0])] ??= i.message
      setErrores(errs)
      return
    }
    setErrores({})
    setError('')
    setGuardando(true)
    const d = r.data
    // Ids estables para los servicios: los existentes conservan el suyo.
    const lista = d.servicios.map((s, i) => ({ id: actual?.servicios[i]?.id ?? `${uid.slice(0, 6)}-${Date.now().toString(36)}-${i + 1}`, ...s }))
    try {
      if (actual) {
        await updateDoc(doc(db, 'professionals', uid), { nombre: d.nombre, categoria: d.categoria, oficio: d.oficio, descripcion: d.descripcion, barrio: d.barrio, horario: d.horario, costoVisita: d.costoVisita, servicios: lista })
        setOk('Guardamos los cambios de tu perfil.')
      } else {
        await setDoc(doc(db, 'professionals', uid), {
          ownerId: uid, nombre: d.nombre, categoria: d.categoria, oficio: d.oficio, descripcion: d.descripcion, barrio: d.barrio, horario: d.horario, costoVisita: d.costoVisita, servicios: lista,
          foto: '', puntaje: 0, cantidadResenas: 0, distanciaKm: 2.5, dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'], anosExperiencia: 0, trabajosRealizados: 0,
          respuesta: 'Nuevo en CONFIX', resenas: [], disponibleHoy: true, estado: 'pendiente', isDemo: false, createdAt: serverTimestamp(),
        })
        setOk('Enviamos tu perfil. Un administrador lo va a revisar.')
      }
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={e => void guardar(e)} noValidate className="flex flex-col gap-4">
      <Campo etiqueta="Nombre público" name="nombre" defaultValue={actual?.nombre ?? perfil?.displayName ?? ''} error={errores.nombre} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Selector etiqueta="Categoría" name="categoria" defaultValue={actual?.categoria ?? ''} error={errores.categoria}>
          <option value="" disabled>Elegí una categoría</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </Selector>
        <Campo etiqueta="Oficio" name="oficio" defaultValue={actual?.oficio ?? ''} placeholder="Ej: Plomero matriculado" error={errores.oficio} />
        <Selector etiqueta="Barrio" name="barrio" defaultValue={actual?.barrio ?? ''} error={errores.barrio}>
          <option value="" disabled>Elegí tu barrio</option>
          {barrios.map(b => <option key={b} value={b}>{b}</option>)}
        </Selector>
        <Campo etiqueta="Horario de atención" name="horario" defaultValue={actual?.horario ?? ''} placeholder="Ej: 8:00 a 18:00" error={errores.horario} />
      </div>
      <Campo etiqueta="Costo de la visita ($)" name="costoVisita" type="number" inputMode="numeric" min={0} defaultValue={actual?.costoVisita ?? ''} error={errores.costoVisita} />
      <CampoTexto etiqueta="Contanos sobre tu trabajo" name="descripcion" defaultValue={actual?.descripcion ?? ''} error={errores.descripcion} />

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-bold">Servicios y precios (hasta {MAX_SERVICIOS})</legend>
        {servicios.map((s, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-3xl bg-secundario p-4">
            <Campo etiqueta="" aria-label={`Nombre del servicio ${i + 1}`} value={s.nombre} onChange={e => cambiarServicio(i, 'nombre', e.target.value)} placeholder="Ej: Destape de cañerías" />
            <Campo etiqueta="" aria-label={`Detalle del servicio ${i + 1}`} value={s.detalle} onChange={e => cambiarServicio(i, 'detalle', e.target.value)} placeholder="Detalle (opcional)" />
            <div className="grid grid-cols-2 gap-2">
              <Campo etiqueta="" aria-label={`Precio del servicio ${i + 1}`} type="number" inputMode="numeric" min={100} value={s.precio} onChange={e => cambiarServicio(i, 'precio', e.target.value)} placeholder="Precio $" />
              <Selector etiqueta="" aria-label={`Unidad del servicio ${i + 1}`} value={s.unidad} onChange={e => cambiarServicio(i, 'unidad', e.target.value)}>
                {UNIDADES_SERVICIO.map(u => <option key={u} value={u}>{u}</option>)}
              </Selector>
            </div>
            {servicios.length > 1 && (
              <button type="button" onClick={() => setServicios(l => l.filter((_, j) => j !== i))} aria-label={`Quitar servicio ${i + 1}`} className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-suave hover:text-peligro">
                <Trash2 className="size-4" aria-hidden="true" /> Quitar
              </button>
            )}
          </div>
        ))}
        {errores.servicios && <p className="text-sm font-medium text-peligro">{errores.servicios}</p>}
        {servicios.length < MAX_SERVICIOS && (
          <Boton variante="borde" onClick={() => setServicios(l => [...l, servicioVacio()])}><Plus className="size-4" aria-hidden="true" /> Agregar servicio</Boton>
        )}
      </fieldset>

      {error && <Alerta>{error}</Alerta>}
      {ok && <Alerta tipo="ok">{ok}</Alerta>}
      <Boton type="submit" disabled={guardando}>{guardando ? 'Guardando…' : actual ? 'Guardar cambios' : 'Enviar mi perfil'}</Boton>
    </form>
  )
}

/** /app/panel — panel del profesional: estado del perfil, solicitudes recibidas y edición del perfil público. */
export default function PanelProfesional() {
  const { usuario, perfil } = useAuth()
  const uid = usuario?.uid ?? null
  const refPerfil = useMemo(() => (uid ? doc(db, 'professionals', uid) : null), [uid])
  const mio = useDocumento<Profesional>(refPerfil)
  const consulta = useMemo(() => (uid ? query(collection(db, 'requests'), where('professionalOwnerId', '==', uid)) : null), [uid])
  const recibidas = useColeccion<Solicitud>(consulta)
  const { cargando: catalogoCargando } = useCatalogo()

  if (!perfil || !uid || mio.cargando || catalogoCargando) return <Cargando />
  const actual = mio.datos
  const estado = actual ? ESTADOS[actual.estado] : null

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 pt-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{actual ? 'Mi panel profesional' : 'Ofrecé tus servicios'}</h1>
        {!actual && <p className="mt-2 text-suave">Completá tu perfil. Un administrador lo revisa y, cuando lo aprueba, empezás a recibir pedidos de cotización.</p>}
      </div>

      {perfil.status === 'suspendido' && <Alerta>Tu cuenta está suspendida. Contactá a la administración.</Alerta>}
      {estado && (
        <section className={`flex flex-col gap-1 rounded-3xl p-5 ${estado.clase}`} aria-label="Estado del perfil">
          <p className="font-extrabold" data-testid="estado-perfil">{estado.etiqueta}</p>
          <p className="text-sm">{estado.detalle}</p>
        </section>
      )}
      {!actual && perfil.status === 'pendiente' && <Alerta tipo="aviso">Tu cuenta de profesional está pendiente de aprobación.</Alerta>}

      {actual && (
        <section aria-labelledby="titulo-recibidas" className="flex flex-col gap-3">
          <h2 id="titulo-recibidas" className="text-lg font-bold">Solicitudes recibidas</h2>
          {recibidas.error && <Alerta>{recibidas.error}</Alerta>}
          <ListaSolicitudes solicitudes={masNuevasPrimero(recibidas.datos)} modo="profesional" vacio="Todavía no recibiste solicitudes. Van a aparecer acá cuando un cliente te pida una cotización." />
        </section>
      )}

      <section aria-labelledby="titulo-perfil" className="flex flex-col gap-3">
        <h2 id="titulo-perfil" className="text-lg font-bold">{actual ? 'Mi perfil público' : 'Tu perfil'}</h2>
        <FormularioPerfil key={actual?.id ?? 'nuevo'} uid={uid} actual={actual} />
      </section>
    </div>
  )
}
