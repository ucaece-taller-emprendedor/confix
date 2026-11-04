import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

// Primera barrera (optimista): solo mira si existe la cookie de sesión.
// La validación real de sesión y rol se hace en el servidor con `requireRole` / `checkRole`.
const RUTAS_PRIVADAS_APP = ['/app/cuenta', '/app/mis-solicitudes', '/app/panel']

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const tieneSesion = Boolean(getSessionCookie(request))

  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !tieneSesion) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (RUTAS_PRIVADAS_APP.some((ruta) => pathname.startsWith(ruta)) && !tieneSesion) {
    const destino = new URL('/app/ingresar', request.url)
    destino.searchParams.set('next', pathname + search)
    return NextResponse.redirect(destino)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/app/:path*'],
}
