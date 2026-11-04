import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { ActiveToggle, NewBarrioForm, NewCategoryForm } from '@/components/admin/admin-actions'
import { requireRole } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { barrio, categoria } from '@/lib/db/schema'

export const metadata: Metadata = { title: 'Catálogo | Administración CONFIX' }

export default async function AdminCatalogoPage() {
  await requireRole(['admin'], '/admin/catalogo')
  const [categorias, barrios] = await Promise.all([
    db.select().from(categoria).orderBy(asc(categoria.orden)),
    db.select().from(barrio).orderBy(asc(barrio.orden)),
  ])

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Catálogo</h1>

      <section aria-labelledby="titulo-categorias" className="flex flex-col gap-3">
        <h2 id="titulo-categorias" className="text-lg font-bold">
          Categorías
        </h2>
        <ul className="flex flex-col gap-2">
          {categorias.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-secondary p-4">
              <div className="min-w-0">
                <p className={`font-bold ${item.activa ? '' : 'text-muted-foreground line-through'}`}>{item.nombre}</p>
                <p className="truncate text-sm text-muted-foreground">{item.descripcion}</p>
              </div>
              <ActiveToggle kind="categoria" id={item.id} active={item.activa} />
            </li>
          ))}
        </ul>
        <NewCategoryForm />
      </section>

      <section aria-labelledby="titulo-barrios" className="flex flex-col gap-3">
        <h2 id="titulo-barrios" className="text-lg font-bold">
          Barrios
        </h2>
        <ul className="flex flex-col gap-2">
          {barrios.map((item) => (
            <li key={item.nombre} className="flex items-center justify-between gap-3 rounded-2xl bg-secondary p-4">
              <p className={`font-bold ${item.activo ? '' : 'text-muted-foreground line-through'}`}>{item.nombre}</p>
              <ActiveToggle kind="barrio" id={item.nombre} active={item.activo} />
            </li>
          ))}
        </ul>
        <NewBarrioForm />
      </section>
    </div>
  )
}
