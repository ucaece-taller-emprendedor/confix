'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ClipboardList, Search } from 'lucide-react'
import { RequestForm } from '@/components/request-form'
import { RequestSuccess } from '@/components/request-success'
import { useCatalog } from '@/lib/catalog-context'
import type { SubmittedRequest } from '@/lib/requests'
import { useRequestStore } from '@/lib/request-store'

export function RequestFlow({ user }: { user: { id: string; name: string } | null }) {
  const { professionalId, items } = useRequestStore()
  const { getProfessional } = useCatalog()
  const [confirmed, setConfirmed] = useState<SubmittedRequest | null>(null)

  const professional = professionalId ? getProfessional(professionalId) : undefined

  if (confirmed) {
    return <RequestSuccess request={confirmed} />
  }

  if (professional && items.length > 0) {
    return <RequestForm professional={professional} user={user} onSubmitted={setConfirmed} />
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pt-6">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Mi solicitud</h1>

      <div className="flex flex-col items-center gap-3 rounded-3xl bg-secondary px-6 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-background">
          <ClipboardList className="size-7 text-primary" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-bold">Todavía no armaste ninguna solicitud</h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          Buscá un profesional, elegí los servicios que necesitás y pedí tu cotización.
        </p>
        <Link
          href="/app/buscar"
          className="mt-2 inline-flex h-14 items-center gap-2 rounded-2xl bg-primary px-6 text-base font-bold text-primary-foreground hover:opacity-90"
        >
          <Search className="size-5" aria-hidden="true" />
          Buscar profesionales
        </Link>
      </div>

      <Link
        href="/app/mis-solicitudes"
        className="flex h-14 items-center justify-center rounded-2xl bg-secondary text-base font-bold hover:bg-accent"
      >
        Ver mis solicitudes enviadas
      </Link>
    </div>
  )
}
