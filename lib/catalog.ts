import { cache } from 'react'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { professionalProfile, user } from '@/lib/db/schema'
import { CATEGORIES, PROFESSIONALS, type CategoryId, type Professional } from '@/lib/data'

type ProfileRow = typeof professionalProfile.$inferSelect

export function profileToProfessional(row: ProfileRow): Professional {
  const categoria = (CATEGORIES.find((c) => c.id === row.categoria)?.id ?? 'plomeria') as CategoryId
  return {
    id: row.id,
    nombre: row.nombre,
    categoria,
    oficio: row.oficio,
    foto: '',
    puntaje: 0,
    cantidadResenas: 0,
    distanciaKm: 2.5,
    barrio: row.barrio,
    disponibleHoy: true,
    dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
    horario: row.horario,
    anosExperiencia: 0,
    trabajosRealizados: 0,
    respuesta: 'Nuevo en CONFIX',
    descripcion: row.descripcion,
    costoVisita: row.costoVisita,
    servicios: row.servicios,
    resenas: [],
    ownerId: row.userId,
    nuevo: true,
  }
}

export const getCatalog = cache(async (): Promise<Professional[]> => {
  try {
    const rows = await db
      .select({ profile: professionalProfile })
      .from(professionalProfile)
      .innerJoin(user, eq(user.id, professionalProfile.userId))
      .where(and(eq(professionalProfile.estado, 'aprobado'), eq(user.role, 'profesional')))
    return [...PROFESSIONALS, ...rows.map((row) => profileToProfessional(row.profile))]
  } catch (error) {
    console.error('No se pudo cargar el catálogo de profesionales registrados', error)
    return PROFESSIONALS
  }
})

export async function getProfessionalById(id: string) {
  const catalog = await getCatalog()
  return catalog.find((professional) => professional.id === id)
}
