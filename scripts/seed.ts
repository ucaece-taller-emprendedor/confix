// Datos de DEMO para mostrar en clase. Todo lo que crea queda marcado con esDemo = true,
// y volver a correrlo borra y recrea solo esos datos (no toca lo que cargó gente real).
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { hashPassword } from 'better-auth/crypto'
import { db, pool } from '@/lib/db'
import { account, professionalProfile, serviceRequest, user } from '@/lib/db/schema'
import { PROFESIONALES_DEMO } from './datos/profesionales-demo'

export const PASSWORD_DEMO = 'Demo-2026!'

const USUARIOS_DEMO = [
  { name: 'Clara Cliente (demo)', email: 'cliente@demo.confix.test', role: 'cliente' },
  { name: 'Esteban Gómez (demo)', email: 'profesional@demo.confix.test', role: 'profesional' },
  { name: 'Ada Admin (demo)', email: 'admin@demo.confix.test', role: 'admin' },
] as const

async function main() {
  const passwordHash = await hashPassword(PASSWORD_DEMO)

  await db.transaction(async (tx) => {
    // Borra solo lo marcado como demo (las solicitudes caen por la cascada del usuario).
    await tx.delete(professionalProfile).where(eq(professionalProfile.esDemo, true))
    await tx.delete(user).where(eq(user.esDemo, true))

    const ids: Record<string, string> = {}
    for (const demo of USUARIOS_DEMO) {
      const id = randomUUID()
      ids[demo.role] = id
      await tx.insert(user).values({ id, name: demo.name, email: demo.email, emailVerified: true, role: demo.role, esDemo: true })
      await tx.insert(account).values({ id: randomUUID(), accountId: id, providerId: 'credential', userId: id, password: passwordHash })
    }

    for (const profesional of PROFESIONALES_DEMO) {
      await tx.insert(professionalProfile).values({
        id: profesional.id,
        // El profesional demo con cuenta es Esteban; el resto son perfiles sin login.
        userId: profesional.id === 'esteban-gomez' ? ids.profesional : null,
        nombre: profesional.nombre,
        categoria: profesional.categoria,
        oficio: profesional.oficio,
        descripcion: profesional.descripcion,
        barrio: profesional.barrio,
        horario: profesional.horario,
        costoVisita: profesional.costoVisita,
        servicios: profesional.servicios,
        foto: profesional.foto,
        puntaje: profesional.puntaje,
        cantidadResenas: profesional.cantidadResenas,
        distanciaKm: profesional.distanciaKm,
        dias: profesional.dias,
        anosExperiencia: profesional.anosExperiencia,
        trabajosRealizados: profesional.trabajosRealizados,
        respuesta: profesional.respuesta,
        resenas: profesional.resenas,
        estado: 'aprobado',
        esDemo: true,
      })
    }

    const esteban = PROFESIONALES_DEMO.find((p) => p.id === 'esteban-gomez')!
    const servicio = esteban.servicios[0]
    await tx.insert(serviceRequest).values({
      id: 'CFX-DEMO01',
      clientId: ids.cliente,
      professionalId: esteban.id,
      professionalUserId: ids.profesional,
      professionalNombre: esteban.nombre,
      items: [{ nombre: servicio.nombre, precio: servicio.precio, cantidad: 1 }],
      direccion: 'Thames 1450, 3° B · Palermo, CABA',
      fecha: 'lunes (ejemplo)',
      franja: '9:00 a 12:00',
      notas: 'Solicitud de ejemplo (demo).',
      contactoNombre: 'Clara Cliente (demo)',
      contactoTelefono: '11 5555 0000',
      costoVisita: esteban.costoVisita,
      total: servicio.precio + esteban.costoVisita,
    })
  })

  console.log('Datos de demo cargados.')
  console.log(`Usuarios de demo (contraseña: ${PASSWORD_DEMO}):`)
  for (const demo of USUARIOS_DEMO) console.log(`  ${demo.role.padEnd(11)} ${demo.email}`)
}

main()
  .catch((error) => {
    console.error('No se pudo cargar el seed de demo:', error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
