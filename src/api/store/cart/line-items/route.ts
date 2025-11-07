import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  addToCartWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * POST /store/cart/line-items
 * Ajouter un article au panier
 *
 * Body params:
 * - cart_id: ID du panier (requis)
 * - variant_id: ID de la variante produit (requis)
 * - quantity: Quantité à ajouter (requis)
 * - metadata: Métadonnées additionnelles (optionnel)
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const body = req.body as any

    // Validation des champs requis
    if (!body.cart_id) {
      return res.status(400).json({
        message: "cart_id is required"
      })
    }

    if (!body.variant_id) {
      return res.status(400).json({
        message: "variant_id is required"
      })
    }

    if (!body.quantity || body.quantity < 1) {
      return res.status(400).json({
        message: "quantity must be at least 1"
      })
    }

    // Ajouter l'article au panier via le workflow
    const { result } = await addToCartWorkflow(req.scope).run({
      input: {
        items: [
          {
            variant_id: body.variant_id,
            quantity: body.quantity,
            metadata: body.metadata || {},
          }
        ],
        cart_id: body.cart_id,
      }
    })

    return res.status(201).json({
      cart: result,
      message: "Item added to cart successfully"
    })

  } catch (error: any) {
    return res.status(500).json({
      error: error.message
    })
  }
}

export const AUTHENTICATE = false
