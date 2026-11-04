import { z } from 'zod'

export const rolSchema = z.enum(['cliente', 'profesional', 'admin'])
export const estadoProfesionalSchema = z.enum(['aprobado', 'pendiente', 'suspendido'])

export const categoriaSchema = z.object({
  id: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{3,30}$/, 'El identificador usa 3 a 30 letras minúsculas, números o guiones.'),
  nombre: z.string().trim().min(3, 'Ingresá un nombre de 3 a 40 caracteres.').max(40),
  descripcion: z.string().trim().max(100).default(''),
})

export const barrioSchema = z.object({
  nombre: z.string().trim().min(3, 'Ingresá un nombre de 3 a 40 caracteres.').max(40),
})
