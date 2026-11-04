import { BottomNav } from '@/components/bottom-nav'
import { SiteHeader } from '@/components/site-header'
import { getBarrios, getCatalog, getCategories } from '@/lib/catalog'
import { CatalogProvider } from '@/lib/catalog-context'
import { RequestProvider } from '@/lib/request-store'
import { getCurrentUser } from '@/lib/auth/session'

// Depende de la sesión y de la base: nunca se prerenderiza en el build (que no tiene base).
export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, catalog, categories, barrios] = await Promise.all([
    getCurrentUser(),
    getCatalog(),
    getCategories(),
    getBarrios(),
  ])

  return (
    <CatalogProvider professionals={catalog} categories={categories} barrios={barrios}>
      <RequestProvider defaultBarrio={barrios[0] ?? ''}>
        <SiteHeader user={user} />
        <main className="mx-auto w-full max-w-5xl px-4 pb-28 md:pb-16">{children}</main>
        <BottomNav user={user} />
      </RequestProvider>
    </CatalogProvider>
  )
}
