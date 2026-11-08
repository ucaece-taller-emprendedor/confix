// ──────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE CONFIX — marca, roles y textos de la landing.
// Los colores y la tipografía se cambian en src/styles/tema.css.
// Si agregás o renombrás roles, hay que cambiarlos TAMBIÉN en firestore.rules.
// ──────────────────────────────────────────────────────────────────────────

export const MARCA = {
  nombre: 'CONFIX',
  eslogan: 'El profesional que necesitás para tu casa, sin vueltas.',
  logo: '/logo.svg',
  contacto: 'contacto@confix.test',
}

export type Rol = 'cliente' | 'profesional' | 'admin'
export type Estado = 'activo' | 'pendiente' | 'suspendido'

export const ESTADOS: Estado[] = ['activo', 'pendiente', 'suspendido']

export type RolRegistrable = Exclude<Rol, 'admin'>

export const ROLES_REGISTRABLES: {
  rol: RolRegistrable
  etiqueta: string
  descripcion: string
  /** Si es true el usuario queda "pendiente" hasta que el admin lo aprueba. */
  requiereAprobacion: boolean
  /** Panel al que va después de ingresar. */
  panel: string
}[] = [
  { rol: 'cliente', etiqueta: 'Cliente', descripcion: 'Buscá profesionales y pedí cotizaciones para tu casa.', requiereAprobacion: false, panel: '/app' },
  { rol: 'profesional', etiqueta: 'Profesional', descripcion: 'Ofrecé tus servicios y recibí pedidos. Un administrador aprueba tu perfil.', requiereAprobacion: true, panel: '/app/panel' },
]

export const ETIQUETA_ROL: Record<Rol, string> = { cliente: 'Cliente', profesional: 'Profesional', admin: 'Administrador' }

export function panelDe(rol: Rol): string {
  if (rol === 'admin') return '/admin'
  return ROLES_REGISTRABLES.find(r => r.rol === rol)?.panel ?? '/app'
}

/** Landing pública: textos de la web original de CONFIX. */
export const LANDING = {
  etiqueta: 'Servicios para el hogar',
  titulo: 'El profesional que necesitás para tu casa, sin vueltas.',
  bajada: 'Plomería, electricidad, pintura y carpintería. Buscá, compará y pedí cotización a profesionales verificados de tu barrio.',
  problema: {
    titulo: 'Contratar a alguien de confianza es difícil',
    texto: 'Faltan referencias, es complicado comparar precios y no hay garantías. Terminás pidiendo contactos a conocidos o arriesgándote con un desconocido.',
  },
  solucion: {
    titulo: 'CONFIX lo ordena',
    texto: 'Un solo lugar con profesionales revisados, precios visibles y un pedido de cotización que se hace en minutos.',
  },
  pasos: [
    { titulo: 'Buscá', texto: 'Elegí la categoría y mirá profesionales de tu barrio con sus precios y reseñas.' },
    { titulo: 'Pedí tu cotización', texto: 'Seleccioná los servicios, contá cuándo te viene bien y enviá el pedido sin cargo.' },
    { titulo: 'Contratá con confianza', texto: 'El profesional te contacta con el precio final. Vos decidís.' },
  ],
  beneficios: [
    { titulo: 'Profesionales verificados', texto: 'Cada perfil lo revisa nuestro equipo antes de publicarse.' },
    { titulo: 'Precios claros', texto: 'Ves el valor de cada servicio y de la visita antes de pedir.' },
    { titulo: 'Referencias reales', texto: 'Calificaciones y reseñas para comparar con tranquilidad.' },
  ],
  cta: { titulo: '¿Sos plomero, electricista, pintor o carpintero?', texto: 'Registrate como profesional, armá tu perfil y recibí pedidos de cotización.' },
}

/** Credenciales DEMO públicas (las crea scripts/seed.ts solo en los emuladores). */
export const CLAVE_DEMO = 'Demo-Clave-2026'
