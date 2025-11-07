import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  updateLineItemInCartWorkflow,
  deleteLineItemsWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * PUT /store/cart/line-items/:id
 * Modifier la quantité d'un article dans le panier
 *
 * Body params:
 * - cart_id: ID du panier (requis)
 * - quantity: Nouvelle quantité (requis)
 * - metadata: Métadonnées additionnelles (optionnel)
 */
export const PUT = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const lineItemId = req.params.id
    const body = req.body as any

    // Validation des champs requis
    if (!body.cart_id) {
      return res.status(400).json({
        message: "cart_id is required"
      })
    }

    if (body.quantity === undefined || body.quantity < 1) {
      return res.status(400).json({
        message: "quantity must be at least 1"
      })
    }

    // Mettre à jour l'article via le workflow
    const { result } = await updateLineItemInCartWorkflow(req.scope).run({
      input: {
        cart_id: body.cart_id,
        item_id: lineItemId,
        update: {
          quantity: body.quantity,
          metadata: body.metadata,
        }
      }
    })

    return res.json({
      cart: result,
      message: "Item updated successfully"
    })

  } catch (error: any) {
    return res.status(500).json({
      error: error.message
    })
  }
}

/**
 * DELETE /store/cart/line-items/:id
 * Retirer un article du panier
 *
 * Body params:
 * - cart_id: ID du panier (requis)
 */
export const DELETE = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const lineItemId = req.params.id
    const body = req.body as any

    // Validation du cart_id
    if (!body.cart_id) {
      return res.status(400).json({
        message: "cart_id is required"
      })
    }

    // Supprimer l'article via le workflow
    await deleteLineItemsWorkflow(req.scope).run({
      input: {
        cart_id: body.cart_id,
        ids: [lineItemId]
      }
    })

    return res.json({
      id: lineItemId,
      deleted: true,
      message: "Item removed from cart successfully"
    })

  } catch (error: any) {
    return res.status(500).json({
      error: error.message
    })
  }
}

export const AUTHENTICATE = false
