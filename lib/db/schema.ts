import { boolean, doublePrecision, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  role: text('role').notNull().default('cliente'),
  // Datos de ejemplo cargados por el seed de demo (se pueden borrar sin tocar los reales).
  esDemo: boolean('esDemo').notNull().default(false),
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

export type StoredReview = { autor: string; puntaje: number; fecha: string; texto: string }

export const categoria = pgTable('categoria', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion').notNull().default(''),
  orden: integer('orden').notNull().default(0),
  activa: boolean('activa').notNull().default(true),
})

export const barrio = pgTable('barrio', {
  nombre: text('nombre').primaryKey(),
  orden: integer('orden').notNull().default(0),
  activo: boolean('activo').notNull().default(true),
})

export const professionalProfile = pgTable('professional_profile', {
  id: text('id').primaryKey(),
  // Null en los profesionales de demo que no tienen una cuenta para ingresar.
  userId: text('userId')
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  nombre: text('nombre').notNull(),
  categoria: text('categoria').notNull(),
  oficio: text('oficio').notNull(),
  descripcion: text('descripcion').notNull(),
  barrio: text('barrio').notNull(),
  horario: text('horario').notNull(),
  costoVisita: integer('costoVisita').notNull().default(0),
  servicios: jsonb('servicios').$type<StoredService[]>().notNull().default([]),
  foto: text('foto').notNull().default(''),
  puntaje: doublePrecision('puntaje').notNull().default(0),
  cantidadResenas: integer('cantidadResenas').notNull().default(0),
  distanciaKm: doublePrecision('distanciaKm').notNull().default(2.5),
  dias: jsonb('dias').$type<string[]>().notNull().default(['Lun', 'Mar', 'Mié', 'Jue', 'Vie']),
  anosExperiencia: integer('anosExperiencia').notNull().default(0),
  trabajosRealizados: integer('trabajosRealizados').notNull().default(0),
  respuesta: text('respuesta').notNull().default('Nuevo en CONFIX'),
  resenas: jsonb('resenas').$type<StoredReview[]>().notNull().default([]),
  estado: text('estado').notNull().default('pendiente'),
  esDemo: boolean('esDemo').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export type StoredRequestItem = { nombre: string; precio: number; cantidad: number }

export const serviceRequest = pgTable('service_request', {
  id: text('id').primaryKey(),
  clientId: text('clientId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  professionalId: text('professionalId').notNull(),
  professionalUserId: text('professionalUserId').references(() => user.id, { onDelete: 'set null' }),
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
