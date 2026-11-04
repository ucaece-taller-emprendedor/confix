import type { Metadata } from 'next'
import { desc } from 'drizzle-orm'
import { RoleSelect } from '@/components/admin/admin-actions'
import { requireRole } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'

export const metadata: Metadata = { title: 'Usuarios | Administración CONFIX' }

export default async function AdminUsuariosPage() {
  const admin = await requireRole(['admin'], '/admin/usuarios')
  const users = await db.select().from(user).orderBy(desc(user.createdAt))

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Usuarios</h1>
      <ul className="flex flex-col gap-2">
        {users.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary p-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-bold">
                <span className="truncate">{item.name}</span>
                {item.esDemo && <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-bold uppercase text-primary">Demo</span>}
              </p>
              <p className="truncate text-sm text-muted-foreground">{item.email}</p>
            </div>
            <RoleSelect userId={item.id} role={item.role} disabled={item.id === admin.id} />
          </li>
        ))}
      </ul>
    </div>
  )
}
