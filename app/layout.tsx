import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { BottomNav } from '@/components/bottom-nav'
import { SiteHeader } from '@/components/site-header'
import { getCatalog } from '@/lib/catalog'
import { CatalogProvider } from '@/lib/catalog-context'
import { RequestProvider } from '@/lib/request-store'
import { getCurrentUser } from '@/lib/session'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CONFIX | Profesionales de servicios para el hogar',
  description:
    'Encontrá plomeros, electricistas, pintores y carpinteros cerca tuyo. Pedí cotizaciones y contratá servicios para tu hogar de forma simple y segura.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [user, catalog] = await Promise.all([getCurrentUser(), getCatalog()])

  return (
    <html lang="es-AR" className={jakarta.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <CatalogProvider professionals={catalog}>
          <RequestProvider>
            <SiteHeader user={user} />
            <main className="mx-auto w-full max-w-5xl px-4 pb-28 md:pb-16">{children}</main>
            <BottomNav user={user} />
          </RequestProvider>
        </CatalogProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
