import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import {
  createCartWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * POST /store/cart
 * Créer un nouveau panier
 *
 * Body params:
 * - region_id: ID de la région (requis)
 * - email: Email du client (optionnel)
 * - sales_channel_id: ID du canal de vente (optionnel)
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const body = req.body as any

    if (!body.region_id) {
      return res.status(400).json({
        message: "region_id is required"
      })
    }

    // Créer le panier avec le workflow
    const { result: cart } = await createCartWorkflow(req.scope).run({
      input: {
        region_id: body.region_id,
        email: body.email,
        currency_code: body.currency_code || "eur",
        sales_channel_id: body.sales_channel_id,
        metadata: body.metadata || {},
      }
    })

    return res.status(201).json({
      cart
    })

  } catch (error: any) {
    return res.status(500).json({
      error: error.message
    })
  }
}

/**
 * GET /store/cart
 * Récupérer un panier par son ID
 *
 * Query params:
 * - id: ID du panier (requis)
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const cartId = req.query.id as string

    if (!cartId) {
      return res.status(400).json({
        message: "cart id is required"
      })
    }

    const cartModuleService: any = req.scope.resolve(Modules.CART)

    // Récupérer le panier avec toutes ses relations
    const carts = await cartModuleService.listCarts(
      { id: [cartId] },
      {
        relations: [
          'items',
          'items.variant',
          'items.variant.product',
          'shipping_address',
          'billing_address',
        ]
      }
    )

    if (!carts || carts.length === 0) {
      return res.status(404).json({
        message: "Cart not found"
      })
    }

    return res.json({
      cart: carts[0]
    })

  } catch (error: any) {
    return res.status(500).json({
      error: error.message
    })
  }
}

export const AUTHENTICATE = false
