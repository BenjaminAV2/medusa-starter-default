import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import {
  updateProductVariantsWorkflow,
  deleteProductVariantsWorkflow,
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
 * PUT /my-products/:id/variants/:vid
 * Mettre à jour une variante
 */
export const PUT = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    // Vérifier l'authentification
    const user = authenticate(req)

    const productModuleService: any = req.scope.resolve(Modules.PRODUCT)
    const productId = req.params.id
    const variantId = req.params.vid
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

    // Vérifier que la variante existe
    const variants = await productModuleService.listProductVariants(
      { id: [variantId], product_id: productId },
      {}
    )

    if (!variants || variants.length === 0) {
      return res.status(404).json({
        message: "Variant not found"
      })
    }

    // Préparer les données de mise à jour
    const updateData: any = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.sku !== undefined) updateData.sku = body.sku
    if (body.barcode !== undefined) updateData.barcode = body.barcode
    if (body.ean !== undefined) updateData.ean = body.ean
    if (body.upc !== undefined) updateData.upc = body.upc
    if (body.inventory_quantity !== undefined) updateData.inventory_quantity = body.inventory_quantity
    if (body.allow_backorder !== undefined) updateData.allow_backorder = body.allow_backorder
    if (body.manage_inventory !== undefined) updateData.manage_inventory = body.manage_inventory
    if (body.weight !== undefined) updateData.weight = body.weight
    if (body.length !== undefined) updateData.length = body.length
    if (body.height !== undefined) updateData.height = body.height
    if (body.width !== undefined) updateData.width = body.width
    if (body.hs_code !== undefined) updateData.hs_code = body.hs_code
    if (body.origin_country !== undefined) updateData.origin_country = body.origin_country
    if (body.mid_code !== undefined) updateData.mid_code = body.mid_code
    if (body.material !== undefined) updateData.material = body.material
    if (body.metadata !== undefined) updateData.metadata = body.metadata
    if (body.options !== undefined) updateData.options = body.options

    // Utiliser le workflow pour mettre à jour la variante
    const { result } = await updateProductVariantsWorkflow(req.scope).run({
      input: {
        product_variants: [
          {
            id: variantId,
            ...updateData,
          }
        ]
      }
    })

    return res.json({
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

/**
 * DELETE /my-products/:id/variants/:vid
 * Supprimer une variante
 */
export const DELETE = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    // Vérifier l'authentification
    const user = authenticate(req)

    const productModuleService: any = req.scope.resolve(Modules.PRODUCT)
    const productId = req.params.id
    const variantId = req.params.vid

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

    // Vérifier que la variante existe
    const variants = await productModuleService.listProductVariants(
      { id: [variantId], product_id: productId },
      {}
    )

    if (!variants || variants.length === 0) {
      return res.status(404).json({
        message: "Variant not found"
      })
    }

    // Utiliser le workflow pour supprimer la variante
    await deleteProductVariantsWorkflow(req.scope).run({
      input: {
        ids: [variantId]
      }
    })

    return res.json({
      id: variantId,
      deleted: true
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
