import Link from 'next/link'
import { ArrowRight, BadgeCheck, ClipboardList, Search, ShieldCheck, Wallet, Wrench } from 'lucide-react'

const pasos = [
  { icon: Search, titulo: 'Buscá', texto: 'Elegí la categoría y mirá profesionales de tu barrio con sus precios y reseñas.' },
  { icon: ClipboardList, titulo: 'Pedí tu cotización', texto: 'Seleccioná los servicios, contá cuándo te viene bien y enviá el pedido sin cargo.' },
  { icon: BadgeCheck, titulo: 'Contratá con confianza', texto: 'El profesional te contacta con el precio final. Vos decidís.' },
]

const beneficios = [
  { icon: ShieldCheck, titulo: 'Profesionales verificados', texto: 'Cada perfil lo revisa nuestro equipo antes de publicarse.' },
  { icon: Wallet, titulo: 'Precios claros', texto: 'Ves el valor de cada servicio y de la visita antes de pedir.' },
  { icon: BadgeCheck, titulo: 'Referencias reales', texto: 'Calificaciones y reseñas para comparar con tranquilidad.' },
]

const botonPrimario =
  'inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-base font-bold text-primary-foreground transition-opacity hover:opacity-90'
const botonSecundario =
  'inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-secondary px-6 text-base font-bold transition-colors hover:bg-accent'

export default function LandingPage() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/" className="flex items-center gap-2" aria-label="CONFIX, ir al inicio">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Wrench className="size-5" aria-hidden="true" />
            </span>
            <span className="text-xl font-extrabold tracking-tight">CONFIX</span>
          </Link>
          <nav aria-label="Acceso" className="flex items-center gap-2">
            <Link href="/app/ingresar" className="inline-flex h-10 items-center rounded-full px-4 text-sm font-bold hover:bg-secondary">
              Ingresar
            </Link>
            <Link href="/app/registro" className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90">
              Registrarme
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-4 pb-16 pt-10 md:gap-20 md:pt-16">
        <section aria-labelledby="titulo-hero" className="flex flex-col gap-6 md:max-w-2xl">
          <p className="w-fit rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">Servicios para el hogar</p>
          <h1 id="titulo-hero" className="text-balance text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            El profesional que necesitás para tu casa, sin vueltas.
          </h1>
          <p className="text-pretty text-lg text-muted-foreground">
            Plomería, electricidad, pintura y carpintería. Buscá, compará y pedí cotización a profesionales verificados de tu barrio.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/app/registro" className={botonPrimario}>
              Registrarme gratis
              <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
            <Link href="/app/ingresar" className={botonSecundario}>
              Ingresar
            </Link>
          </div>
        </section>

        <section aria-labelledby="titulo-problema" className="grid gap-6 rounded-3xl bg-secondary p-6 md:grid-cols-2 md:p-10">
          <div className="flex flex-col gap-3">
            <h2 id="titulo-problema" className="text-2xl font-extrabold tracking-tight">
              Contratar a alguien de confianza es difícil
            </h2>
            <p className="text-muted-foreground">
              Faltan referencias, es complicado comparar precios y no hay garantías. Terminás pidiendo contactos a conocidos o arriesgándote con un desconocido.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-extrabold tracking-tight text-primary">CONFIX lo ordena</h2>
            <p className="text-muted-foreground">
              Un solo lugar con profesionales revisados, precios visibles y un pedido de cotización que se hace en minutos.
            </p>
          </div>
        </section>

        <section aria-labelledby="titulo-pasos" className="flex flex-col gap-6">
          <h2 id="titulo-pasos" className="text-2xl font-extrabold tracking-tight">
            Cómo funciona
          </h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {pasos.map(({ icon: Icon, titulo, texto }, index) => (
              <li key={titulo} className="flex flex-col gap-3 rounded-3xl bg-secondary p-6">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-background shadow-sm">
                  <Icon className="size-6 text-primary" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold">
                  {index + 1}. {titulo}
                </h3>
                <p className="text-sm text-muted-foreground">{texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="titulo-beneficios" className="flex flex-col gap-6">
          <h2 id="titulo-beneficios" className="text-2xl font-extrabold tracking-tight">
            Por qué CONFIX
          </h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {beneficios.map(({ icon: Icon, titulo, texto }) => (
              <li key={titulo} className="flex gap-4 rounded-3xl border border-border p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent">
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-bold">{titulo}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="titulo-cta" className="flex flex-col items-start gap-4 rounded-3xl bg-primary p-6 text-primary-foreground md:flex-row md:items-center md:justify-between md:p-10">
          <div className="md:max-w-xl">
            <h2 id="titulo-cta" className="text-2xl font-extrabold tracking-tight">
              ¿Sos plomero, electricista, pintor o carpintero?
            </h2>
            <p className="mt-2 text-primary-foreground/85">Registrate como profesional, armá tu perfil y recibí pedidos de cotización.</p>
          </div>
          <Link href="/app/registro" className="inline-flex h-14 shrink-0 items-center justify-center rounded-2xl bg-background px-6 text-base font-bold text-primary hover:opacity-90">
            Registrarme
          </Link>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>CONFIX · Proyecto del Taller Emprendedor, Universidad CAECE.</p>
          <Link href="/admin/login" className="hover:text-foreground hover:underline">
            Acceso administración
          </Link>
        </div>
      </footer>
    </>
  )
}
