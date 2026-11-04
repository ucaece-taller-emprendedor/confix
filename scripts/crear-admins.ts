import './cargar-env'
// Crea o promueve a admin las cuentas listadas en ADMIN_EMAILS.
// Las cuentas que todavía no existen se crean con la contraseña de ADMIN_INITIAL_PASSWORD.
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { hashPassword } from 'better-auth/crypto'
import { db, pool } from '@/lib/db'
import { account, user } from '@/lib/db/schema'
import { env } from '@/lib/env'

async function main() {
  if (env.ADMIN_EMAILS.length === 0) {
    console.error('ADMIN_EMAILS está vacío: no hay admins para crear.')
    process.exitCode = 1
    return
  }
  const password = process.env.ADMIN_INITIAL_PASSWORD ?? ''

  for (const email of env.ADMIN_EMAILS) {
    const [existente] = await db.select().from(user).where(eq(user.email, email)).limit(1)
    if (existente) {
      await db.update(user).set({ role: 'admin', updatedAt: new Date() }).where(eq(user.id, existente.id))
      console.log(`${email}: ya existía, ahora es admin.`)
      continue
    }
    if (password.length < 8) {
      console.error(`${email}: no existe y falta ADMIN_INITIAL_PASSWORD (mínimo 8 caracteres) para crearla.`)
      process.exitCode = 1
      continue
    }
    const id = randomUUID()
    const hash = await hashPassword(password)
    await db.transaction(async (tx) => {
      await tx.insert(user).values({ id, name: email.split('@')[0], email, emailVerified: false, role: 'admin' })
      await tx.insert(account).values({ id: randomUUID(), accountId: id, providerId: 'credential', userId: id, password: hash })
    })
    console.log(`${email}: cuenta admin creada.`)
  }
}

main()
  .catch((error) => {
    console.error('No se pudieron crear los admins:', error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
