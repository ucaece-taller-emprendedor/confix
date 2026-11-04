'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth/client'
import { primerError } from '@/lib/validations'
import { loginSchema, registroSchema } from '@/lib/validations/auth'

const inputClass =
  'h-14 w-full rounded-2xl border-2 border-transparent bg-secondary px-4 text-base font-medium outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary aria-[invalid=true]:border-destructive'

export function AuthForm({
  mode,
  next,
  googleEnabled,
}: {
  mode: 'ingresar' | 'registro'
  next: string
  googleEnabled: boolean
}) {
  const router = useRouter()
  const isSignUp = mode === 'registro'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tipo, setTipo] = useState<'cliente' | 'profesional'>('cliente')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const parsed = isSignUp
      ? registroSchema.safeParse({ name, email, password, tipo })
      : loginSchema.safeParse({ email, password })
    if (!parsed.success) return setError(primerError(parsed.error))

    setPending(true)
    const result = isSignUp
      ? await authClient.signUp.email({ ...(parsed.data as ReturnType<typeof registroSchema.parse>), role: tipo })
      : await authClient.signIn.email({ email: parsed.data.email, password: parsed.data.password })
    setPending(false)

    if (result.error) {
      setError(
        isSignUp
          ? 'No pudimos crear tu cuenta. Revisá los datos o probá con otro email.'
          : 'Email o contraseña incorrectos.',
      )
      return
    }

    // /app/entrar decide el panel según el rol que tiene la cuenta en el servidor.
    router.push(destino)
    router.refresh()
  }

  async function handleGoogle() {
    setError('')
    setPending(true)
    const result = await authClient.signIn.social({ provider: 'google', callbackURL: destino })
    if (result?.error) {
      setPending(false)
      setError('No pudimos conectar con Google. Probá con tu email y contraseña.')
    }
  }

  const query = next !== '/app' ? `?next=${encodeURIComponent(next)}` : ''
  const destino = `/app/entrar${isSignUp && tipo === 'profesional' ? `?next=${encodeURIComponent('/app/panel')}` : query}`

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
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-semibold">¿Cómo vas a usar CONFIX?</legend>
          {(
            [
              { value: 'cliente', titulo: 'Quiero contratar servicios', detalle: 'Buscá profesionales y pedí cotizaciones sin cargo.' },
              { value: 'profesional', titulo: 'Quiero ofrecer mis servicios', detalle: 'Armá tu perfil. Un administrador lo revisa antes de publicarlo.' },
            ] as const
          ).map((opcion) => (
            <label
              key={opcion.value}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-transparent bg-secondary p-4 has-[:checked]:border-primary"
            >
              <input
                type="radio"
                name="tipo"
                value={opcion.value}
                checked={tipo === opcion.value}
                onChange={() => setTipo(opcion.value)}
                className="mt-0.5 size-5 shrink-0 accent-primary"
              />
              <span className="text-sm">
                <span className="block font-bold">{opcion.titulo}</span>
                <span className="text-muted-foreground">{opcion.detalle}</span>
              </span>
            </label>
          ))}
        </fieldset>
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

      <div className="flex flex-col gap-2">
        {googleEnabled ? (
          <button
            type="button"
            onClick={handleGoogle}
            disabled={pending}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-secondary text-base font-bold transition-colors hover:bg-accent disabled:opacity-60"
          >
            Continuar con Google
          </button>
        ) : (
          <p className="rounded-2xl bg-secondary px-4 py-3 text-center text-sm text-muted-foreground">
            El ingreso con Google todavía no está disponible. Usá tu email y contraseña.
          </p>
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? '¿Ya tenés cuenta? ' : '¿Todavía no tenés cuenta? '}
        <Link href={`${isSignUp ? '/app/ingresar' : '/app/registro'}${query}`} className="font-bold text-primary hover:underline">
          {isSignUp ? 'Ingresá' : 'Registrate'}
        </Link>
      </p>
    </form>
  )
}
