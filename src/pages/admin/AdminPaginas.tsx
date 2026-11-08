import { collection, doc, query, setDoc, updateDoc, writeBatch } from 'firebase/firestore'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { EstadoSolicitudEtiqueta } from '@/components/confix'
import { Alerta, Boton, Campo, Cargando, EstadoVacio, Etiqueta, Selector } from '@/components/ui'
import { ETIQUETA_ROL, type Estado, type Rol } from '@/config/app'
import { useColeccion } from '@/hooks/useColeccion'
import { db } from '@/lib/firebase'
import { formatoPrecio, masNuevasPrimero, type Barrio, type Categoria, type EstadoProfesional, type Profesional, type Solicitud } from '@/lib/tipos'
import { barrioSchema, categoriaSchema } from '@/lib/validations/confix'
import { mensajeDeError, validarFormulario, type Errores } from '@/lib/validations/form'

type Usuario = { email: string; displayName: string; role: Rol; status: Estado; isDemo: boolean }

const Q_USUARIOS = query(collection(db, 'users'))
const Q_PROFESIONALES = query(collection(db, 'professionals'))
const Q_SOLICITUDES = query(collection(db, 'requests'))
const Q_CATEGORIAS = query(collection(db, 'categories'))
const Q_BARRIOS = query(collection(db, 'barrios'))

const ESTILO_ESTADO: Record<string, string> = { pendiente: 'bg-acento text-acento-texto', aprobado: 'bg-ok/15 text-ok', activo: 'bg-ok/15 text-ok', suspendido: 'bg-peligro/10 text-peligro' }
const Insignia = ({ valor }: { valor: string }) => <span className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize ${ESTILO_ESTADO[valor] ?? ''}`}>{valor}</span>
const Titulo = ({ children }: { children: string }) => <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{children}</h1>

export function AdminInicio() {
  const u = useColeccion<Usuario>(Q_USUARIOS)
  const p = useColeccion<Profesional>(Q_PROFESIONALES)
  const s = useColeccion<Solicitud>(Q_SOLICITUDES)
  const pendientes = p.datos.filter(x => x.estado === 'pendiente').length
  const tarjetas = [
    { etiqueta: 'Usuarios', valor: u.datos.length, a: '/admin/usuarios', id: 'usuarios' },
    { etiqueta: 'Profesionales pendientes', valor: pendientes, a: '/admin/profesionales', id: 'pendientes', destacada: pendientes > 0 },
    { etiqueta: 'Profesionales aprobados', valor: p.datos.filter(x => x.estado === 'aprobado').length, a: '/admin/profesionales', id: 'aprobados' },
    { etiqueta: 'Solicitudes', valor: s.datos.length, a: '/admin/solicitudes', id: 'solicitudes' },
  ]
  return (
    <div className="flex flex-col gap-6">
      <Titulo>Administración</Titulo>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tarjetas.map(t => (
          <li key={t.etiqueta}>
            <Link to={t.a} className={`flex h-full flex-col gap-1 rounded-3xl p-5 transition-colors ${t.destacada ? 'bg-primario text-primario-texto hover:opacity-90' : 'bg-secundario hover:bg-acento'}`}>
              <span className="text-3xl font-extrabold" data-testid={t.id}>{t.valor}</span>
              <span className="text-sm font-semibold">{t.etiqueta}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AdminUsuarios() {
  const { datos, cargando, error } = useColeccion<Usuario>(Q_USUARIOS)
  const [aviso, setAviso] = useState('')

  async function cambiar(uid: string, status: Estado) {
    setAviso('')
    try {
      await updateDoc(doc(db, 'users', uid), { status })
    } catch (e) {
      setAviso(mensajeDeError(e))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Titulo>Usuarios</Titulo>
      {(error || aviso) && <Alerta>{error ?? aviso}</Alerta>}
      {cargando ? <Cargando /> : datos.length === 0 ? <EstadoVacio>No hay usuarios.</EstadoVacio> : (
        <div className="overflow-x-auto rounded-3xl bg-secundario">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-borde text-xs uppercase text-suave"><tr><th className="p-3">Usuario</th><th className="p-3">Tipo</th><th className="p-3">Estado</th></tr></thead>
            <tbody>
              {[...datos].sort((a, b) => a.email.localeCompare(b.email)).map(u => (
                <tr key={u.id} className="border-b border-borde last:border-0" data-testid={`usuario-${u.email}`}>
                  <td className="p-3"><p className="font-medium">{u.displayName} {u.isDemo && <Etiqueta tono="demo">DEMO</Etiqueta>}</p><p className="text-xs text-suave">{u.email}</p></td>
                  <td className="p-3">{ETIQUETA_ROL[u.role]}</td>
                  <td className="p-3">
                    {u.role === 'cliente' ? (
                      <Selector etiqueta="" aria-label={`Estado de ${u.email}`} value={u.status} onChange={e => void cambiar(u.id, e.target.value as Estado)}>
                        <option value="activo">activo</option><option value="suspendido">suspendido</option>
                      </Selector>
                    ) : u.role === 'profesional' ? (
                      <span className="flex items-center gap-2"><Insignia valor={u.status} /><Link to="/admin/profesionales" className="text-xs font-semibold text-primario hover:underline">Gestionar</Link></span>
                    ) : <Insignia valor={u.status} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function AdminProfesionales() {
  const pros = useColeccion<Profesional>(Q_PROFESIONALES)
  const usuarios = useColeccion<Usuario>(Q_USUARIOS)
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)

  /** Aprobar / suspender: el perfil y el usuario cambian juntos (las reglas lo exigen). */
  async function cambiar(p: Profesional, estado: EstadoProfesional) {
    setAviso('')
    setOcupado(true)
    try {
      const lote = writeBatch(db)
      lote.update(doc(db, 'professionals', p.id), { estado })
      if (usuarios.datos.some(u => u.id === p.ownerId)) lote.update(doc(db, 'users', p.ownerId), { status: estado === 'aprobado' ? 'activo' : estado })
      await lote.commit()
    } catch (e) {
      setAviso(mensajeDeError(e))
    } finally {
      setOcupado(false)
    }
  }

  // Los pendientes primero: es lo que el admin tiene que resolver.
  const ordenados = [...pros.datos].sort((a, b) => Number(b.estado === 'pendiente') - Number(a.estado === 'pendiente') || a.nombre.localeCompare(b.nombre, 'es'))
  const emailDe = (p: Profesional) => usuarios.datos.find(u => u.id === p.ownerId)?.email

  return (
    <div className="flex flex-col gap-4">
      <Titulo>Profesionales</Titulo>
      {(pros.error || aviso) && <Alerta>{pros.error ?? aviso}</Alerta>}
      {pros.cargando || usuarios.cargando ? <Cargando /> : ordenados.length === 0 ? <EstadoVacio>Todavía no hay profesionales registrados.</EstadoVacio> : (
        <ul className="flex flex-col gap-3">
          {ordenados.map(p => (
            <li key={p.id} className="flex flex-col gap-3 rounded-3xl bg-secundario p-5" data-testid={`profesional-${p.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-bold"><span className="truncate">{p.nombre}</span> {p.isDemo && <Etiqueta tono="demo">DEMO</Etiqueta>}</p>
                  <p className="text-sm text-suave">{p.oficio} · {p.barrio}{emailDe(p) ? ` · ${emailDe(p)}` : ''}</p>
                </div>
                <Insignia valor={p.estado} />
              </div>
              <p className="line-clamp-2 text-sm text-suave">{p.descripcion}</p>
              <div className="flex flex-wrap gap-2">
                {p.estado !== 'aprobado' && <Boton disabled={ocupado} onClick={() => void cambiar(p, 'aprobado')} aria-label={`Aprobar a ${p.nombre}`}>{p.estado === 'suspendido' ? 'Reactivar' : 'Aprobar'}</Boton>}
                {p.estado !== 'suspendido' && <Boton variante="borde" className="bg-fondo" disabled={ocupado} onClick={() => void cambiar(p, 'suspendido')} aria-label={`Suspender a ${p.nombre}`}>Suspender</Boton>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function AdminSolicitudes() {
  const { datos, cargando, error } = useColeccion<Solicitud>(Q_SOLICITUDES)
  return (
    <div className="flex flex-col gap-4">
      <Titulo>Solicitudes</Titulo>
      {error && <Alerta>{error}</Alerta>}
      {cargando ? <Cargando /> : datos.length === 0 ? <EstadoVacio>Todavía no hay solicitudes.</EstadoVacio> : (
        <ul className="flex flex-col gap-2">
          {masNuevasPrimero(datos).map(s => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secundario p-4">
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-primario">{s.id} {s.isDemo && <Etiqueta tono="demo">DEMO</Etiqueta>}</p>
                <p className="font-bold">{s.contactoNombre} → {s.professionalNombre}</p>
                <p className="text-sm text-suave">{s.direccion}</p>
              </div>
              <div className="flex items-center gap-3"><span className="font-bold">{formatoPrecio(s.total)}</span><EstadoSolicitudEtiqueta estado={s.estado} /></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function AdminCatalogo() {
  const cats = useColeccion<Categoria>(Q_CATEGORIAS)
  const bars = useColeccion<Barrio>(Q_BARRIOS)
  const [errCat, setErrCat] = useState<Errores>({})
  const [errBar, setErrBar] = useState<Errores>({})
  const [aviso, setAviso] = useState('')

  const intentar = async (fn: () => Promise<void>) => {
    setAviso('')
    try {
      await fn()
    } catch (e) {
      setAviso(mensajeDeError(e))
    }
  }

  async function nuevaCategoria(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const r = validarFormulario(categoriaSchema, form)
    setErrCat(r.errores ?? {})
    if (!r.datos) return
    const { id, nombre, descripcion } = r.datos
    await intentar(async () => {
      await setDoc(doc(db, 'categories', id), { nombre, descripcion, orden: cats.datos.length + 1, activa: true })
      form.reset()
    })
  }
  async function nuevoBarrio(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const r = validarFormulario(barrioSchema, form)
    setErrBar(r.errores ?? {})
    if (!r.datos) return
    const nombre = r.datos.nombre
    await intentar(async () => {
      await setDoc(doc(db, 'barrios', nombre), { nombre, orden: bars.datos.length + 1, activo: true })
      form.reset()
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <Titulo>Catálogo</Titulo>
      {aviso && <Alerta>{aviso}</Alerta>}
      <section aria-labelledby="t-cat" className="flex flex-col gap-3">
        <h2 id="t-cat" className="text-lg font-bold">Categorías</h2>
        {cats.cargando ? <Cargando /> : (
          <ul className="flex flex-col gap-2">
            {[...cats.datos].sort((a, b) => a.orden - b.orden).map(c => (
              <li key={c.id} className="flex items-center justify-between gap-3 rounded-2xl bg-secundario p-4">
                <div className="min-w-0"><p className={`font-bold ${c.activa ? '' : 'text-suave line-through'}`}>{c.nombre}</p><p className="truncate text-sm text-suave">{c.descripcion}</p></div>
                <Boton variante="borde" className="bg-fondo" onClick={() => void intentar(() => updateDoc(doc(db, 'categories', c.id), { activa: !c.activa }))} aria-label={`${c.activa ? 'Desactivar' : 'Activar'} ${c.nombre}`}>{c.activa ? 'Desactivar' : 'Activar'}</Boton>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={e => void nuevaCategoria(e)} noValidate className="grid gap-3 rounded-3xl bg-secundario p-4 sm:grid-cols-3">
          <Campo etiqueta="Identificador" name="id" placeholder="gasista" error={errCat.id} />
          <Campo etiqueta="Nombre" name="nombre" placeholder="Gas" error={errCat.nombre} />
          <Campo etiqueta="Descripción" name="descripcion" error={errCat.descripcion} />
          <Boton type="submit" className="sm:col-span-3">Agregar categoría</Boton>
        </form>
      </section>
      <section aria-labelledby="t-bar" className="flex flex-col gap-3">
        <h2 id="t-bar" className="text-lg font-bold">Barrios</h2>
        {bars.cargando ? <Cargando /> : (
          <ul className="flex flex-col gap-2">
            {[...bars.datos].sort((a, b) => a.orden - b.orden).map(b => (
              <li key={b.id} className="flex items-center justify-between gap-3 rounded-2xl bg-secundario p-4">
                <p className={`font-bold ${b.activo ? '' : 'text-suave line-through'}`}>{b.nombre}</p>
                <Boton variante="borde" className="bg-fondo" onClick={() => void intentar(() => updateDoc(doc(db, 'barrios', b.id), { activo: !b.activo }))} aria-label={`${b.activo ? 'Desactivar' : 'Activar'} ${b.nombre}`}>{b.activo ? 'Desactivar' : 'Activar'}</Boton>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={e => void nuevoBarrio(e)} noValidate className="flex flex-col gap-3 rounded-3xl bg-secundario p-4">
          <Campo etiqueta="Nombre del barrio" name="nombre" placeholder="Almagro" error={errBar.nombre} />
          <Boton type="submit">Agregar barrio</Boton>
        </form>
      </section>
    </div>
  )
}
