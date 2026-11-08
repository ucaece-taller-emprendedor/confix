/**
 * Carga el catálogo base (categorías y barrios) que la app necesita para funcionar.
 *   npm run catalogo               → contra los EMULADORES
 *   npm run catalogo:prod          → contra PRODUCCIÓN (necesita FIREBASE_PROJECT_ID y credenciales de Google;
 *                                    lo corre el responsable del proyecto UNA vez, después de desplegar las reglas)
 * No pisa lo que ya existe (si el admin editó una categoría, se respeta).
 */
import { pathToFileURL } from 'node:url'
import { iniciarAdmin } from './lib/admin-sdk'
import { BARRIOS, CATEGORIAS } from './datos/catalogo'

export async function cargarCatalogo(opciones: { produccion?: boolean } = {}) {
  const { db, projectId, esEmulador } = iniciarAdmin(opciones)
  // Solo crea lo que falta: no pisa lo que el admin haya editado.
  let nuevos = 0
  for (const c of CATEGORIAS) {
    const { id, ...datos } = c
    if (!(await db.doc(`categories/${id}`).get()).exists) {
      await db.doc(`categories/${id}`).set({ ...datos, activa: true })
      nuevos++
    }
  }
  for (const [i, nombre] of BARRIOS.entries()) {
    if (!(await db.doc(`barrios/${nombre}`).get()).exists) {
      await db.doc(`barrios/${nombre}`).set({ nombre, orden: i + 1, activo: true })
      nuevos++
    }
  }
  return { nuevos, projectId, esEmulador }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  cargarCatalogo({ produccion: process.argv.includes('--produccion') })
    .then(r => console.log(`✔ Catálogo listo en ${r.projectId}${r.esEmulador ? ' (emulador)' : ''}: ${r.nuevos} documentos nuevos.`))
    .catch((e: unknown) => {
      console.error(`✖ ${e instanceof Error ? e.message : String(e)}`)
      process.exit(1)
    })
}
