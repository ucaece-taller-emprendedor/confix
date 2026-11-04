import { z } from 'zod'

// Los campos vacíos del .env (ej: GOOGLE_CLIENT_ID=) se tratan como "no definidos".
const opcional = z.preprocess((value) => (value === '' ? undefined : value), z.string().optional())

const esquema = z
  .object({
    DATABASE_URL: z
      .string({ error: 'falta definirla' })
      .regex(/^postgres(ql)?:\/\//, 'debe empezar con postgresql://'),
    BETTER_AUTH_SECRET: z
      .string({ error: 'falta definirla' })
      .min(32, 'debe tener al menos 32 caracteres (generá uno con: openssl rand -base64 32)'),
    BETTER_AUTH_URL: z.url({ error: 'debe ser una URL completa, ej: http://localhost:3000' }),
    GOOGLE_CLIENT_ID: opcional,
    GOOGLE_CLIENT_SECRET: opcional,
    ADMIN_EMAILS: z
      .preprocess((value) => (typeof value === 'string' ? value : ''), z.string())
      .transform((value) =>
        value
          .split(',')
          .map((email) => email.trim().toLowerCase())
          .filter(Boolean),
      ),
  })
  .refine((env) => Boolean(env.GOOGLE_CLIENT_ID) === Boolean(env.GOOGLE_CLIENT_SECRET), {
    message: 'GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET deben definirse juntas (o ninguna)',
    path: ['GOOGLE_CLIENT_ID'],
  })

function leerEnv() {
  const resultado = esquema.safeParse(process.env)
  if (!resultado.success) {
    const detalle = resultado.error.issues
      .map((issue) => `  - ${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('\n')
    throw new Error(
      `Variables de entorno inválidas o faltantes:\n${detalle}\n\nRevisá tu archivo .env (el modelo está en .env.example).`,
    )
  }
  return resultado.data
}

export const env = leerEnv()

/** Google OAuth se habilita solo si están las dos credenciales. */
export const googleHabilitado = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
