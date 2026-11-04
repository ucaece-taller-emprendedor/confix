import { expect, test, type Page } from '@playwright/test'

// Cuentas del seed de demo (scripts/seed.ts).
const ADMIN = { email: 'admin@demo.confix.test', password: 'Demo-2026!' }

function emailUnico(prefijo: string) {
  return `${prefijo}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@prueba.confix.test`
}

async function cerrarSesion(page: Page) {
  await page.goto('/app/cuenta')
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page).toHaveURL('/')
}

test('la landing muestra el mensaje y los botones de acceso', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('profesional que necesitás')
  await expect(page.getByRole('link', { name: 'Ingresar' }).first()).toHaveAttribute('href', '/app/ingresar')
  await expect(page.getByRole('link', { name: 'Registrarme' }).first()).toHaveAttribute('href', '/app/registro')
})

test('un cliente se registra y vuelve a ingresar', async ({ page }) => {
  const email = emailUnico('cliente')
  const password = 'clave-de-prueba-123'

  await page.goto('/app/registro')
  await page.getByLabel('Nombre y apellido').fill('Cliente de Prueba')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page).toHaveURL('/app')
  await expect(page.getByRole('heading', { name: '¿Qué necesitás arreglar hoy?' })).toBeVisible()

  await cerrarSesion(page)

  await page.goto('/app/ingresar')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page).toHaveURL('/app')
})

test('un profesional se registra y queda pendiente de aprobación', async ({ page }) => {
  await page.goto('/app/registro')
  await page.getByLabel('Nombre y apellido').fill('Profesional de Prueba')
  await page.getByLabel('Email').fill(emailUnico('profesional'))
  await page.getByLabel('Contraseña').fill('clave-de-prueba-123')
  await page.getByLabel('Quiero ofrecer mis servicios').check()
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page).toHaveURL('/app/panel')
  await expect(page.getByRole('heading', { name: 'Ofrecé tus servicios' })).toBeVisible()
})

test('el admin ingresa en /admin y un cliente no puede entrar', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL('/admin/login')

  await page.getByLabel('Email').fill(ADMIN.email)
  await page.getByLabel('Contraseña').fill(ADMIN.password)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page).toHaveURL('/admin')
  await expect(page.getByRole('heading', { name: 'Resumen' })).toBeVisible()

  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page).toHaveURL('/')

  // Un cliente que intenta ingresar por /admin es rechazado.
  const email = emailUnico('intruso')
  await page.goto('/app/registro')
  await page.getByLabel('Nombre y apellido').fill('Intruso de Prueba')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill('clave-de-prueba-123')
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page).toHaveURL('/app')
  await page.goto('/admin')
  await expect(page).not.toHaveURL(/\/admin$/)
})

test('el admin aprueba a un profesional y aparece en las búsquedas', async ({ page }) => {
  const nombre = `Plomero Prueba ${Date.now()}`

  await page.goto('/app/registro')
  await page.getByLabel('Nombre y apellido').fill(nombre)
  await page.getByLabel('Email').fill(emailUnico('pro-completo'))
  await page.getByLabel('Contraseña').fill('clave-de-prueba-123')
  await page.getByLabel('Quiero ofrecer mis servicios').check()
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page).toHaveURL('/app/panel')

  await page.getByLabel('Oficio').fill('Plomero matriculado')
  await page.getByLabel('Horario de atención').fill('8:00 a 18:00')
  await page.getByLabel('Contanos sobre tu trabajo').fill('Plomero con experiencia en destapes y reparaciones del hogar.')
  await page.getByLabel('Nombre del servicio 1').fill('Destape de cañerías')
  await page.getByLabel('Precio del servicio 1').fill('18000')
  await page.getByRole('button', { name: 'Guardar perfil' }).click()
  await expect(page.getByText('Pendiente de aprobación')).toBeVisible()

  // Mientras está pendiente no se ve en el catálogo público.
  await page.goto(`/app/buscar?q=${encodeURIComponent(nombre)}`)
  await expect(page.getByText(nombre)).toHaveCount(0)

  await cerrarSesion(page)
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(ADMIN.email)
  await page.getByLabel('Contraseña').fill(ADMIN.password)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page).toHaveURL('/admin')

  await page.goto('/admin/profesionales')
  await page.getByRole('listitem').filter({ hasText: nombre }).getByRole('button', { name: 'Aprobar' }).click()
  await expect(page.getByRole('listitem').filter({ hasText: nombre }).getByText('aprobado', { exact: true })).toBeVisible()

  await page.goto(`/app/buscar?q=${encodeURIComponent(nombre)}`)
  await expect(page.getByText(nombre).first()).toBeVisible()
})
