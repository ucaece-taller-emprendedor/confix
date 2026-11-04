import type { serviceRequest } from '@/lib/db/schema'

export type RequestStatus = 'pendiente' | 'aceptada' | 'rechazada' | 'completada' | 'cancelada'

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pendiente: 'Esperando cotización',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

export function toRequestStatus(value: string): RequestStatus {
  return value === 'aceptada' || value === 'rechazada' || value === 'completada' || value === 'cancelada'
    ? value
    : 'pendiente'
}

export type SubmittedRequest = {
  id: string
  professionalId: string
  professionalNombre: string
  items: { nombre: string; precio: number; cantidad: number }[]
  direccion: string
  fecha: string
  franja: string
  notas: string
  contacto: { nombre: string; telefono: string }
  costoVisita: number
  total: number
  estado: RequestStatus
  createdAt: string
}

export type ReceivedRequest = SubmittedRequest & { clientId: string }

type RequestRow = typeof serviceRequest.$inferSelect

/** Pasa una fila de la base al formato de la interfaz. Vive acá y no en un archivo 'use server' porque no es una server action. */
export function toSubmittedRequest(row: RequestRow): ReceivedRequest {
  return {
    id: row.id,
    clientId: row.clientId,
    professionalId: row.professionalId,
    professionalNombre: row.professionalNombre,
    items: row.items,
    direccion: row.direccion,
    fecha: row.fecha,
    franja: row.franja,
    notas: row.notas ?? '',
    contacto: { nombre: row.contactoNombre, telefono: row.contactoTelefono },
    costoVisita: row.costoVisita,
    total: row.total,
    estado: toRequestStatus(row.estado),
    createdAt: row.createdAt.toISOString(),
  }
}
