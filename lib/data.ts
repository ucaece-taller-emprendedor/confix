// Las categorías y los barrios viven en la base de datos (ver lib/catalog.ts).
export type CategoryId = string

export type Category = {
  id: CategoryId
  nombre: string
  descripcion: string
}

export type Service = {
  id: string
  nombre: string
  detalle: string
  precio: number
  unidad: string
}

export type Review = {
  autor: string
  puntaje: number
  fecha: string
  texto: string
}

export type WeekDay = 'Lun' | 'Mar' | 'Mié' | 'Jue' | 'Vie' | 'Sáb' | 'Dom'

export type Professional = {
  id: string
  nombre: string
  categoria: CategoryId
  oficio: string
  foto: string
  puntaje: number
  cantidadResenas: number
  distanciaKm: number
  barrio: string
  disponibleHoy: boolean
  dias: WeekDay[]
  horario: string
  anosExperiencia: number
  trabajosRealizados: number
  respuesta: string
  descripcion: string
  costoVisita: number
  servicios: Service[]
  resenas: Review[]
  ownerId?: string
  nuevo?: boolean
}

export const SERVICE_UNITS = ['por trabajo', 'por hora', 'por m²', 'por unidad', 'por ambiente', 'por visita', 'desde']

export function formatPrice(value: number) {
  return `$${Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

export function formatRating(value: number) {
  return value.toFixed(1).replace('.', ',')
}

export function formatDistance(km: number) {
  return `${km.toFixed(1).replace('.', ',')} km`
}

export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
