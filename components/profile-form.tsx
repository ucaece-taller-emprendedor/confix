'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { saveProfessionalProfile } from '@/lib/actions/profesional'
import type { Category } from '@/lib/data'
import { primerError } from '@/lib/validations'
import { perfilSchema } from '@/lib/validations/profesional'

const inputClass =
  'h-14 w-full rounded-2xl border-2 border-transparent bg-secondary px-4 text-base font-medium outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary'

type ServiceDraft = { nombre: string; detalle: string; precio: string; unidad: string }

type Initial = {
  nombre?: string
  categoria?: string
  oficio?: string
  barrio?: string
  horario?: string
  costoVisita?: number
  descripcion?: string
  servicios?: { nombre: string; detalle: string; precio: number; unidad: string }[]
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
    </div>
  )
}

export function ProfileForm({
  categories,
  barrios,
  units,
  initial,
}: {
  categories: Category[]
  barrios: string[]
  units: string[]
  initial: Initial
}) {
  const router = useRouter()
  const [nombre, setNombre] = useState(initial.nombre ?? '')
  const [categoria, setCategoria] = useState(initial.categoria ?? categories[0]?.id ?? '')
  const [oficio, setOficio] = useState(initial.oficio ?? '')
  const [barrio, setBarrio] = useState(initial.barrio ?? barrios[0] ?? '')
  const [horario, setHorario] = useState(initial.horario ?? '')
  const [costoVisita, setCostoVisita] = useState(String(initial.costoVisita ?? 0))
  const [descripcion, setDescripcion] = useState(initial.descripcion ?? '')
  const [servicios, setServicios] = useState<ServiceDraft[]>(
    initial.servicios?.length
      ? initial.servicios.map((s) => ({ ...s, precio: String(s.precio) }))
      : [{ nombre: '', detalle: '', precio: '', unidad: units[0] }],
  )
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [pending, setPending] = useState(false)

  function updateService(index: number, patch: Partial<ServiceDraft>) {
    setServicios((current) => current.map((service, i) => (i === index ? { ...service, ...patch } : service)))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaved(false)

    const input = { nombre, categoria, oficio, barrio, horario, costoVisita, descripcion, servicios }
    const parsed = perfilSchema.safeParse(input)
    if (!parsed.success) return setError(primerError(parsed.error))

    setPending(true)
    const result = await saveProfessionalProfile(input)
    setPending(false)

    if (!result.ok) return setError(result.error)
    setSaved(true)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Field id="perfil-nombre" label="Nombre público">
        <input id="perfil-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClass} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="perfil-categoria" label="Categoría">
          <select id="perfil-categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputClass}>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </Field>
        <Field id="perfil-oficio" label="Oficio">
          <input id="perfil-oficio" value={oficio} onChange={(e) => setOficio(e.target.value)} placeholder="Ej: Plomero matriculado" className={inputClass} />
        </Field>
        <Field id="perfil-barrio" label="Barrio">
          <select id="perfil-barrio" value={barrio} onChange={(e) => setBarrio(e.target.value)} className={inputClass}>
            {barrios.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field id="perfil-horario" label="Horario de atención">
          <input id="perfil-horario" value={horario} onChange={(e) => setHorario(e.target.value)} placeholder="Ej: 8:00 a 18:00" className={inputClass} />
        </Field>
      </div>
      <Field id="perfil-visita" label="Costo de la visita ($)">
        <input id="perfil-visita" type="number" min={0} value={costoVisita} onChange={(e) => setCostoVisita(e.target.value)} className={inputClass} />
      </Field>
      <Field id="perfil-descripcion" label="Contanos sobre tu trabajo">
        <textarea
          id="perfil-descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={4}
          className={`${inputClass} h-auto py-3`}
        />
      </Field>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-semibold">Servicios y precios</legend>
        {servicios.map((service, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-2xl bg-secondary p-3">
            <input
              aria-label={`Nombre del servicio ${index + 1}`}
              value={service.nombre}
              onChange={(e) => updateService(index, { nombre: e.target.value })}
              placeholder="Ej: Destape de cañerías"
              className="h-12 w-full rounded-xl bg-background px-3 text-base font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <input
              aria-label={`Detalle del servicio ${index + 1}`}
              value={service.detalle}
              onChange={(e) => updateService(index, { detalle: e.target.value })}
              placeholder="Detalle (opcional)"
              className="h-12 w-full rounded-xl bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="flex gap-2">
              <input
                aria-label={`Precio del servicio ${index + 1}`}
                type="number"
                min={0}
                value={service.precio}
                onChange={(e) => updateService(index, { precio: e.target.value })}
                placeholder="Precio $"
                className="h-12 min-w-0 flex-1 rounded-xl bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <select
                aria-label={`Unidad del servicio ${index + 1}`}
                value={service.unidad}
                onChange={(e) => updateService(index, { unidad: e.target.value })}
                className="h-12 flex-1 rounded-xl bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              {servicios.length > 1 && (
                <button
                  type="button"
                  onClick={() => setServicios((current) => current.filter((_, i) => i !== index))}
                  aria-label={`Quitar servicio ${index + 1}`}
                  className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-background text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        ))}
        {servicios.length < 8 && (
          <button
            type="button"
            onClick={() => setServicios((current) => [...current, { nombre: '', detalle: '', precio: '', unidad: units[0] }])}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-secondary text-sm font-bold hover:bg-accent"
          >
            <Plus className="size-4 text-primary" aria-hidden="true" />
            Agregar servicio
          </button>
        )}
      </fieldset>

      {error && (
        <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-800">
          Guardamos tu perfil.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
        Guardar perfil
      </button>
    </form>
  )
}
