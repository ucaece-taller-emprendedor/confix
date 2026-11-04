import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const globalForPool = globalThis as unknown as { confixPool?: Pool }

export const pool = globalForPool.confixPool ?? new Pool({ connectionString: process.env.DATABASE_URL })

if (process.env.NODE_ENV !== 'production') globalForPool.confixPool = pool

export const db = drizzle(pool, { schema })
