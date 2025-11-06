import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { pricingService } from '../../services/pricing'
import { z } from 'zod'
import { validateRequest } from '../../utils/validation'
import { supportTypes, formeTypes, tailleTypes } from '../../validators/product'

// Schema pour la requête de pricing
const pricingRequestSchema = z.object({
  support: z.enum(supportTypes),
  forme: z.enum(formeTypes),
  taille: z.enum(tailleTypes),
  quantity: z.coerce.number().int().positive().min(5).max(1000).optional(),
})

/**
 * GET /api/pricing
 * Retourne le prix calculé ou la matrice complète
 * Query params:
 * - support: type de support
 * - forme: type de forme
 * - taille: taille du sticker
 * - quantity (optional): quantité spécifique, sinon retourne toute la matrice
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    // Valider les query params
    const validatedData = validateRequest(pricingRequestSchema, req.query, res)
    if (!validatedData) return

    const { support, forme, taille, quantity } = validatedData

    // Si une quantité spécifique est demandée
    if (quantity) {
      const price = pricingService.calculatePrice({
        support,
        forme,
        taille,
        quantity,
      })

      return res.json({
        success: true,
        data: {
          pricing: price,
          configuration: {
            support,
            forme,
            taille,
            quantity,
          },
        },
      })
    }

    // Sinon, retourner la matrice complète
    const matrix = pricingService.generatePriceMatrix(support, forme, taille)

    return res.json({
      success: true,
      data: {
        matrix,
        configuration: {
          support,
          forme,
          taille,
        },
        available_quantities: pricingService.getAvailableQuantities(),
      },
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Pricing error:', err.message)

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Une erreur est survenue lors du calcul des prix',
    })
  }
}

/**
 * GET /api/pricing/quantities
 * Retourne les quantités disponibles
 */
export const quantities = async (_req: MedusaRequest, res: MedusaResponse) => {
  return res.json({
    success: true,
    data: {
      quantities: pricingService.getAvailableQuantities(),
    },
  })
}

export const AUTHENTICATE = false
