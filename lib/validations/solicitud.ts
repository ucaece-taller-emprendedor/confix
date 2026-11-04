import { z } from 'zod'

export const solicitudSchema = z.object({
  professionalId: z.string().min(1),
  items: z
    .array(z.object({ serviceId: z.string(), cantidad: z.coerce.number().int().min(1).max(10) }))
    .min(1, 'Elegí al menos un servicio.')
    .max(10),
  calle: z
    .string()
    .trim()
    .min(4, 'Revisá la dirección del servicio.')
    .max(120)
    .refine((value) => /\d/.test(value), 'Revisá la dirección del servicio.'),
  piso: z.string().trim().max(30).default(''),
  barrio: z.string().min(1, 'Elegí un barrio válido.'),
  fecha: z.string().trim().min(1, 'Elegí el día y la franja horaria.').max(80),
  franja: z.string().trim().min(1, 'Elegí el día y la franja horaria.').max(60),
  notas: z.string().trim().max(500).default(''),
  nombre: z.string().trim().min(3, 'Ingresá tu nombre completo.').max(80),
  telefono: z
    .string()
    .trim()
    .max(30)
    .refine((value) => value.replace(/\D/g, '').length >= 8, 'Ingresá un teléfono válido.'),
})

export type SolicitudInput = z.input<typeof solicitudSchema>

export const estadoSolicitudSchema = z.enum(['aceptada', 'rechazada', 'completada', 'cancelada'])
