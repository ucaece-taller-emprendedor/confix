import { expect, test, type Page } from '@playwright/test'

const CLAVE = 'Demo-Clave-2026'
const unico = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`

async function registrar(page: Page, tipo: 'Cliente' | 'Profesional', nombre: string, email: string) {
  await page.goto('/app/registro')
  await page.getByLabel(new RegExp(`^${tipo}`)).check()
  await page.getByLabel('Nombre').fill(nombre)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(CLAVE)
  await page.getByRole('button', { name: 'Registrarme' }).click()
  await expect(page).toHaveURL(tipo === 'Cliente' ? /\/app$/ : /\/app\/panel$/)
}

/** Elige el primer día disponible y la primera franja horaria. */
async function elegirHorario(page: Page) {
  await page.getByRole('radiogroup', { name: 'Día' }).locator('[role=radio]:not([disabled])').first().click()
  await page.getByRole('radiogroup', { name: 'Franja horaria' }).getByRole('radio').first().click()
}

async function ingresarAdmin(page: Page) {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill('admin.demo@confix.test')
  await page.getByLabel('Contraseña').fill(CLAVE)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page).toHaveURL(/\/admin$/)
}

test('la landing pública se ve con sus llamados a la acción', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('profesional que necesitás')
  await expect(page.getByRole('link', { name: 'Ingresar' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Registrarme' }).first()).toBeVisible()
})

test('registro de un cliente, sesión persistente, cierre de sesión y login', async ({ page }) => {
  const email = `cliente.${unico()}@confix.test`
  await registrar(page, 'Cliente', 'Cliente Nuevo', email)
  await expect(page).toHaveURL(/\/app$/)
  await expect(page.getByRole('heading', { name: '¿Qué necesitás arreglar hoy?' })).toBeVisible()

  // La sesión persiste al recargar.
  await page.reload()
  await expect(page.getByRole('button', { name: 'Salir' })).toBeVisible()

  await page.getByRole('button', { name: 'Salir' }).click()
  await page.goto('/app/ingresar')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(CLAVE)
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Salir' })).toBeVisible()
})

test('buscar por categoría, ver el perfil y pedir cotización', async ({ page }) => {
  const email = `cliente.${unico()}@confix.test`
  await registrar(page, 'Cliente', 'Cliente Cotiza', email)
  await expect(page).toHaveURL(/\/app$/)

  await page.goto('/app/buscar?categoria=plomeria')
  await expect(page.getByText('Juan Pereyra')).toBeVisible()
  await expect(page.getByText('Esteban Gómez')).toHaveCount(0) // es de carpintería
  await page.getByRole('link', { name: /Juan Pereyra/ }).click()
  await expect(page.getByRole('heading', { name: 'Juan Pereyra' })).toBeVisible()
  await page.getByRole('button', { name: 'Pedir cotización' }).click()

  await expect(page.getByRole('heading', { name: 'Tu solicitud' })).toBeVisible()
  await page.getByLabel('Calle y altura').fill('Thames 1450')
  await elegirHorario(page)
  await page.getByLabel('Teléfono').fill('11 5555 1234')
  await page.getByRole('button', { name: 'Confirmar solicitud' }).click()

  await expect(page.getByRole('heading', { name: '¡Solicitud enviada!' })).toBeVisible()
  const numero = (await page.getByTestId('numero-solicitud').textContent())?.trim() ?? ''
  expect(numero).toMatch(/^CFX-/)
  await page.getByRole('link', { name: 'Ver mis solicitudes' }).click()
  await expect(page.getByTestId(`solicitud-${numero}`)).toContainText('Esperando cotización')
  await page.getByRole('button', { name: 'Salir' }).click()
})

test('el profesional demo recibe un pedido y lo acepta', async ({ page }) => {
  const email = `cliente.${unico()}@confix.test`
  await registrar(page, 'Cliente', 'Cliente Para Esteban', email)
  await page.goto('/app/buscar?categoria=carpinteria')
  await page.getByRole('link', { name: /Esteban Gómez/ }).click()
  await page.getByRole('button', { name: 'Pedir cotización' }).click()
  await page.getByLabel('Calle y altura').fill('Honduras 5200')
  await elegirHorario(page)
  await page.getByLabel('Teléfono').fill('11 4444 5678')
  await page.getByRole('button', { name: 'Confirmar solicitud' }).click()
  const numero = (await page.getByTestId('numero-solicitud').textContent())?.trim() ?? ''
  await page.getByRole('button', { name: 'Salir' }).click()

  await page.goto('/app/ingresar')
  await page.getByLabel('Email').fill('profesional.demo@confix.test')
  await page.getByLabel('Contraseña').fill(CLAVE)
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click()
  await expect(page).toHaveURL(/\/app\/panel$/)
  const tarjeta = page.getByTestId(`solicitud-${numero}`)
  await expect(tarjeta).toContainText('Cliente Para Esteban')
  await tarjeta.getByRole('button', { name: 'Aceptar' }).click()
  await expect(tarjeta).toContainText('Aceptada')
})

test('un profesional nuevo queda pendiente hasta que el admin lo aprueba', async ({ page }) => {
  const id = unico()
  const email = `pro.${id}@confix.test`
  const nombre = `Pro Nuevo ${id}`
  await registrar(page, 'Profesional', nombre, email)
  await expect(page).toHaveURL(/\/app\/panel$/)
  await expect(page.getByText('Tu cuenta de profesional está pendiente de aprobación.')).toBeVisible()

  await page.getByLabel('Nombre público').fill(nombre)
  await page.getByLabel('Categoría').selectOption('electricidad')
  await page.getByLabel('Oficio').fill('Electricista')
  await page.getByLabel('Barrio').selectOption('Palermo')
  await page.getByLabel('Horario de atención').fill('9:00 a 18:00')
  await page.getByLabel('Costo de la visita ($)').fill('4500')
  await page.getByLabel('Contanos sobre tu trabajo').fill('Instalaciones eléctricas y reparaciones del hogar con matrícula.')
  await page.getByLabel('Nombre del servicio 1').fill('Cambio de tomas')
  await page.getByLabel('Precio del servicio 1').fill('9000')
  await page.getByRole('button', { name: 'Enviar mi perfil' }).click()
  await expect(page.getByTestId('estado-perfil')).toHaveText('Pendiente de aprobación')

  // Pendiente: no aparece en las búsquedas públicas.
  await page.goto('/app/buscar')
  await expect(page.getByText('Esteban Gómez')).toBeVisible()
  await expect(page.getByText(nombre)).toHaveCount(0)
  await page.getByRole('button', { name: 'Salir' }).click()

  await ingresarAdmin(page)
  await page.getByRole('link', { name: 'Profesionales', exact: true }).click()
  await page.getByRole('button', { name: `Aprobar a ${nombre}` }).click()
  await expect(page.getByTestId(/^profesional-/).filter({ hasText: nombre })).toContainText('aprobado')

  // Ahora sí: es público.
  await page.goto('/app/buscar')
  await expect(page.getByText(nombre)).toBeVisible()
})

test('login de admin; un usuario común no entra al panel', async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill('cliente.demo@confix.test')
  await page.getByLabel('Contraseña').fill(CLAVE)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page.getByText('no tiene permisos de administrador')).toBeVisible()

  await ingresarAdmin(page)
  await expect(page.getByRole('heading', { name: 'Administración' })).toBeVisible()
})

test('/admin sin sesión manda al login', async ({ page }) => {
  await page.goto('/admin/usuarios')
  await expect(page).toHaveURL(/\/admin\/login$/)
})
