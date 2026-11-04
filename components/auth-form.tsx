'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

const inputClass =
  'h-14 w-full rounded-2xl border-2 border-transparent bg-secondary px-4 text-base font-medium outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary aria-[invalid=true]:border-destructive'

export function AuthForm({ mode, next }: { mode: 'ingresar' | 'registro'; next: string }) {
  const router = useRouter()
  const isSignUp = mode === 'registro'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [offersServices, setOffersServices] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (isSignUp && name.trim().length < 3) return setError('Ingresá tu nombre completo.')
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Ingresá un email válido.')
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')

    setPending(true)
    const result = isSignUp
      ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
      : await authClient.signIn.email({ email: email.trim(), password })
    setPending(false)

    if (result.error) {
      setError(
        isSignUp
          ? 'No pudimos crear tu cuenta. Revisá los datos o probá con otro email.'
          : 'Email o contraseña incorrectos.',
      )
      return
    }

    router.push(isSignUp && offersServices ? '/panel' : next)
    router.refresh()
  }

  const query = next !== '/' ? `?next=${encodeURIComponent(next)}` : ''

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {isSignUp && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-semibold">
            Nombre y apellido
          </label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            placeholder="Ej: María Rodríguez"
            className={inputClass}
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="tu@email.com"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          placeholder="Mínimo 8 caracteres"
          className={inputClass}
        />
      </div>

      {isSignUp && (
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-secondary p-4">
          <input
            type="checkbox"
            checked={offersServices}
            onChange={(event) => setOffersServices(event.target.checked)}
            className="mt-0.5 size-5 shrink-0 accent-primary"
          />
          <span className="text-sm">
            <span className="block font-bold">Quiero ofrecer mis servicios</span>
            <span className="text-muted-foreground">
              Vas a poder armar tu perfil profesional y seguir contratando servicios como cliente.
            </span>
          </span>
        </label>
      )}

      {error && (
        <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
        {isSignUp ? 'Crear cuenta' : 'Ingresar'}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? '¿Ya tenés cuenta? ' : '¿Todavía no tenés cuenta? '}
        <Link href={`${isSignUp ? '/ingresar' : '/registro'}${query}`} className="font-bold text-primary hover:underline">
          {isSignUp ? 'Ingresá' : 'Registrate'}
        </Link>
      </p>
    </form>
  )
}
