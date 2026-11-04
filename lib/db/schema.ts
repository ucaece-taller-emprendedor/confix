import { boolean, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  role: text('role').notNull().default('cliente'),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export type StoredService = {
  id: string
  nombre: string
  detalle: string
  precio: number
  unidad: string
}

export const professionalProfile = pgTable('professional_profile', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  nombre: text('nombre').notNull(),
  categoria: text('categoria').notNull(),
  oficio: text('oficio').notNull(),
  descripcion: text('descripcion').notNull(),
  barrio: text('barrio').notNull(),
  horario: text('horario').notNull(),
  costoVisita: integer('costoVisita').notNull().default(0),
  servicios: jsonb('servicios').$type<StoredService[]>().notNull().default([]),
  estado: text('estado').notNull().default('pendiente'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export type StoredRequestItem = { nombre: string; precio: number; cantidad: number }

export const serviceRequest = pgTable('service_request', {
  id: text('id').primaryKey(),
  clientId: text('clientId').notNull(),
  professionalId: text('professionalId').notNull(),
  professionalUserId: text('professionalUserId'),
  professionalNombre: text('professionalNombre').notNull(),
  items: jsonb('items').$type<StoredRequestItem[]>().notNull(),
  direccion: text('direccion').notNull(),
  piso: text('piso'),
  fecha: text('fecha').notNull(),
  franja: text('franja').notNull(),
  notas: text('notas'),
  contactoNombre: text('contactoNombre').notNull(),
  contactoTelefono: text('contactoTelefono').notNull(),
  costoVisita: integer('costoVisita').notNull().default(0),
  total: integer('total').notNull().default(0),
  estado: text('estado').notNull().default('pendiente'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
