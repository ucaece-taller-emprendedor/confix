import { ChevronDown, ClipboardList, Home, LogOut, MapPin, Search, User } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { MARCA, panelDe } from '@/config/app'
import { CatalogoProvider, useCatalogo } from '@/lib/CatalogoContext'
import { useSolicitud } from '@/lib/SolicitudContext'
import { Marca } from './Marca'
import { Boton } from './ui'

export type EnlaceNav = { to: string; etiqueta: string; fin?: boolean }

const enlace = ({ isActive }: { isActive: boolean }) => `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-acento text-acento-texto' : 'text-suave hover:text-texto'}`
const botonCabecera = 'inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold'

function Pie() {
  return (
    <footer className="border-t border-borde">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-suave sm:flex-row sm:items-center sm:justify-between">
        <p>{MARCA.nombre} · Proyecto del Taller Emprendedor, Universidad CAECE.</p>
        <Link to="/admin/login" className="hover:text-texto hover:underline">Acceso administración</Link>
      </div>
    </footer>
  )
}

/** Cabecera de la web pública (landing). */
export function SitioLayout() {
  const { perfil, usuario, salir } = useAuth()
  const navegar = useNavigate()
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-borde/70 bg-fondo/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4">
          <Marca to="/" />
          <nav aria-label="Acceso" className="flex items-center gap-2">
            {usuario && perfil ? (
              <>
                <Link to={panelDe(perfil.role)} className={`${botonCabecera} bg-primario text-primario-texto hover:opacity-90`}>Mi panel</Link>
                <button type="button" onClick={() => void salir().then(() => navegar('/'))} className={`${botonCabecera} hover:bg-secundario`}><LogOut className="size-4" aria-hidden /> Salir</button>
              </>
            ) : (
              <>
                <Link to="/app/ingresar" className={`${botonCabecera} hover:bg-secundario`}>Ingresar</Link>
                <Link to="/app/registro" className={`${botonCabecera} bg-primario text-primario-texto hover:opacity-90`}>Registrarme</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <Pie />
    </div>
  )
}

function SelectorBarrio() {
  const { barrios } = useCatalogo()
  const { barrio, setBarrio } = useSolicitud()
  if (barrios.length === 0) return null
  return (
    <label className="relative flex items-center">
      <span className="sr-only">Tu zona</span>
      <MapPin className="pointer-events-none absolute left-3 size-4 text-primario" aria-hidden="true" />
      <select value={barrio || barrios[0]} onChange={e => setBarrio(e.target.value)} className="h-10 max-w-40 appearance-none truncate rounded-full bg-secundario pl-9 pr-8 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primario">
        {barrios.map(b => <option key={b} value={b}>{b}, CABA</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-suave" aria-hidden="true" />
    </label>
  )
}

function EnlacesApp() {
  const { perfil } = useAuth()
  const { cantidadTotal } = useSolicitud()
  const base: EnlaceNav[] = [{ to: '/app', etiqueta: 'Inicio', fin: true }, { to: '/app/buscar', etiqueta: 'Buscar' }]
  const cliente = !perfil || perfil.role === 'cliente'
  const enlaces: EnlaceNav[] = [
    ...base,
    ...(cliente ? [{ to: '/app/solicitud', etiqueta: 'Mi solicitud' }] : []),
    ...(perfil?.role === 'cliente' ? [{ to: '/app/mis-solicitudes', etiqueta: 'Mis solicitudes' }] : []),
    ...(perfil?.role === 'profesional' ? [{ to: '/app/panel', etiqueta: 'Mi panel' }] : []),
  ]
  return (
    <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
      {enlaces.map(n => (
        <NavLink key={n.to} to={n.to} end={n.fin} className={enlace}>
          {n.etiqueta}
          {n.to === '/app/solicitud' && cantidadTotal > 0 && <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-primario px-1.5 text-xs text-primario-texto">{cantidadTotal}</span>}
        </NavLink>
      ))}
    </nav>
  )
}

function NavInferior() {
  const { perfil } = useAuth()
  const { cantidadTotal } = useSolicitud()
  const { pathname } = useLocation()
  if (pathname.startsWith('/app/profesional/')) return null
  const items = [
    { to: '/app', etiqueta: 'Inicio', icono: Home, fin: true },
    { to: '/app/buscar', etiqueta: 'Buscar', icono: Search },
    ...(perfil?.role === 'profesional' ? [] : [{ to: '/app/solicitud', etiqueta: 'Solicitud', icono: ClipboardList }]),
    perfil ? { to: panelDe(perfil.role) === '/app' ? '/app/mis-solicitudes' : panelDe(perfil.role), etiqueta: perfil.role === 'profesional' ? 'Mi panel' : 'Pedidos', icono: User } : { to: '/app/ingresar', etiqueta: 'Ingresar', icono: User },
  ]
  return (
    <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-30 border-t border-borde bg-fondo/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="mx-auto flex h-16 max-w-md items-stretch justify-around px-2">
        {items.map(({ to, etiqueta, icono: Icono, fin }) => (
          <li key={to} className="flex-1">
            <NavLink to={to} end={fin} className={({ isActive }) => `flex h-full flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors ${isActive ? 'text-primario' : 'text-suave'}`}>
              {({ isActive }) => (
                <>
                  <span className={`relative flex h-8 w-14 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-acento' : ''}`}>
                    <Icono className="size-5" aria-hidden />
                    {to === '/app/solicitud' && cantidadTotal > 0 && <span className="absolute -right-0.5 -top-1 flex min-w-4 items-center justify-center rounded-full bg-primario px-1 text-[10px] font-bold text-primario-texto">{cantidadTotal}</span>}
                  </span>
                  {etiqueta}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Cabecera + navegación inferior de la app de clientes y profesionales (/app/...). */
export function AppLayout() {
  const { perfil, usuario, salir } = useAuth()
  const navegar = useNavigate()
  return (
    <CatalogoProvider>
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-30 border-b border-borde/70 bg-fondo/90 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4">
            <Marca to="/app" />
            <EnlacesApp />
            <div className="flex items-center gap-2">
              <SelectorBarrio />
              {usuario && perfil ? (
                <button type="button" aria-label="Salir" onClick={() => void salir().then(() => navegar('/'))} className={`${botonCabecera} bg-primario text-primario-texto hover:opacity-90`}>
                  <LogOut className="size-4" aria-hidden /> <span className="hidden sm:inline">{perfil.displayName.split(' ')[0]} · </span>Salir
                </button>
              ) : (
                <Link to="/app/ingresar" className={`${botonCabecera} hidden bg-primario text-primario-texto hover:opacity-90 md:inline-flex`}><User className="size-4" aria-hidden /> Ingresar</Link>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 md:pb-16"><Outlet /></main>
        <NavInferior />
        <div className="hidden md:block"><Pie /></div>
      </div>
    </CatalogoProvider>
  )
}

/** Panel de administración: barra lateral en escritorio, menú horizontal en el celular. */
export function AdminLayout({ navegacion }: { navegacion: EnlaceNav[] }) {
  const { usuario, salir } = useAuth()
  const navegar = useNavigate()
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[14rem_1fr]">
      <aside className="border-b border-borde bg-secundario p-4 md:border-r md:border-b-0">
        <Marca to="/admin" />
        <p className="mt-1 text-xs text-suave">Panel de administración</p>
        <nav aria-label="Administración" className="mt-4 flex flex-wrap gap-1 md:flex-col">
          {navegacion.map(n => (
            <NavLink key={n.to} to={n.to} end={n.fin} className={({ isActive }) => `rounded-full px-3 py-2 text-sm font-semibold ${isActive ? 'bg-primario text-primario-texto' : 'hover:bg-acento'}`}>{n.etiqueta}</NavLink>
          ))}
        </nav>
        <p className="mt-6 hidden truncate text-xs text-suave md:block">{usuario?.email}</p>
        <Boton variante="borde" className="mt-2 bg-fondo" onClick={() => void salir().then(() => navegar('/admin/login'))}><LogOut className="size-4" aria-hidden /> Salir</Boton>
      </aside>
      <main className="min-w-0 p-4 md:p-8"><Outlet /></main>
    </div>
  )
}
