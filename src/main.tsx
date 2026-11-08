import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { AuthProvider } from '@/auth/AuthContext'
import { SolicitudProvider } from '@/lib/SolicitudContext'
import { router } from './router'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SolicitudProvider>
        <RouterProvider router={router} />
      </SolicitudProvider>
    </AuthProvider>
  </StrictMode>,
)
