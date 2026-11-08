import { ArrowRight, BadgeCheck, ClipboardList, Search, ShieldCheck, Wallet } from 'lucide-react'
import { Link } from 'react-router'
import { LANDING } from '@/config/app'

const iconosPaso = [Search, ClipboardList, BadgeCheck]
const iconosBeneficio = [ShieldCheck, Wallet, BadgeCheck]
const botonPrimario = 'inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primario px-6 text-base font-bold text-primario-texto transition-opacity hover:opacity-90'
const botonSecundario = 'inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-secundario px-6 text-base font-bold transition-colors hover:bg-acento'

export default function Landing() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-4 pb-16 pt-10 md:gap-20 md:pt-16">
      <section aria-labelledby="titulo-hero" className="flex flex-col gap-6 md:max-w-2xl">
        <p className="w-fit rounded-full bg-acento px-3 py-1 text-xs font-bold text-acento-texto">{LANDING.etiqueta}</p>
        <h1 id="titulo-hero" className="text-balance text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">{LANDING.titulo}</h1>
        <p className="text-pretty text-lg text-suave">{LANDING.bajada}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/app/registro" className={botonPrimario}>Registrarme gratis <ArrowRight className="size-5" aria-hidden /></Link>
          <Link to="/app/ingresar" className={botonSecundario}>Ingresar</Link>
        </div>
      </section>

      <section aria-labelledby="titulo-problema" className="grid gap-6 rounded-3xl bg-secundario p-6 md:grid-cols-2 md:p-10">
        <div className="flex flex-col gap-3">
          <h2 id="titulo-problema" className="text-2xl font-extrabold tracking-tight">{LANDING.problema.titulo}</h2>
          <p className="text-suave">{LANDING.problema.texto}</p>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-extrabold tracking-tight text-primario">{LANDING.solucion.titulo}</h2>
          <p className="text-suave">{LANDING.solucion.texto}</p>
        </div>
      </section>

      <section aria-labelledby="titulo-pasos" className="flex flex-col gap-6">
        <h2 id="titulo-pasos" className="text-2xl font-extrabold tracking-tight">Cómo funciona</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {LANDING.pasos.map((p, i) => {
            const Icono = iconosPaso[i] ?? Search
            return (
              <li key={p.titulo} className="flex flex-col gap-3 rounded-3xl bg-secundario p-6">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-fondo shadow-sm"><Icono className="size-6 text-primario" aria-hidden /></span>
                <h3 className="text-lg font-bold">{i + 1}. {p.titulo}</h3>
                <p className="text-sm text-suave">{p.texto}</p>
              </li>
            )
          })}
        </ol>
      </section>

      <section aria-labelledby="titulo-beneficios" className="flex flex-col gap-6">
        <h2 id="titulo-beneficios" className="text-2xl font-extrabold tracking-tight">Por qué CONFIX</h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {LANDING.beneficios.map((b, i) => {
            const Icono = iconosBeneficio[i] ?? ShieldCheck
            return (
              <li key={b.titulo} className="flex gap-4 rounded-3xl border border-borde p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-acento"><Icono className="size-5 text-primario" aria-hidden /></span>
                <div><h3 className="font-bold">{b.titulo}</h3><p className="mt-1 text-sm text-suave">{b.texto}</p></div>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="titulo-cta" className="flex flex-col items-start gap-4 rounded-3xl bg-primario p-6 text-primario-texto md:flex-row md:items-center md:justify-between md:p-10">
        <div className="md:max-w-xl">
          <h2 id="titulo-cta" className="text-2xl font-extrabold tracking-tight">{LANDING.cta.titulo}</h2>
          <p className="mt-2 opacity-85">{LANDING.cta.texto}</p>
        </div>
        <Link to="/app/registro?tipo=profesional" className="inline-flex h-14 shrink-0 items-center justify-center rounded-2xl bg-fondo px-6 text-base font-bold text-primario hover:opacity-90">Registrarme</Link>
      </section>
    </div>
  )
}
