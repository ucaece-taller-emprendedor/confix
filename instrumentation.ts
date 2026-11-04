// Valida las variables de entorno al arrancar el servidor: si falta alguna, falla acá
// con un mensaje claro en vez de romper más tarde en una pantalla cualquiera.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('@/lib/env')
  }
}
