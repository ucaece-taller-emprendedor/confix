'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  createBarrio,
  createCategory,
  setBarrioActive,
  setCategoryActive,
  setProfessionalStatus,
  setUserRole,
} from '@/lib/actions/admin'
import { ROLES, ROLE_LABELS } from '@/lib/auth/roles'

type Result = { ok: boolean; error?: string }

function useAdminAction() {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState('')

  function run(action: () => Promise<Result>, onOk?: () => void) {
    setError('')
    start(async () => {
      const result = await action()
      if (!result.ok) setError(result.error ?? 'No pudimos completar la acción.')
      else onOk?.()
      router.refresh()
    })
  }
  return { pending, error, run }
}

const smallButton =
  'h-9 rounded-full px-4 text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-60'

export function RoleSelect({ userId, role, disabled }: { userId: string; role: string; disabled?: boolean }) {
  const { pending, error, run } = useAdminAction()
  return (
    <div className="flex flex-col gap-1">
      <select
        aria-label="Rol del usuario"
        value={role}
        disabled={disabled || pending}
        onChange={(event) => run(() => setUserRole(userId, event.target.value))}
        className="h-9 rounded-full bg-background px-3 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      >
        {ROLES.map((item) => (
          <option key={item} value={item}>
            {ROLE_LABELS[item]}
          </option>
        ))}
      </select>
      {error && <p role="alert" className="text-xs font-semibold text-destructive">{error}</p>}
    </div>
  )
}

export function ProfessionalStatusButtons({ profileId, estado }: { profileId: string; estado: string }) {
  const { pending, error, run } = useAdminAction()
  const options = [
    { value: 'aprobado', label: 'Aprobar', style: 'bg-primary text-primary-foreground' },
    { value: 'suspendido', label: 'Suspender', style: 'bg-destructive/10 text-destructive' },
    { value: 'pendiente', label: 'Volver a pendiente', style: 'bg-background' },
  ].filter((option) => option.value !== estado)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={pending}
            onClick={() => run(() => setProfessionalStatus(profileId, option.value))}
            className={`${smallButton} ${option.style}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="text-xs font-semibold text-destructive">{error}</p>}
    </div>
  )
}

export function ActiveToggle({ kind, id, active }: { kind: 'categoria' | 'barrio'; id: string; active: boolean }) {
  const { pending, run } = useAdminAction()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => run(() => (kind === 'categoria' ? setCategoryActive(id, !active) : setBarrioActive(id, !active)))}
      className={`${smallButton} ${active ? 'bg-background' : 'bg-primary text-primary-foreground'}`}
    >
      {active ? 'Desactivar' : 'Activar'}
    </button>
  )
}

const inputClass =
  'h-11 min-w-0 flex-1 rounded-2xl bg-secondary px-4 text-sm font-medium outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring'

export function NewCategoryForm() {
  const { pending, error, run } = useAdminAction()
  const [id, setId] = useState('')
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        run(() => createCategory({ id, nombre, descripcion }), () => {
          setId('')
          setNombre('')
          setDescripcion('')
        })
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <input aria-label="Identificador de la categoría" value={id} onChange={(e) => setId(e.target.value)} placeholder="identificador (ej: gasista)" className={inputClass} />
        <input aria-label="Nombre de la categoría" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" className={inputClass} />
        <input aria-label="Descripción de la categoría" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción corta" className={inputClass} />
        <button type="submit" disabled={pending} className="h-11 rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-60">
          Agregar
        </button>
      </div>
      {error && <p role="alert" className="text-xs font-semibold text-destructive">{error}</p>}
    </form>
  )
}

export function NewBarrioForm() {
  const { pending, error, run } = useAdminAction()
  const [nombre, setNombre] = useState('')

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        run(() => createBarrio({ nombre }), () => setNombre(''))
      }}
    >
      <div className="flex gap-2">
        <input aria-label="Nombre del barrio" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del barrio" className={inputClass} />
        <button type="submit" disabled={pending} className="h-11 rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-60">
          Agregar
        </button>
      </div>
      {error && <p role="alert" className="text-xs font-semibold text-destructive">{error}</p>}
    </form>
  )
}
