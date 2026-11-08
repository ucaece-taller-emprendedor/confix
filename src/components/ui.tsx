import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router'

const base = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50'
const variantes = {
  primario: 'bg-primario text-primario-texto hover:opacity-90',
  acento: 'bg-acento text-acento-texto hover:opacity-90',
  borde: 'bg-secundario text-texto hover:bg-acento',
  fantasma: 'text-primario hover:bg-primario/10',
  peligro: 'bg-peligro text-white hover:opacity-90',
}
export type Variante = keyof typeof variantes

export function Boton({ variante = 'primario', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return <button type="button" className={`${base} ${variantes[variante]} ${className}`} {...p} />
}

export function BotonLink({ variante = 'primario', className = '', ...p }: LinkProps & { variante?: Variante }) {
  return <Link className={`${base} ${variantes[variante]} ${className}`} {...p} />
}

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div role="status" className="flex min-h-[40vh] items-center justify-center gap-2 text-suave">
      <Loader2 className="size-5 animate-spin" aria-hidden /> {texto}
    </div>
  )
}

export function Alerta({ tipo = 'error', children }: { tipo?: 'error' | 'info' | 'ok' | 'aviso'; children: ReactNode }) {
  const c = { error: 'bg-peligro/10 text-peligro', info: 'bg-primario/10 text-primario', ok: 'bg-ok/10 text-ok', aviso: 'bg-acento text-acento-texto' }[tipo]
  return (
    <p role={tipo === 'error' ? 'alert' : 'status'} className={`rounded-tema px-4 py-3 text-sm ${c}`}>
      {children}
    </p>
  )
}

export function Tarjeta({ className = '', ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-3xl bg-secundario p-5 ${className}`} {...p} />
}

const campo = 'mt-1 block min-h-12 w-full rounded-2xl border-2 border-transparent bg-secundario px-4 text-base font-medium text-texto outline-none transition-colors placeholder:text-suave/70 focus-visible:border-primario aria-[invalid=true]:border-peligro'

type CampoProps = { etiqueta: string; error?: string | undefined; ayuda?: string }
export function Campo({ etiqueta, error, ayuda, ...p }: CampoProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm font-medium">
      {etiqueta}
      <input className={campo} aria-invalid={!!error} {...p} />
      {ayuda && !error && <span className="mt-1 block text-xs font-normal text-suave">{ayuda}</span>}
      {error && <span className="mt-1 block text-xs font-normal text-peligro">{error}</span>}
    </label>
  )
}
export function CampoTexto({ etiqueta, error, ...p }: CampoProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block text-sm font-medium">
      {etiqueta}
      <textarea className={`${campo} py-2`} rows={4} aria-invalid={!!error} {...p} />
      {error && <span className="mt-1 block text-xs font-normal text-peligro">{error}</span>}
    </label>
  )
}
export function Selector({ etiqueta, error, children, ...p }: CampoProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block text-sm font-medium">
      {etiqueta}
      <select className={campo} aria-invalid={!!error} {...p}>
        {children}
      </select>
      {error && <span className="mt-1 block text-xs font-normal text-peligro">{error}</span>}
    </label>
  )
}

export function Etiqueta({ children, tono = 'neutro' }: { children: ReactNode; tono?: 'neutro' | 'ok' | 'aviso' | 'peligro' | 'demo' }) {
  const c = { neutro: 'bg-borde text-texto', ok: 'bg-ok/15 text-ok', aviso: 'bg-acento text-acento-texto', peligro: 'bg-peligro/15 text-peligro', demo: 'bg-primario/15 text-primario' }[tono]
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${c}`}>{children}</span>
}

export function EstadoVacio({ children }: { children: ReactNode }) {
  return <p className="rounded-3xl bg-secundario p-8 text-center text-sm text-suave">{children}</p>
}
