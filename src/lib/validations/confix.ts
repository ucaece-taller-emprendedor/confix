import { z } from 'zod'

// Estos límites tienen que coincidir con firestore.rules (que es la validación de verdad).
export const MAX_SERVICIOS = 5

export const servicioSchema = z.object({
  nombre: z.string().trim().min(3, 'Revisá el nombre de cada servicio (mínimo 3 caracteres).').max(60, 'Revisá el nombre de cada servicio (máximo 60 caracteres).'),
  detalle: z.string().trim().max(100, 'El detalle de cada servicio admite hasta 100 caracteres.'),
  precio: z.coerce.number('Revisá el precio de cada servicio.').int('Revisá el precio de cada servicio.').min(100, 'Revisá el precio de cada servicio (mínimo $100).').max(5_000_000, 'Revisá el precio de cada servicio.'),
  unidad: z.string().trim().min(1).max(30),
})

export const perfilProfesionalSchema = z.object({
  nombre: z.string().trim().min(3, 'Ingresá un nombre público de 3 a 60 caracteres.').max(60, 'Ingresá un nombre público de 3 a 60 caracteres.'),
  categoria: z.string().min(1, 'Elegí una categoría.'),
  oficio: z.string().trim().min(3, 'Ingresá tu oficio (ej: Plomero matriculado).').max(40, 'Ingresá tu oficio (ej: Plomero matriculado).'),
  barrio: z.string().min(1, 'Elegí tu barrio.'),
  horario: z.string().trim().min(3, 'Ingresá tu horario de atención.').max(40, 'Ingresá tu horario de atención.'),
  costoVisita: z.coerce.number('El costo de visita debe estar entre $0 y $100.000.').int('El costo de visita debe estar entre $0 y $100.000.').min(0, 'El costo de visita debe estar entre $0 y $100.000.').max(100_000, 'El costo de visita debe estar entre $0 y $100.000.'),
  descripcion: z.string().trim().min(20, 'Contá un poco más sobre tu trabajo (entre 20 y 600 caracteres).').max(600, 'Contá un poco más sobre tu trabajo (entre 20 y 600 caracteres).'),
  servicios: z.array(servicioSchema).min(1, 'Agregá al menos un servicio.').max(MAX_SERVICIOS, `Podés cargar hasta ${MAX_SERVICIOS} servicios.`),
})
export type PerfilProfesionalForm = z.infer<typeof perfilProfesionalSchema>

export const solicitudSchema = z.object({
  calle: z.string().trim().min(4, 'Ingresá la calle y la altura (ej: Thames 1450).').max(70, 'La dirección es demasiado larga.').refine(v => /\d/.test(v), 'Ingresá la calle y la altura (ej: Thames 1450).'),
  piso: z.string().trim().max(30, 'Máximo 30 caracteres.'),
  barrio: z.string().min(1, 'Elegí un barrio válido.'),
  fecha: z.string().trim().min(1, 'Elegí un día para la visita.').max(80),
  franja: z.string().trim().min(1, 'Elegí una franja horaria.').max(60),
  notas: z.string().trim().max(500, 'Máximo 500 caracteres.'),
  nombre: z.string().trim().min(3, 'Ingresá tu nombre completo.').max(80, 'El nombre es demasiado largo.'),
  telefono: z.string().trim().max(30, 'El teléfono es demasiado largo.').refine(v => v.replace(/\D/g, '').length >= 8, 'Ingresá un teléfono válido para que el profesional te contacte.'),
})
export type SolicitudForm = z.infer<typeof solicitudSchema>

export const categoriaSchema = z.object({
  id: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{3,30}$/, 'El identificador usa 3 a 30 letras minúsculas, números o guiones.'),
  nombre: z.string().trim().min(3, 'Ingresá un nombre de 3 a 40 caracteres.').max(40, 'Ingresá un nombre de 3 a 40 caracteres.'),
  descripcion: z.string().trim().max(100, 'La descripción admite hasta 100 caracteres.'),
})
export const barrioSchema = z.object({
  nombre: z.string().trim().min(3, 'Ingresá un nombre de 3 a 40 caracteres.').max(40, 'Ingresá un nombre de 3 a 40 caracteres.').refine(v => !v.includes('/'), 'El nombre no puede tener "/".'),
})
