import type { ZodError } from 'zod'

/** Primer mensaje de error de un esquema, listo para mostrar al usuario. */
export function primerError(error: ZodError) {
  return error.issues[0]?.message ?? 'Revisá los datos ingresados.'
}
