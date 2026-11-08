import { createBrowserRouter, Navigate } from 'react-router'
import { RequireAdmin, RequireRole } from '@/auth/guards'
import { AdminLayout, AppLayout, SitioLayout } from '@/components/layouts'
import Administradores from '@/pages/admin/Administradores'
import AdminLogin from '@/pages/admin/AdminLogin'
import { AdminCatalogo, AdminInicio, AdminProfesionales, AdminSolicitudes, AdminUsuarios } from '@/pages/admin/AdminPaginas'
import { CompletarPerfil, Ingresar, Registro, Suspendido } from '@/pages/app/Acceso'
import Buscar from '@/pages/app/Buscar'
import Inicio from '@/pages/app/Inicio'
import MisSolicitudes from '@/pages/app/MisSolicitudes'
import PanelProfesional from '@/pages/app/PanelProfesional'
import ProfesionalDetalle from '@/pages/app/ProfesionalDetalle'
import Solicitud from '@/pages/app/Solicitud'
import Landing from '@/pages/public/Landing'
import NoEncontrada from '@/pages/public/NoEncontrada'

export const router = createBrowserRouter([
  { path: '/', element: <SitioLayout />, children: [{ index: true, element: <Landing /> }] },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      // Explorar es público; pedir cotización o gestionar el perfil requiere cuenta.
      { index: true, element: <Inicio /> },
      { path: 'buscar', element: <Buscar /> },
      { path: 'profesional/:id', element: <ProfesionalDetalle /> },
      { path: 'solicitud', element: <Solicitud /> },
      { path: 'ingresar', element: <Ingresar /> },
      { path: 'registro', element: <Registro /> },
      { path: 'completar-perfil', element: <CompletarPerfil /> },
      { path: 'suspendido', element: <Suspendido /> },
      { path: 'mis-solicitudes', element: <RequireRole roles={['cliente']}><MisSolicitudes /></RequireRole> },
      { path: 'panel', element: <RequireRole roles={['profesional']}><PanelProfesional /></RequireRole> },
    ],
  },
  { path: '/admin/login', element: <AdminLogin /> },
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AdminLayout navegacion={[{ to: '/admin', etiqueta: 'Resumen', fin: true }, { to: '/admin/profesionales', etiqueta: 'Profesionales' }, { to: '/admin/usuarios', etiqueta: 'Usuarios' }, { to: '/admin/administradores', etiqueta: 'Administradores' }, { to: '/admin/solicitudes', etiqueta: 'Solicitudes' }, { to: '/admin/catalogo', etiqueta: 'Catálogo' }]} />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <AdminInicio /> },
      { path: 'profesionales', element: <AdminProfesionales /> },
      { path: 'usuarios', element: <AdminUsuarios /> },
      { path: 'administradores', element: <Administradores /> },
      { path: 'solicitudes', element: <AdminSolicitudes /> },
      { path: 'catalogo', element: <AdminCatalogo /> },
      { path: '*', element: <Navigate to="/admin" replace /> },
    ],
  },
  { path: '*', element: <SitioLayout />, children: [{ path: '*', element: <NoEncontrada /> }] },
])
