import type { Metadata } from 'next'
import { desc, eq } from 'drizzle-orm'
import { ProfessionalStatusButtons } from '@/components/admin/admin-actions'
import { requireRole } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { professionalProfile, user } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Profesionales | Administración CONFIX' }

const ESTADO_STYLE: Record<string, string> = {
  pendiente: 'bg-accent text-accent-foreground',
  aprobado: 'bg-emerald-100 text-emerald-800',
  suspendido: 'bg-destructive/10 text-destructive',
}

export default async function AdminProfesionalesPage() {
  await requireRole(['admin'], '/admin/profesionales')
  const rows = await db
    .select({ profile: professionalProfile, email: user.email })
    .from(professionalProfile)
    .leftJoin(user, eq(user.id, professionalProfile.userId))
    .orderBy(desc(professionalProfile.createdAt))

  // Los pendientes primero: es lo que el admin tiene que resolver.
  const ordered = [...rows].sort((a, b) => Number(b.profile.estado === 'pendiente') - Number(a.profile.estado === 'pendiente'))

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Profesionales</h1>
      <ul className="flex flex-col gap-3">
        {ordered.map(({ profile, email }) => (
          <li key={profile.id} className="flex flex-col gap-3 rounded-3xl bg-secondary p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-bold">
                  <span className="truncate">{profile.nombre}</span>
                  {profile.esDemo && <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-bold uppercase text-primary">Demo</span>}
                </p>
                <p className="text-sm text-muted-foreground">
                  {profile.oficio} · {profile.barrio}
                  {email ? ` · ${email}` : ''}
                </p>
              </div>
              <span className={cn('shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize', ESTADO_STYLE[profile.estado] ?? ESTADO_STYLE.pendiente)}>
                {profile.estado}
              </span>
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">{profile.descripcion}</p>
            <ProfessionalStatusButtons profileId={profile.id} estado={profile.estado} />
          </li>
        ))}
        {ordered.length === 0 && (
          <li className="rounded-3xl bg-secondary px-6 py-10 text-center text-sm text-muted-foreground">Todavía no hay profesionales registrados.</li>
        )}
      </ul>
    </div>
  )
}
