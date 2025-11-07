import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import {
  createProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows"
import jwt from "jsonwebtoken"

// Middleware d'authentification
const authenticate = (req: MedusaRequest) => {
  const authHeader = req.headers.authorization as string
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No token provided')
  }

  const token = authHeader.substring(7)
  const secret = process.env.JWT_SECRET || "supersecret"

  try {
    const decoded = jwt.verify(token, secret) as any
    return decoded
  } catch (error) {
    throw new Error('Invalid token')
  }
}

/**
 * GET /my-products/:id/variants
 * Liste toutes les variantes d'un produit
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    // Vérifier l'authentification
    const user = authenticate(req)

    const productModuleService: any = req.scope.resolve(Modules.PRODUCT)
    const productId = req.params.id

    // Vérifier que le produit existe
    const products = await productModuleService.listProducts(
      { id: [productId] },
      {}
    )

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      })
    }

    // Récupérer les variantes du produit
    const variants = await productModuleService.listProductVariants(
      { product_id: productId },
      {
        relations: ['options'],
      }
    )

    return res.json({
      variants,
      count: variants.length
    })

  } catch (error: any) {
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return res.status(401).json({ message: "Unauthorized" })
    }
    return res.status(500).json({
      error: error.message
    })
  }
}

/**
 * POST /my-products/:id/variants
 * Créer une nouvelle variante pour un produit
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    // Vérifier l'authentification
    const user = authenticate(req)

    const productModuleService: any = req.scope.resolve(Modules.PRODUCT)
    const productId = req.params.id
    const body = req.body as any

    // Vérifier que le produit existe
    const products = await productModuleService.listProducts(
      { id: [productId] },
      {}
    )

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      })
    }

    // Préparer les données de la variante
    const variantData = {
      title: body.title,
      sku: body.sku,
      barcode: body.barcode,
      ean: body.ean,
      upc: body.upc,
      inventory_quantity: body.inventory_quantity || 0,
      allow_backorder: body.allow_backorder || false,
      manage_inventory: body.manage_inventory !== false,
      weight: body.weight,
      length: body.length,
      height: body.height,
      width: body.width,
      hs_code: body.hs_code,
      origin_country: body.origin_country,
      mid_code: body.mid_code,
      material: body.material,
      metadata: body.metadata,
      options: body.options, // Array of option values
    }

    // Utiliser le workflow pour créer la variante
    const { result } = await createProductVariantsWorkflow(req.scope).run({
      input: {
        product_variants: [
          {
            ...variantData,
            product_id: productId,
          }
        ]
      }
    })

    return res.status(201).json({
      variant: result[0]
    })

  } catch (error: any) {
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return res.status(401).json({ message: "Unauthorized" })
    }
    return res.status(500).json({
      error: error.message
    })
  }
}

export const AUTHENTICATE = false
