import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'
import { env, googleHabilitado } from '@/lib/env'

export const auth = betterAuth({
  database: pool,
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  // Google solo se habilita si están las credenciales; nunca se simula.
  ...(googleHabilitado
    ? {
        socialProviders: {
          google: {
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET as string,
          },
        },
      }
    : {}),
  user: {
    additionalFields: {
      // El registro público puede elegir "cliente" o "profesional". Nunca "admin":
      // el hook de abajo descarta cualquier otro valor.
      role: {
        type: 'string',
        required: false,
        defaultValue: 'cliente',
        input: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (newUser) => {
          const pedido = (newUser as { role?: unknown }).role
          let role: 'cliente' | 'profesional' | 'admin' = pedido === 'profesional' ? 'profesional' : 'cliente'
          // Un admin solo puede salir de ADMIN_EMAILS y con el email verificado (Google).
          // Las altas con email y contraseña nunca son admin: para eso está `npm run db:admins`.
          if (newUser.emailVerified && env.ADMIN_EMAILS.includes(newUser.email.toLowerCase())) role = 'admin'
          return { data: { ...newUser, role } }
        },
      },
    },
  },
  trustedOrigins: [env.BETTER_AUTH_URL, ...(process.env.NODE_ENV === 'production' ? [] : ['http://localhost:3000'])],
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
})
