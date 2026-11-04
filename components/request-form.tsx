'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Loader2, Minus, Plus, Trash2 } from 'lucide-react'
import { submitServiceRequest } from '@/app/actions/requests'
import { ProfessionalPhoto } from '@/components/professional-photo'
import { Rating } from '@/components/rating'
import { BARRIOS, formatPrice, type Professional, type WeekDay } from '@/lib/data'
import type { SubmittedRequest } from '@/lib/requests'
import { useRequestStore } from '@/lib/request-store'
import { cn } from '@/lib/utils'

const WEEKDAYS: WeekDay[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const SLOTS = [
  { id: 'manana', label: 'Mañana', detail: '8 a 12 h' },
  { id: 'tarde', label: 'Tarde', detail: '12 a 17 h' },
  { id: 'noche', label: 'Noche', detail: '17 a 21 h' },
]

type DayOption = {
  key: string
  weekday: WeekDay
  dayNumber: number
  heading: string
  longLabel: string
  available: boolean
}

function buildDays(professional: Professional): DayOption[] {
  const today = new Date()
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + index)
    const weekday = WEEKDAYS[date.getDay()]
    const heading = index === 0 ? 'Hoy' : index === 1 ? 'Mañana' : weekday
    return {
      key: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      weekday,
      dayNumber: date.getDate(),
      heading,
      longLabel: date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }),
      available: professional.dias.includes(weekday) && (index > 0 || professional.disponibleHoy),
    }
  })
}

type Errors = Partial<Record<'calle' | 'nombre' | 'telefono' | 'fecha' | 'franja', string>>

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

const inputClass =
  'h-14 w-full rounded-2xl border-2 border-transparent bg-secondary px-4 text-base font-medium outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary aria-[invalid=true]:border-destructive'

export function RequestForm({
  professional,
  user,
  onSubmitted,
}: {
  professional: Professional
  user: { id: string; name: string } | null
  onSubmitted: (request: SubmittedRequest) => void
}) {
  const { items, setQuantity, removeItem, clearCart, barrio } = useRequestStore()
  const [pending, setPending] = useState(false)
  const [serverError, setServerError] = useState('')
  const isOwnProfile = !!user && professional.ownerId === user.id

  const [days, setDays] = useState<DayOption[]>([])
  const [dayKey, setDayKey] = useState<string | null>(null)
  const [slot, setSlot] = useState<string | null>(null)
  const [calle, setCalle] = useState('')
  const [piso, setPiso] = useState('')
  const [zona, setZona] = useState(barrio)
  const [nombre, setNombre] = useState(user?.name ?? '')
  const [telefono, setTelefono] = useState('')
  const [notas, setNotas] = useState('')
  const [errors, setErrors] = useState<Errors>({})

  useEffect(() => {
    setDays(buildDays(professional))
  }, [professional])

  const lines = items.flatMap((item) => {
    const service = professional.servicios.find((s) => s.id === item.serviceId)
    return service ? [{ service, cantidad: item.cantidad }] : []
  })
  const subtotal = lines.reduce((sum, line) => sum + line.service.precio * line.cantidad, 0)
  const total = subtotal + professional.costoVisita

  function validate(): Errors {
    const next: Errors = {}
    if (calle.trim().length < 4 || !/\d/.test(calle)) next.calle = 'Ingresá la calle y la altura (ej: Thames 1450).'
    if (nombre.trim().length < 3) next.nombre = 'Ingresá tu nombre completo.'
    if (telefono.replace(/\D/g, '').length < 8) next.telefono = 'Ingresá un teléfono válido para que el profesional te contacte.'
    if (!dayKey) next.fecha = 'Elegí un día para la visita.'
    if (!slot) next.franja = 'Elegí una franja horaria.'
    return next
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || isOwnProfile || pending) return
    setServerError('')
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      const firstId = ['calle', 'nombre', 'telefono', 'fecha', 'franja'].find((id) => id in found)
      requestAnimationFrame(() => document.getElementById(firstId === 'fecha' || firstId === 'franja' ? `grupo-${firstId}` : firstId!)?.focus())
      return
    }

    const day = days.find((d) => d.key === dayKey)
    const chosenSlot = SLOTS.find((s) => s.id === slot)
    setPending(true)
    const result = await submitServiceRequest({
      professionalId: professional.id,
      items: items.map((item) => ({ serviceId: item.serviceId, cantidad: item.cantidad })),
      calle: calle.trim(),
      piso: piso.trim(),
      barrio: zona,
      fecha: day?.longLabel ?? '',
      franja: chosenSlot ? `${chosenSlot.label} (${chosenSlot.detail})` : '',
      notas: notas.trim(),
      nombre: nombre.trim(),
      telefono: telefono.trim(),
    })
    setPending(false)

    if (!result.ok) {
      setServerError(result.error)
      return
    }
    clearCart()
    onSubmitted(result.request)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 pt-6">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Tu solicitud</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="titulo-resumen" className="flex flex-col gap-4 rounded-3xl bg-secondary p-4 md:p-5">
            <h2 id="titulo-resumen" className="text-lg font-bold">
              Resumen del servicio
            </h2>
            <Link
              href={`/profesional/${professional.id}`}
              className="flex items-center gap-3 rounded-2xl bg-background p-3 hover:bg-accent/50"
            >
              <ProfessionalPhoto nombre={professional.nombre} foto={professional.foto} sizes="56px" className="size-14 rounded-xl" />
              <div className="min-w-0">
                <p className="truncate text-base font-bold">{professional.nombre}</p>
                <p className="text-sm text-muted-foreground">{professional.oficio}</p>
              </div>
              <Rating value={professional.puntaje} className="ml-auto" />
            </Link>

            <ul className="flex flex-col gap-3">
              {lines.map(({ service, cantidad }) => (
                <li key={service.id} className="flex items-center gap-3 rounded-2xl bg-background p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{service.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(service.precio)} · {service.unidad}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-secondary p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(service.id, cantidad - 1)}
                      disabled={cantidad <= 1}
                      aria-label={`Quitar una unidad de ${service.nombre}`}
                      className="flex size-9 items-center justify-center rounded-full bg-background text-primary disabled:opacity-40"
                    >
                      <Minus className="size-4" aria-hidden="true" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold" aria-live="polite">
                      {cantidad}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(service.id, cantidad + 1)}
                      disabled={cantidad >= 10}
                      aria-label={`Agregar una unidad de ${service.nombre}`}
                      className="flex size-9 items-center justify-center rounded-full bg-background text-primary disabled:opacity-40"
                    >
                      <Plus className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(service.id)}
                    aria-label={`Quitar ${service.nombre} de la solicitud`}
                    className="flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
                  >
                    <Trash2 className="size-5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between text-sm">
              <Link href={`/profesional/${professional.id}`} className="font-semibold text-primary hover:underline">
                Agregar más servicios
              </Link>
              <button type="button" onClick={clearCart} className="font-semibold text-muted-foreground hover:text-destructive">
                Vaciar solicitud
              </button>
            </div>
          </section>

          <section aria-labelledby="titulo-direccion" className="flex flex-col gap-4">
            <h2 id="titulo-direccion" className="text-lg font-bold">
              Dirección del servicio
            </h2>
            <Field id="calle" label="Calle y altura" error={errors.calle}>
              <input
                id="calle"
                value={calle}
                onChange={(event) => setCalle(event.target.value)}
                autoComplete="street-address"
                placeholder="Ej: Thames 1450"
                aria-invalid={!!errors.calle}
                aria-describedby={errors.calle ? 'calle-error' : undefined}
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field id="piso" label="Piso / Depto (opcional)">
                <input
                  id="piso"
                  value={piso}
                  onChange={(event) => setPiso(event.target.value)}
                  placeholder="Ej: 3° B"
                  className={inputClass}
                />
              </Field>
              <Field id="zona" label="Barrio">
                <select id="zona" value={zona} onChange={(event) => setZona(event.target.value)} className={cn(inputClass, 'appearance-none')}>
                  {BARRIOS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          <section aria-labelledby="titulo-cuando" className="flex flex-col gap-4">
            <h2 id="titulo-cuando" className="text-lg font-bold">
              ¿Cuándo te viene bien?
            </h2>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold" id="label-dia">
                Día
              </span>
              <div
                id="grupo-fecha"
                tabIndex={-1}
                role="radiogroup"
                aria-labelledby="label-dia"
                className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 outline-none [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
              >
                {days.length === 0 && <div className="h-20 w-full animate-pulse rounded-2xl bg-secondary" />}
                {days.map((day) => {
                  const active = dayKey === day.key
                  return (
                    <button
                      key={day.key}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={!day.available}
                      onClick={() => setDayKey(day.key)}
                      className={cn(
                        'flex h-20 w-[4.5rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                        active ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent',
                        !day.available && 'cursor-not-allowed opacity-40 hover:bg-secondary',
                      )}
                    >
                      <span className="text-xs">{day.heading}</span>
                      <span className="text-xl font-extrabold">{day.dayNumber}</span>
                    </button>
                  )
                })}
              </div>
              {errors.fecha && <p className="text-sm font-medium text-destructive">{errors.fecha}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold" id="label-franja">
                Franja horaria
              </span>
              <div id="grupo-franja" tabIndex={-1} role="radiogroup" aria-labelledby="label-franja" className="grid grid-cols-3 gap-2 outline-none">
                {SLOTS.map((item) => {
                  const active = slot === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSlot(item.id)}
                      className={cn(
                        'flex h-16 flex-col items-center justify-center rounded-2xl text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                        active ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent',
                      )}
                    >
                      {item.label}
                      <span className={cn('text-xs font-medium', active ? 'text-primary-foreground/85' : 'text-muted-foreground')}>
                        {item.detail}
                      </span>
                    </button>
                  )
                })}
              </div>
              {errors.franja && <p className="text-sm font-medium text-destructive">{errors.franja}</p>}
            </div>
          </section>

          <section aria-labelledby="titulo-contacto" className="flex flex-col gap-4">
            <h2 id="titulo-contacto" className="text-lg font-bold">
              Tus datos
            </h2>
            <Field id="nombre" label="Nombre y apellido" error={errors.nombre}>
              <input
                id="nombre"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                autoComplete="name"
                placeholder="Ej: María Rodríguez"
                aria-invalid={!!errors.nombre}
                aria-describedby={errors.nombre ? 'nombre-error' : undefined}
                className={inputClass}
              />
            </Field>
            <Field id="telefono" label="Teléfono" error={errors.telefono} hint="Solo lo verá el profesional que elegiste.">
              <input
                id="telefono"
                type="tel"
                inputMode="tel"
                value={telefono}
                onChange={(event) => setTelefono(event.target.value)}
                autoComplete="tel"
                placeholder="Ej: 11 5555 1234"
                aria-invalid={!!errors.telefono}
                aria-describedby={errors.telefono ? 'telefono-error' : undefined}
                className={inputClass}
              />
            </Field>
            <Field id="notas" label="Contanos qué necesitás (opcional)">
              <textarea
                id="notas"
                value={notas}
                onChange={(event) => setNotas(event.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Ej: Se pierde agua debajo de la bacha de la cocina."
                className="w-full resize-none rounded-2xl border-2 border-transparent bg-secondary p-4 text-base font-medium outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary"
              />
            </Field>
          </section>
        </div>

        <aside aria-labelledby="titulo-precio" className="flex flex-col gap-4 rounded-3xl bg-secondary p-5 lg:sticky lg:top-24">
          <h2 id="titulo-precio" className="text-lg font-bold">
            Precio estimado
          </h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Servicios</dt>
              <dd className="font-semibold">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Visita y traslado</dt>
              <dd className="font-semibold">{formatPrice(professional.costoVisita)}</dd>
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-border pt-4">
              <dt className="text-base font-bold">Total estimado</dt>
              <dd className="text-2xl font-extrabold text-primary">{formatPrice(total)}</dd>
            </div>
          </dl>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Es un valor orientativo. {professional.nombre.split(' ')[0]} te enviará la cotización final después de evaluar el trabajo. No se
            cobra nada al confirmar.
          </p>
          {serverError && (
            <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
              {serverError}
            </p>
          )}
          {!user ? (
            <>
              <p className="text-sm font-medium">Para confirmar tu solicitud necesitás una cuenta de CONFIX.</p>
              <Link
                href="/ingresar?next=/solicitud"
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-primary text-base font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Ingresar para confirmar
              </Link>
              <Link href="/registro?next=%2Fsolicitud" className="text-center text-sm font-bold text-primary hover:underline">
                Crear una cuenta
              </Link>
            </>
          ) : isOwnProfile ? (
            <p className="rounded-2xl bg-background p-4 text-sm font-medium">
              Este es tu propio perfil profesional, así que no podés pedirte un servicio a vos mismo.
            </p>
          ) : (
            <button
              type="submit"
              disabled={pending}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
            >
              {pending && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
              Confirmar solicitud
            </button>
          )}
        </aside>
      </div>
    </form>
  )
}
