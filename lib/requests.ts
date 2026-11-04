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
