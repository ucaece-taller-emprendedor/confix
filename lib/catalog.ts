import { cache } from 'react'
import { and, asc, eq, isNull, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { barrio, categoria, professionalProfile, user } from '@/lib/db/schema'
import type { Category, Professional, WeekDay } from '@/lib/data'

type ProfileRow = typeof professionalProfile.$inferSelect

export function profileToProfessional(row: ProfileRow): Professional {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    oficio: row.oficio,
    foto: row.foto,
    puntaje: row.puntaje,
    cantidadResenas: row.cantidadResenas,
    distanciaKm: row.distanciaKm,
    barrio: row.barrio,
    disponibleHoy: true,
    dias: row.dias as WeekDay[],
    horario: row.horario,
    anosExperiencia: row.anosExperiencia,
    trabajosRealizados: row.trabajosRealizados,
    respuesta: row.respuesta,
    descripcion: row.descripcion,
    costoVisita: row.costoVisita,
    servicios: row.servicios,
    resenas: row.resenas,
    ownerId: row.userId ?? undefined,
    nuevo: row.cantidadResenas === 0,
  }
}

export const getCategories = cache(async (): Promise<Category[]> => {
  const rows = await db.select().from(categoria).where(eq(categoria.activa, true)).orderBy(asc(categoria.orden), asc(categoria.nombre))
  return rows.map(({ id, nombre, descripcion }) => ({ id, nombre, descripcion }))
})

export const getBarrios = cache(async (): Promise<string[]> => {
  const rows = await db.select().from(barrio).where(eq(barrio.activo, true)).orderBy(asc(barrio.orden), asc(barrio.nombre))
  return rows.map((row) => row.nombre)
})

/** Solo profesionales aprobados (los demo no tienen cuenta, por eso el join es opcional). */
export const getCatalog = cache(async (): Promise<Professional[]> => {
  const rows = await db
    .select({ profile: professionalProfile })
    .from(professionalProfile)
    .leftJoin(user, eq(user.id, professionalProfile.userId))
    .where(
      and(eq(professionalProfile.estado, 'aprobado'), or(isNull(professionalProfile.userId), eq(user.role, 'profesional'))),
    )
    .orderBy(asc(professionalProfile.nombre))
  return rows.map((row) => profileToProfessional(row.profile))
})

export async function getProfessionalById(id: string) {
  const catalog = await getCatalog()
  return catalog.find((professional) => professional.id === id)
}
