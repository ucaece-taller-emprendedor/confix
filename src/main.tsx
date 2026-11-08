import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { AuthProvider } from '@/auth/AuthContext'
import { SolicitudProvider } from '@/lib/SolicitudContext'
import { iniciarAnalytics, registrarVisita } from '@/lib/analytics'
import { router } from './router'
import './styles/index.css'

iniciarAnalytics()
let ultimaRuta = ''
router.subscribe(estado => {
  if (estado.location.pathname !== ultimaRuta) {
    ultimaRuta = estado.location.pathname
    registrarVisita(ultimaRuta)
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SolicitudProvider>
        <RouterProvider router={router} />
      </SolicitudProvider>
    </AuthProvider>
  </StrictMode>,
)
