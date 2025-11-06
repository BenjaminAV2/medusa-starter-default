import { z } from 'zod'
import type { MedusaResponse } from '@medusajs/framework/http'

/**
 * Valide les données avec un schéma Zod
 * @param schema - Schéma Zod
 * @param data - Données à valider
 * @returns Données validées
 * @throws ZodError si validation échoue
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}

/**
 * Valide les données et retourne le résultat
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodIssue[] } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return { success: false, errors: result.error.issues }
}

/**
 * Middleware de validation avec gestion d'erreur
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown, res: MedusaResponse): T | null {
  const result = safeValidate(schema, data)

  if (!result.success) {
    res.status(400).json({
      error: 'Validation failed',
      message: 'Les données fournies sont invalides',
      details: result.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    })
    return null
  }

  return result.data
}

/**
 * Formatte les erreurs Zod pour l'API
 */
export function formatZodErrors(errors: z.ZodIssue[]) {
  return errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }))
}
