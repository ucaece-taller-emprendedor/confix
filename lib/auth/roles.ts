export type Role = 'cliente' | 'profesional' | 'admin'

export const ROLES: Role[] = ['cliente', 'profesional', 'admin']

export const ROLE_LABELS: Record<Role, string> = {
  cliente: 'Cliente',
  profesional: 'Profesional',
  admin: 'Administrador',
}

export function toRole(value: unknown): Role {
  return value === 'admin' || value === 'profesional' ? value : 'cliente'
}

export type SessionUser = {
  id: string
  name: string
  email: string
  role: Role
}

export function safeNextPath(value: string | string[] | undefined, fallback = '/') {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return fallback
  return raw
}
