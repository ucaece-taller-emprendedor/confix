import type { Metadata } from 'next'
import { ProfileForm } from '@/components/profile-form'
import { RequestList } from '@/components/request-list'
import { getMyProfile } from '@/lib/actions/profesional'
import { getReceivedRequests } from '@/lib/actions/solicitudes'
import { requireRole } from '@/lib/auth/session'
import { getBarrios, getCategories } from '@/lib/catalog'
import { SERVICE_UNITS } from '@/lib/data'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Mi panel profesional | CONFIX' }

const ESTADOS: Record<string, { label: string; detalle: string; clase: string }> = {
  pendiente: {
    label: 'Pendiente de aprobación',
    detalle: 'Un administrador está revisando tu perfil. Cuando lo apruebe vas a aparecer en las búsquedas.',
    clase: 'bg-accent text-accent-foreground',
  },
  aprobado: {
    label: 'Perfil aprobado',
    detalle: 'Tu perfil ya es visible para los clientes.',
    clase: 'bg-emerald-100 text-emerald-800',
  },
  suspendido: {
    label: 'Perfil suspendido',
    detalle: 'Tu perfil no está visible. Contactá a la administración si creés que es un error.',
    clase: 'bg-destructive/10 text-destructive',
  },
}

export default async function PanelPage() {
  const user = await requireRole(['cliente', 'profesional'], '/app/panel')
  const [profile, categories, barrios] = await Promise.all([getMyProfile(user.id), getCategories(), getBarrios()])
  const received = profile ? await getReceivedRequests(user.id) : []
  const estado = profile ? (ESTADOS[profile.estado] ?? ESTADOS.pendiente) : null

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 pt-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
          {profile ? 'Mi panel profesional' : 'Ofrecé tus servicios'}
        </h1>
        {!profile && (
          <p className="mt-2 text-muted-foreground">
            Completá tu perfil. Un administrador lo revisa y, cuando lo aprueba, empezás a recibir pedidos de cotización.
          </p>
        )}
      </div>

      {estado && (
        <section className={cn('flex flex-col gap-1 rounded-3xl p-5', estado.clase)} aria-label="Estado del perfil">
          <p className="font-extrabold">{estado.label}</p>
          <p className="text-sm">{estado.detalle}</p>
        </section>
      )}

      {profile && (
        <section aria-labelledby="titulo-recibidas" className="flex flex-col gap-3">
          <h2 id="titulo-recibidas" className="text-lg font-bold">
            Solicitudes recibidas
          </h2>
          <RequestList
            requests={received}
            mode="profesional"
            emptyText="Todavía no recibiste solicitudes. Van a aparecer acá cuando un cliente te pida una cotización."
          />
        </section>
      )}

      <section aria-labelledby="titulo-perfil" className="flex flex-col gap-3">
        <h2 id="titulo-perfil" className="text-lg font-bold">
          {profile ? 'Mi perfil público' : 'Tu perfil'}
        </h2>
        <ProfileForm
          categories={categories}
          barrios={barrios}
          units={SERVICE_UNITS}
          initial={
            profile
              ? {
                  nombre: profile.nombre,
                  categoria: profile.categoria,
                  oficio: profile.oficio,
                  barrio: profile.barrio,
                  horario: profile.horario,
                  costoVisita: profile.costoVisita,
                  descripcion: profile.descripcion,
                  servicios: profile.servicios.map(({ nombre, detalle, precio, unidad }) => ({ nombre, detalle, precio, unidad })),
                }
              : { nombre: user.name }
          }
        />
      </section>
    </div>
  )
}
