import { z } from 'zod'

export const servicioSchema = z.object({
  nombre: z.string().trim().min(3, 'Revisá el nombre de cada servicio (mínimo 3 caracteres).').max(60),
  detalle: z.string().trim().max(100).default(''),
  precio: z.coerce
    .number()
    .int()
    .min(100, 'Revisá el precio de cada servicio (mínimo $100).')
    .max(5_000_000, 'Revisá el precio de cada servicio.'),
  unidad: z.string().trim().max(30),
})

export const perfilSchema = z.object({
  nombre: z.string().trim().min(3, 'Ingresá un nombre público de 3 a 60 caracteres.').max(60, 'Ingresá un nombre público de 3 a 60 caracteres.'),
  categoria: z.string().min(1, 'Elegí una categoría.'),
  oficio: z.string().trim().min(3, 'Ingresá tu oficio (ej: Plomero matriculado).').max(40, 'Ingresá tu oficio (ej: Plomero matriculado).'),
  barrio: z.string().min(1, 'Elegí tu barrio.'),
  horario: z.string().trim().min(3, 'Ingresá tu horario de atención.').max(40, 'Ingresá tu horario de atención.'),
  costoVisita: z.coerce.number().int('El costo de visita debe estar entre $0 y $100.000.').min(0, 'El costo de visita debe estar entre $0 y $100.000.').max(100_000, 'El costo de visita debe estar entre $0 y $100.000.'),
  descripcion: z
    .string()
    .trim()
    .min(20, 'Contá un poco más sobre tu trabajo (entre 20 y 600 caracteres).')
    .max(600, 'Contá un poco más sobre tu trabajo (entre 20 y 600 caracteres).'),
  servicios: z.array(servicioSchema).min(1, 'Agregá al menos un servicio.').max(8),
})

export type PerfilInput = z.input<typeof perfilSchema>
