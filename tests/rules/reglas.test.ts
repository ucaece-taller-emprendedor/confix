import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { crearEntorno } from './ayuda'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await crearEntorno('demo-confix-reglas')
})
afterAll(async () => env.cleanup())

const servicio = (n = 1) => ({ id: `s-${n}`, nombre: `Servicio número ${n}`, detalle: 'Detalle', precio: 10000, unidad: 'por trabajo' })
const perfilBase = {
  nombre: 'Pro Nuevo', categoria: 'plomeria', oficio: 'Plomero', barrio: 'Palermo', horario: '8:00 a 18:00', costoVisita: 5000,
  descripcion: 'Descripción de más de veinte caracteres.', servicios: [servicio()],
}
const perfilNuevo = (uid: string) => ({
  ...perfilBase, ownerId: uid, foto: '', puntaje: 0, cantidadResenas: 0, distanciaKm: 2.5, dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
  anosExperiencia: 0, trabajosRealizados: 0, respuesta: 'Nuevo en CONFIX', resenas: [], disponibleHoy: true,
  estado: 'pendiente', isDemo: false, createdAt: serverTimestamp(),
})
const solicitudNueva = (uid: string, extra: Record<string, unknown> = {}) => ({
  clientId: uid, professionalId: 'pro1', professionalOwnerId: 'pro1', professionalNombre: 'Pro Uno',
  items: [{ nombre: 'Servicio número 1', precio: 10000, cantidad: 2 }], direccion: 'Thames 1450', piso: '', barrio: 'Palermo',
  fecha: 'lunes 3 de noviembre', franja: 'Mañana (8 a 12 h)', notas: '', contactoNombre: 'Cliente Uno', contactoTelefono: '11 5555 0000',
  costoVisita: 5000, total: 25000, estado: 'pendiente', isDemo: false, createdAt: serverTimestamp(), ...extra,
})

beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore()
    const base = { isDemo: true, createdAt: new Date() }
    await setDoc(doc(db, 'users/cliente1'), { ...base, email: 'c1@test.com', displayName: 'Cliente Uno', role: 'cliente', status: 'activo' })
    await setDoc(doc(db, 'users/cliente2'), { ...base, email: 'c2@test.com', displayName: 'Cliente Dos', role: 'cliente', status: 'activo' })
    await setDoc(doc(db, 'users/cliente-susp'), { ...base, email: 'cs@test.com', displayName: 'Cliente Susp', role: 'cliente', status: 'suspendido' })
    await setDoc(doc(db, 'users/pro1'), { ...base, email: 'p1@test.com', displayName: 'Pro Uno', role: 'profesional', status: 'activo' })
    await setDoc(doc(db, 'users/pro2'), { ...base, email: 'p2@test.com', displayName: 'Pro Dos', role: 'profesional', status: 'activo' })
    await setDoc(doc(db, 'users/pro-pend'), { ...base, email: 'pp@test.com', displayName: 'Pro Pendiente', role: 'profesional', status: 'pendiente' })
    await setDoc(doc(db, 'categories/plomeria'), { nombre: 'Plomería', descripcion: 'Pérdidas', orden: 1, activa: true })
    await setDoc(doc(db, 'barrios/Palermo'), { nombre: 'Palermo', orden: 1, activo: true })
    const perfil = { ...perfilBase, foto: '', puntaje: 4.9, cantidadResenas: 10, distanciaKm: 1, dias: ['Lun'], anosExperiencia: 5, trabajosRealizados: 20, respuesta: 'Responde en 10 min', resenas: [], disponibleHoy: true, isDemo: true, createdAt: new Date() }
    await setDoc(doc(db, 'professionals/pro1'), { ...perfil, ownerId: 'pro1', nombre: 'Pro Uno', estado: 'aprobado' })
    await setDoc(doc(db, 'professionals/pro2'), { ...perfil, ownerId: 'pro2', nombre: 'Pro Dos', estado: 'aprobado' })
    await setDoc(doc(db, 'professionals/pro-pend'), { ...perfil, ownerId: 'pro-pend', nombre: 'Pro Pendiente', estado: 'pendiente' })
    await setDoc(doc(db, 'professionals/demo-sin-cuenta'), { ...perfil, ownerId: 'demo-sin-cuenta', nombre: 'Sin Cuenta', estado: 'aprobado' })
    await setDoc(doc(db, 'requests/sol1'), solicitudNueva('cliente1', { createdAt: new Date() }))
  })
})

const como = (uid: string, email = `${uid}@test.com`, claims: Record<string, unknown> = {}) => env.authenticatedContext(uid, { email, ...claims }).firestore()
const anonimo = () => env.unauthenticatedContext().firestore()
const admin = () => como('admin1', 'admin@test.com', { admin: true })
const usuarioNuevo = (role: string, status: string, extra: Record<string, unknown> = {}) => ({
  email: 'nuevo@test.com', displayName: 'Nuevo', role, status, isDemo: false, createdAt: serverTimestamp(), ...extra,
})

describe('users', () => {
  it('registro: un cliente se crea activo', async () => {
    await assertSucceeds(setDoc(doc(como('nuevo'), 'users/nuevo'), usuarioNuevo('cliente', 'activo')))
  })
  it('registro: un profesional solo puede crearse pendiente', async () => {
    const db = como('nuevo')
    await assertFails(setDoc(doc(db, 'users/nuevo'), usuarioNuevo('profesional', 'activo')))
    await assertSucceeds(setDoc(doc(db, 'users/nuevo'), usuarioNuevo('profesional', 'pendiente')))
  })
  it('registro: no se puede crear admin, ni con campos de más, ni con email ajeno, ni a nombre de otro', async () => {
    const db = como('nuevo')
    await assertFails(setDoc(doc(db, 'users/nuevo'), usuarioNuevo('admin', 'activo')))
    await assertFails(setDoc(doc(db, 'users/nuevo'), usuarioNuevo('cliente', 'activo', { esAdmin: true })))
    await assertFails(setDoc(doc(db, 'users/nuevo'), usuarioNuevo('cliente', 'activo', { email: 'otro@test.com' })))
    await assertFails(setDoc(doc(db, 'users/nuevo'), usuarioNuevo('cliente', 'activo', { isDemo: true })))
    await assertFails(setDoc(doc(como('otro'), 'users/nuevo'), usuarioNuevo('cliente', 'activo', { email: 'otro@test.com' })))
    await assertFails(setDoc(doc(anonimo(), 'users/nuevo'), usuarioNuevo('cliente', 'activo')))
  })
  it('lectura: cada uno lee el suyo; no el de otros; el admin lee todos', async () => {
    await assertSucceeds(getDoc(doc(como('cliente1'), 'users/cliente1')))
    await assertFails(getDoc(doc(como('cliente1'), 'users/cliente2')))
    await assertFails(getDocs(collection(como('cliente1'), 'users')))
    await assertFails(getDoc(doc(anonimo(), 'users/cliente1')))
    await assertSucceeds(getDocs(collection(admin(), 'users')))
  })
  it('escalada: nadie cambia su propio rol ni su estado; solo su nombre', async () => {
    await assertFails(updateDoc(doc(como('cliente1'), 'users/cliente1'), { role: 'admin' }))
    await assertFails(updateDoc(doc(como('cliente1'), 'users/cliente1'), { role: 'profesional' }))
    await assertFails(updateDoc(doc(como('pro-pend'), 'users/pro-pend'), { status: 'activo' }))
    await assertFails(updateDoc(doc(como('cliente-susp'), 'users/cliente-susp'), { status: 'activo' }))
    await assertSucceeds(updateDoc(doc(como('cliente1'), 'users/cliente1'), { displayName: 'Nuevo Nombre' }))
  })
  it('admin: suspende y reactiva clientes, pero no cambia roles ni borra', async () => {
    await assertSucceeds(updateDoc(doc(admin(), 'users/cliente1'), { status: 'suspendido' }))
    await assertFails(updateDoc(doc(admin(), 'users/cliente1'), { role: 'admin' }))
    await assertFails(updateDoc(doc(admin(), 'users/cliente1'), { status: 'cualquiera' }))
    await assertFails(updateDoc(doc(como('cliente1', 'c1@test.com', { admin: false }), 'users/cliente2'), { status: 'suspendido' }))
  })
})

describe('aprobación de profesionales (usuario y perfil cambian juntos)', () => {
  it('el admin aprueba en un batch: users.status = activo y professionals.estado = aprobado', async () => {
    const db = admin()
    const b = writeBatch(db)
    b.update(doc(db, 'users/pro-pend'), { status: 'activo' })
    b.update(doc(db, 'professionals/pro-pend'), { estado: 'aprobado' })
    await assertSucceeds(b.commit())
  })
  it('no se puede aprobar solo una de las dos mitades', async () => {
    await assertFails(updateDoc(doc(admin(), 'users/pro-pend'), { status: 'activo' }))
    await assertFails(updateDoc(doc(admin(), 'professionals/pro-pend'), { estado: 'aprobado' }))
  })
  it('el admin suspende a un profesional (usuario + perfil) y sale del catálogo público', async () => {
    const db = admin()
    const b = writeBatch(db)
    b.update(doc(db, 'users/pro1'), { status: 'suspendido' })
    b.update(doc(db, 'professionals/pro1'), { estado: 'suspendido' })
    await assertSucceeds(b.commit())
    await assertFails(getDoc(doc(anonimo(), 'professionals/pro1')))
  })
  it('un profesional de demo sin cuenta se puede suspender solo con el perfil', async () => {
    await assertSucceeds(updateDoc(doc(admin(), 'professionals/demo-sin-cuenta'), { estado: 'suspendido' }))
  })
  it('un profesional no se aprueba a sí mismo ni cambia su estado', async () => {
    await assertFails(updateDoc(doc(como('pro-pend'), 'professionals/pro-pend'), { estado: 'aprobado' }))
    const dbp = como('pro-pend')
    const b = writeBatch(dbp)
    b.update(doc(dbp, 'users/pro-pend'), { status: 'activo' })
    await assertFails(b.commit())
  })
})

describe('catálogo (categories y barrios)', () => {
  it('lectura pública; escribe solo el admin', async () => {
    await assertSucceeds(getDocs(collection(anonimo(), 'categories')))
    await assertSucceeds(getDocs(collection(anonimo(), 'barrios')))
    const nueva = { nombre: 'Gasista', descripcion: 'Instalaciones', orden: 5, activa: true }
    await assertFails(setDoc(doc(como('cliente1'), 'categories/gasista'), nueva))
    await assertFails(setDoc(doc(como('pro1'), 'categories/gasista'), nueva))
    await assertSucceeds(setDoc(doc(admin(), 'categories/gasista'), nueva))
    await assertFails(setDoc(doc(admin(), 'categories/Mal Id'), nueva))
    await assertFails(setDoc(doc(admin(), 'categories/otra-cat'), { ...nueva, extra: 1 }))
    await assertSucceeds(updateDoc(doc(admin(), 'categories/plomeria'), { activa: false }))
    await assertSucceeds(setDoc(doc(admin(), 'barrios/Almagro'), { nombre: 'Almagro', orden: 9, activo: true }))
    await assertFails(setDoc(doc(admin(), 'barrios/Otro'), { nombre: 'Distinto', orden: 9, activo: true }))
    await assertFails(setDoc(doc(como('cliente1'), 'barrios/Almagro'), { nombre: 'Almagro', orden: 9, activo: true }))
  })
})

describe('professionals', () => {
  it('lectura pública solo de los aprobados', async () => {
    await assertSucceeds(getDoc(doc(anonimo(), 'professionals/pro1')))
    await assertSucceeds(getDocs(query(collection(anonimo(), 'professionals'), where('estado', '==', 'aprobado'))))
    await assertFails(getDoc(doc(anonimo(), 'professionals/pro-pend')))
    await assertFails(getDocs(collection(anonimo(), 'professionals')))
    await assertFails(getDoc(doc(como('cliente1'), 'professionals/pro-pend')))
    await assertSucceeds(getDoc(doc(como('pro-pend'), 'professionals/pro-pend')))
    await assertSucceeds(getDoc(doc(admin(), 'professionals/pro-pend')))
  })
  it('un profesional puede consultar su perfil aunque todavía no lo haya creado (pero no el de otros)', async () => {
    await assertSucceeds(getDoc(doc(como('pro2'), 'professionals/pro2')))
    await env.withSecurityRulesDisabled(async ctx => void (await updateDoc(doc(ctx.firestore(), 'users/pro2'), { displayName: 'Pro Dos' })))
    await assertSucceeds(getDoc(doc(como('nuevo-sin-perfil'), 'professionals/nuevo-sin-perfil')))
    await assertFails(getDoc(doc(como('nuevo-sin-perfil'), 'professionals/otro-que-no-existe')))
    await assertFails(getDoc(doc(anonimo(), 'professionals/no-existe')))
  })
  it('alta: un profesional pendiente crea su perfil, siempre pendiente y con estadísticas en cero', async () => {
    await env.withSecurityRulesDisabled(async ctx => void (await setDoc(doc(ctx.firestore(), 'users/pro-nuevo'), { email: 'pn@test.com', displayName: 'Pro Nuevo', role: 'profesional', status: 'pendiente', isDemo: false, createdAt: new Date() })))
    const db = como('pro-nuevo')
    await assertSucceeds(setDoc(doc(db, 'professionals/pro-nuevo'), perfilNuevo('pro-nuevo')))
  })
  it('alta: no se puede publicar aprobado, con puntaje inventado, a nombre de otro ni siendo cliente', async () => {
    await env.withSecurityRulesDisabled(async ctx => void (await setDoc(doc(ctx.firestore(), 'users/pro-nuevo'), { email: 'pn@test.com', displayName: 'Pro Nuevo', role: 'profesional', status: 'pendiente', isDemo: false, createdAt: new Date() })))
    const db = como('pro-nuevo')
    await assertFails(setDoc(doc(db, 'professionals/pro-nuevo'), { ...perfilNuevo('pro-nuevo'), estado: 'aprobado' }))
    await assertFails(setDoc(doc(db, 'professionals/pro-nuevo'), { ...perfilNuevo('pro-nuevo'), puntaje: 5 }))
    await assertFails(setDoc(doc(db, 'professionals/pro-nuevo'), { ...perfilNuevo('pro-nuevo'), resenas: [{ autor: 'x', puntaje: 5, fecha: 'hoy', texto: 'genial' }] }))
    await assertFails(setDoc(doc(db, 'professionals/pro-nuevo'), { ...perfilNuevo('pro-nuevo'), isDemo: true }))
    await assertFails(setDoc(doc(db, 'professionals/pro-nuevo'), { ...perfilNuevo('pro-nuevo'), categoria: 'inventada' }))
    await assertFails(setDoc(doc(db, 'professionals/pro-nuevo'), { ...perfilNuevo('pro-nuevo'), barrio: 'Narnia' }))
    await assertFails(setDoc(doc(db, 'professionals/pro-nuevo'), { ...perfilNuevo('pro-nuevo'), servicios: [] }))
    await assertFails(setDoc(doc(db, 'professionals/pro-nuevo'), { ...perfilNuevo('pro-nuevo'), servicios: [{ ...servicio(), precio: 'gratis' }] }))
    await assertFails(setDoc(doc(db, 'professionals/pro-nuevo'), { ...perfilNuevo('pro-nuevo'), costoVisita: 99999999 }))
    await assertFails(setDoc(doc(db, 'professionals/pro-nuevo'), { ...perfilNuevo('pro-nuevo'), extra: true }))
    await assertFails(setDoc(doc(db, 'professionals/pro1'), perfilNuevo('pro-nuevo')))
    await assertFails(setDoc(doc(como('cliente1'), 'professionals/cliente1'), perfilNuevo('cliente1')))
    await assertFails(setDoc(doc(anonimo(), 'professionals/x'), perfilNuevo('x')))
  })
  it('edición: el dueño cambia sus datos, no su estado, puntaje ni reseñas; nadie edita el perfil de otro', async () => {
    const db = como('pro1')
    await assertSucceeds(updateDoc(doc(db, 'professionals/pro1'), { descripcion: 'Una descripción nueva y más larga.', costoVisita: 7000 }))
    await assertSucceeds(updateDoc(doc(db, 'professionals/pro1'), { servicios: [servicio(1), servicio(2)] }))
    await assertFails(updateDoc(doc(db, 'professionals/pro1'), { estado: 'pendiente' }))
    await assertFails(updateDoc(doc(db, 'professionals/pro1'), { puntaje: 5 }))
    await assertFails(updateDoc(doc(db, 'professionals/pro1'), { ownerId: 'pro2' }))
    await assertFails(updateDoc(doc(db, 'professionals/pro1'), { resenas: [{ autor: 'x', puntaje: 5, fecha: 'hoy', texto: 'genial' }] }))
    await assertFails(updateDoc(doc(db, 'professionals/pro1'), { descripcion: 'corta' }))
    await assertFails(updateDoc(doc(como('pro2'), 'professionals/pro1'), { costoVisita: 1 }))
    await assertFails(updateDoc(doc(como('cliente1'), 'professionals/pro1'), { costoVisita: 1 }))
  })
  it('límites: un perfil con el máximo de 5 servicios entra dentro del límite de evaluación de las reglas', async () => {
    const cinco = Array.from({ length: 5 }, (_, i) => servicio(i + 1))
    await assertSucceeds(updateDoc(doc(como('pro1'), 'professionals/pro1'), { servicios: cinco }))
    await assertFails(updateDoc(doc(como('pro1'), 'professionals/pro1'), { servicios: [...cinco, servicio(6)] }))
  })
  it('un profesional suspendido no puede editar su perfil', async () => {
    await env.withSecurityRulesDisabled(async ctx => void (await updateDoc(doc(ctx.firestore(), 'users/pro1'), { status: 'suspendido' })))
    await assertFails(updateDoc(doc(como('pro1'), 'professionals/pro1'), { costoVisita: 7000 }))
  })
  it('no se borra', async () => {
    const { deleteDoc } = await import('firebase/firestore')
    await assertFails(deleteDoc(doc(como('pro1'), 'professionals/pro1')))
    await assertFails(deleteDoc(doc(admin(), 'professionals/pro1')))
  })
})

describe('requests (solicitudes de cotización)', () => {
  it('un cliente activo crea una solicitud a un profesional aprobado', async () => {
    await assertSucceeds(setDoc(doc(como('cliente1'), 'requests/nueva'), solicitudNueva('cliente1')))
  })
  it('el total se recalcula en el servidor y debe coincidir', async () => {
    const db = como('cliente1')
    await assertFails(setDoc(doc(db, 'requests/a'), solicitudNueva('cliente1', { total: 1000 })))
    await assertFails(setDoc(doc(db, 'requests/b'), solicitudNueva('cliente1', { costoVisita: 0, total: 20000 })))
  })
  it('límites: una solicitud con 5 ítems se valida y el total se recalcula', async () => {
    const items = Array.from({ length: 5 }, (_, i) => ({ nombre: `Servicio número ${i + 1}`, precio: 10000, cantidad: 1 }))
    await assertSucceeds(setDoc(doc(como('cliente1'), 'requests/diez'), solicitudNueva('cliente1', { items, total: 55000 })))
    await assertFails(setDoc(doc(como('cliente1'), 'requests/once'), solicitudNueva('cliente1', { items: [...items, items[0]], total: 65000 })))
  })
  it('rechaza: profesional pendiente o inexistente, a nombre de otro, cantidades absurdas, estado distinto de pendiente', async () => {
    const db = como('cliente1')
    await assertFails(setDoc(doc(db, 'requests/a'), solicitudNueva('cliente1', { professionalId: 'pro-pend', professionalOwnerId: 'pro-pend', professionalNombre: 'Pro Pendiente' })))
    await assertFails(setDoc(doc(db, 'requests/b'), solicitudNueva('cliente1', { professionalId: 'nadie' })))
    await assertFails(setDoc(doc(db, 'requests/c'), solicitudNueva('cliente2')))
    await assertFails(setDoc(doc(db, 'requests/d'), solicitudNueva('cliente1', { items: [{ nombre: 'Servicio número 1', precio: 10000, cantidad: 99 }], total: 995000 })))
    await assertFails(setDoc(doc(db, 'requests/e'), solicitudNueva('cliente1', { estado: 'aceptada' })))
    await assertFails(setDoc(doc(db, 'requests/f'), solicitudNueva('cliente1', { professionalOwnerId: 'pro2' })))
    await assertFails(setDoc(doc(db, 'requests/g'), solicitudNueva('cliente1', { items: [] , total: 5000 })))
    await assertFails(setDoc(doc(db, 'requests/h'), solicitudNueva('cliente1', { isDemo: true })))
    await assertFails(setDoc(doc(db, 'requests/i'), solicitudNueva('cliente1', { campoExtra: 1 })))
  })
  it('rechaza: profesionales, suspendidos y anónimos no crean solicitudes', async () => {
    await assertFails(setDoc(doc(como('pro2'), 'requests/a'), solicitudNueva('pro2')))
    await assertFails(setDoc(doc(como('cliente-susp'), 'requests/b'), solicitudNueva('cliente-susp')))
    await assertFails(setDoc(doc(anonimo(), 'requests/c'), solicitudNueva('x')))
  })
  it('lectura: solo el cliente, el profesional destinatario y el admin', async () => {
    await assertSucceeds(getDoc(doc(como('cliente1'), 'requests/sol1')))
    await assertSucceeds(getDoc(doc(como('pro1'), 'requests/sol1')))
    await assertSucceeds(getDoc(doc(admin(), 'requests/sol1')))
    await assertFails(getDoc(doc(como('cliente2'), 'requests/sol1')))
    await assertFails(getDoc(doc(como('pro2'), 'requests/sol1')))
    await assertFails(getDoc(doc(anonimo(), 'requests/sol1')))
    await assertSucceeds(getDocs(query(collection(como('cliente1'), 'requests'), where('clientId', '==', 'cliente1'))))
    await assertSucceeds(getDocs(query(collection(como('pro1'), 'requests'), where('professionalOwnerId', '==', 'pro1'))))
    await assertFails(getDocs(collection(como('cliente1'), 'requests')))
  })
  it('estado: el profesional acepta, completa o rechaza; transiciones inválidas fallan', async () => {
    const db = como('pro1')
    await assertFails(updateDoc(doc(db, 'requests/sol1'), { estado: 'completada' }))
    await assertSucceeds(updateDoc(doc(db, 'requests/sol1'), { estado: 'aceptada' }))
    await assertFails(updateDoc(doc(db, 'requests/sol1'), { estado: 'pendiente' }))
    await assertSucceeds(updateDoc(doc(db, 'requests/sol1'), { estado: 'completada' }))
    await assertFails(updateDoc(doc(db, 'requests/sol1'), { estado: 'rechazada' }))
  })
  it('estado: otro profesional, el admin y un cliente ajeno no cambian el estado', async () => {
    await assertFails(updateDoc(doc(como('pro2'), 'requests/sol1'), { estado: 'aceptada' }))
    await assertFails(updateDoc(doc(admin(), 'requests/sol1'), { estado: 'aceptada' }))
    await assertFails(updateDoc(doc(como('cliente2'), 'requests/sol1'), { estado: 'cancelada' }))
  })
  it('estado: el cliente solo puede cancelar la suya, y nada más', async () => {
    const db = como('cliente1')
    await assertFails(updateDoc(doc(db, 'requests/sol1'), { estado: 'aceptada' }))
    await assertFails(updateDoc(doc(db, 'requests/sol1'), { total: 1 }))
    await assertFails(updateDoc(doc(db, 'requests/sol1'), { estado: 'cancelada', total: 1 }))
    await assertSucceeds(updateDoc(doc(db, 'requests/sol1'), { estado: 'cancelada' }))
    await assertFails(updateDoc(doc(db, 'requests/sol1'), { estado: 'pendiente' }))
  })
  it('el profesional no puede tocar otros campos de la solicitud', async () => {
    await assertFails(updateDoc(doc(como('pro1'), 'requests/sol1'), { estado: 'aceptada', total: 1 }))
    await assertFails(updateDoc(doc(como('pro1'), 'requests/sol1'), { contactoTelefono: '0' }))
  })
})

describe('todo lo demás está denegado', () => {
  it('colecciones no declaradas', async () => {
    await assertFails(setDoc(doc(como('cliente1'), 'cosas/a'), { x: 1 }))
    await assertFails(getDoc(doc(admin(), 'cosas/a')))
  })
})
