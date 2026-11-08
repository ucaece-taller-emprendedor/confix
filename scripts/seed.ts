/**
 * Datos de DEMO (todo marcado isDemo: true). Por defecto corre contra los EMULADORES. Para producción: FIREBASE_PROJECT_ID=... GOOGLE_APPLICATION_CREDENTIALS=... npm run seed -- --produccion --yes
 *   1) npm run emuladores   (en otra terminal)
 *   2) npm run seed
 * Es idempotente: se puede correr varias veces.
 */
import { pathToFileURL } from 'node:url'
import { BARRIOS, CATEGORIAS } from './datos/catalogo'
import { PROFESIONALES_DEMO } from './datos/profesionales-demo'
import { iniciarAdmin } from './lib/admin-sdk'

export const CLAVE_DEMO = 'Demo-Clave-2026' // pública, solo existe en los emuladores

export const USUARIOS_DEMO = [
  { uid: 'demo-cliente', email: 'cliente.demo@confix.test', displayName: 'Clara Cliente (demo)', role: 'cliente', status: 'activo' },
  { uid: 'demo-profesional', email: 'profesional.demo@confix.test', displayName: 'Esteban Gómez (demo)', role: 'profesional', status: 'activo' },
  { uid: 'demo-profesional-pendiente', email: 'pendiente.demo@confix.test', displayName: 'Paula Pendiente (demo)', role: 'profesional', status: 'pendiente' },
  { uid: 'demo-admin', email: 'admin.demo@confix.test', displayName: 'Ada Admin (demo)', role: 'admin', status: 'activo' },
] as const

/** En producción NO se crean cuentas demo (tendrían contraseña pública): solo datos de ejemplo. */
function usuariosDemoActivos() {
  return process.argv.includes('--produccion') ? [] : USUARIOS_DEMO
}

export async function sembrar() {
  const { auth, db, esEmulador } = iniciarAdmin({ produccion: process.argv.includes('--produccion') })
  if (!esEmulador && !process.argv.includes('--yes')) throw new Error('Para sembrar PRODUCCIÓN agregá --produccion --yes (en producción solo se cargan datos de ejemplo, sin cuentas demo).')

  for (const u of usuariosDemoActivos()) {
    const datos = { email: u.email, displayName: u.displayName, password: CLAVE_DEMO, emailVerified: true }
    await auth.updateUser(u.uid, datos).catch(() => auth.createUser({ uid: u.uid, ...datos }))
    await auth.setCustomUserClaims(u.uid, u.role === 'admin' ? { admin: true } : {})
    await db.doc(`users/${u.uid}`).set({ email: u.email, displayName: u.displayName, role: u.role, status: u.status, isDemo: true, createdAt: new Date() })
  }

  for (const c of CATEGORIAS) {
    const { id, ...datos } = c
    await db.doc(`categories/${id}`).set({ ...datos, activa: true })
  }
  for (const [i, nombre] of BARRIOS.entries()) await db.doc(`barrios/${nombre}`).set({ nombre, orden: i + 1, activo: true })

  // Profesionales del catálogo original. Esteban tiene cuenta para ingresar; el resto son perfiles sin login.
  for (const p of PROFESIONALES_DEMO) {
    const { id, ...datos } = p
    const esEsteban = id === 'esteban-gomez'
    const docId = esEsteban ? 'demo-profesional' : id
    await db.doc(`professionals/${docId}`).set({ ...datos, ownerId: esEsteban ? 'demo-profesional' : `demo-${id}`, estado: 'aprobado', isDemo: true, createdAt: new Date() })
  }

  // Un profesional PENDIENTE, para probar la aprobación desde el panel de administración.
  await db.doc('professionals/demo-profesional-pendiente').set({
    ownerId: 'demo-profesional-pendiente', nombre: 'Paula Pendiente', categoria: 'pintura', oficio: 'Pintora', barrio: 'Palermo', horario: '9:00 a 17:00', costoVisita: 4000,
    descripcion: 'Perfil de ejemplo esperando aprobación del equipo de CONFIX. Pintura de interiores y retoques.',
    servicios: [{ id: 'pp-1', nombre: 'Pintura de ambiente', detalle: 'Paredes y techo', precio: 50000, unidad: 'por ambiente' }],
    foto: '', puntaje: 0, cantidadResenas: 0, distanciaKm: 2.5, dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'], anosExperiencia: 0, trabajosRealizados: 0,
    respuesta: 'Nuevo en CONFIX', resenas: [], disponibleHoy: true, estado: 'pendiente', isDemo: true, createdAt: new Date(),
  })

  // Una solicitud de ejemplo de la clienta demo a Esteban.
  const esteban = PROFESIONALES_DEMO.find(p => p.id === 'esteban-gomez')
  const servicio = esteban?.servicios[0]
  if (esteban && servicio) {
    await db.doc('requests/CFX-DEMO01').set({
      clientId: 'demo-cliente', professionalId: 'demo-profesional', professionalOwnerId: 'demo-profesional', professionalNombre: esteban.nombre,
      items: [{ nombre: servicio.nombre, precio: servicio.precio, cantidad: 1 }], direccion: 'Thames 1450, 3° B · Palermo, CABA', piso: '3° B', barrio: 'Palermo',
      fecha: 'lunes (ejemplo)', franja: 'Mañana (8 a 12 h)', notas: 'Solicitud de ejemplo (demo).', contactoNombre: 'Clara Cliente (demo)', contactoTelefono: '11 5555 0000',
      costoVisita: esteban.costoVisita, total: servicio.precio + esteban.costoVisita, estado: 'pendiente', isDemo: true, createdAt: new Date(),
    })
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  sembrar()
    .then(() => {
      console.log('✔ Seed de demo listo (emuladores). Usuarios DEMO (clave pública de demo):')
      for (const u of usuariosDemoActivos()) console.log(`  ${u.role.padEnd(12)} ${u.email}  /  ${CLAVE_DEMO}`)
    })
    .catch((e: unknown) => {
      console.error(`✖ ${e instanceof Error ? e.message : String(e)}`)
      process.exit(1)
    })
}
