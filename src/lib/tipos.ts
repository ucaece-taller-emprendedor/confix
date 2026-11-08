import type { Timestamp } from 'firebase/firestore'

export type CategoriaId = string

export type Categoria = { id: CategoriaId; nombre: string; descripcion: string; orden: number; activa: boolean }
export type Barrio = { id: string; nombre: string; orden: number; activo: boolean }

export type Servicio = { id: string; nombre: string; detalle: string; precio: number; unidad: string }
export type Resena = { autor: string; puntaje: number; fecha: string; texto: string }

export type DiaSemana = 'Lun' | 'Mar' | 'Mié' | 'Jue' | 'Vie' | 'Sáb' | 'Dom'
export const SEMANA: DiaSemana[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export type EstadoProfesional = 'aprobado' | 'pendiente' | 'suspendido'

/** Documento professionals/{id}. */
export type Profesional = {
  id: string
  ownerId: string
  nombre: string
  categoria: CategoriaId
  oficio: string
  descripcion: string
  barrio: string
  horario: string
  costoVisita: number
  servicios: Servicio[]
  foto: string
  puntaje: number
  cantidadResenas: number
  distanciaKm: number
  dias: DiaSemana[]
  anosExperiencia: number
  trabajosRealizados: number
  respuesta: string
  resenas: Resena[]
  disponibleHoy: boolean
  estado: EstadoProfesional
  isDemo: boolean
}

export const UNIDADES_SERVICIO = ['por trabajo', 'por hora', 'por m²', 'por unidad', 'por ambiente', 'por visita', 'desde']

export type EstadoSolicitud = 'pendiente' | 'aceptada' | 'rechazada' | 'completada' | 'cancelada'

export const ETIQUETA_ESTADO_SOLICITUD: Record<EstadoSolicitud, string> = {
  pendiente: 'Esperando cotización',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

export type LineaSolicitud = { nombre: string; precio: number; cantidad: number }

/** Documento requests/{id}. */
export type Solicitud = {
  id: string
  clientId: string
  professionalId: string
  professionalOwnerId: string
  professionalNombre: string
  items: LineaSolicitud[]
  direccion: string
  piso: string
  barrio: string
  fecha: string
  franja: string
  notas: string
  contactoNombre: string
  contactoTelefono: string
  costoVisita: number
  total: number
  estado: EstadoSolicitud
  isDemo: boolean
  createdAt?: Timestamp | null
}

/** Ordena de la más nueva a la más vieja (se ordena en el cliente para no necesitar índices compuestos). */
export function masNuevasPrimero<T extends { createdAt?: Timestamp | null }>(lista: T[]): T[] {
  return [...lista].sort((a, b) => (b.createdAt?.toMillis() ?? Number.MAX_SAFE_INTEGER) - (a.createdAt?.toMillis() ?? Number.MAX_SAFE_INTEGER))
}

export function formatoPrecio(valor: number) {
  return `$${Math.round(valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}
export function formatoPuntaje(valor: number) {
  return valor.toFixed(1).replace('.', ',')
}
export function formatoDistancia(km: number) {
  return `${km.toFixed(1).replace('.', ',')} km`
}
export function normalizar(texto: string) {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}
