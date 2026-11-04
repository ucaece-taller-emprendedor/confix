import { z } from 'zod'

export const emailSchema = z.string().trim().toLowerCase().email('Ingresá un email válido.')
export const passwordSchema = z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.').max(128)

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const registroSchema = z.object({
  name: z.string().trim().min(3, 'Ingresá tu nombre completo.').max(80),
  email: emailSchema,
  password: passwordSchema,
  tipo: z.enum(['cliente', 'profesional']),
})

export type RegistroInput = z.infer<typeof registroSchema>
