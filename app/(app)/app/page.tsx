import Link from 'next/link'
import { ArrowRight, BadgeCheck, ShieldCheck } from 'lucide-react'
import { CategoryIcon } from '@/components/category-icon'
import { ProfessionalCardRow, ProfessionalCardVertical } from '@/components/professional-card'
import { HomeSearchBar } from '@/components/search-bar'
import { getCatalog, getCategories } from '@/lib/catalog'

export default async function HomePage() {
  const [professionals, categories] = await Promise.all([getCatalog(), getCategories()])
  const nearby = [...professionals].sort((a, b) => a.distanciaKm - b.distanciaKm).slice(0, 5)
  const recommended = [...professionals].sort((a, b) => b.puntaje - a.puntaje || b.cantidadResenas - a.cantidadResenas).slice(0, 4)

  return (
    <div className="flex flex-col gap-8 pt-6">
      <section aria-labelledby="titulo-inicio" className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">Hola, ¿cómo andás?</p>
          <h1 id="titulo-inicio" className="mt-1 text-balance text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
            ¿Qué necesitás arreglar hoy?
          </h1>
        </div>
        <HomeSearchBar />
      </section>

      <section aria-labelledby="titulo-categorias" className="flex flex-col gap-4">
        <h2 id="titulo-categorias" className="text-lg font-bold">
          Categorías
        </h2>
        <ul className="grid grid-cols-4 gap-3">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/app/buscar?categoria=${category.id}`}
                className="flex flex-col items-center gap-2 rounded-3xl bg-secondary px-1 py-4 text-center transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-background shadow-sm md:size-14">
                  <CategoryIcon id={category.id} className="size-6 text-primary md:size-7" />
                </span>
                <span className="text-xs font-semibold text-foreground md:text-sm">{category.nombre}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Beneficios" className="flex items-center gap-4 rounded-3xl bg-primary p-5 text-primary-foreground">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <p className="text-base font-bold">Pedí tu cotización sin cargo</p>
          <p className="text-sm text-primary-foreground/85">Profesionales verificados y precios claros antes de contratar.</p>
        </div>
        <Link
          href="/app/buscar"
          aria-label="Ver profesionales"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background text-primary transition-transform hover:scale-105"
        >
          <ArrowRight className="size-5" aria-hidden="true" />
        </Link>
      </section>

      <section aria-labelledby="titulo-cercanos" className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <h2 id="titulo-cercanos" className="text-lg font-bold">
            Profesionales cercanos
          </h2>
          <Link href="/app/buscar" className="text-sm font-semibold text-primary hover:underline">
            Ver todos
          </Link>
        </div>
        <ul className="-mx-4 flex scroll-px-4 snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {nearby.slice(0, 5).map((professional, index) => (
            <li
              key={professional.id}
              className={`w-[62%] shrink-0 snap-start sm:w-[40%] md:w-auto ${index === 4 ? 'md:hidden' : ''}`}
            >
              <ProfessionalCardVertical professional={professional} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-recomendados" className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 id="titulo-recomendados" className="text-lg font-bold">
            Recomendados para vos
          </h2>
          <BadgeCheck className="size-5 text-primary" aria-hidden="true" />
        </div>
        <ul className="grid gap-3 md:grid-cols-2">
          {recommended.map((professional) => (
            <li key={professional.id}>
              <ProfessionalCardRow professional={professional} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
