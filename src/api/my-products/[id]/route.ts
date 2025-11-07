import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
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
 * GET /my-products/:id
 * Récupérer les détails d'un produit spécifique
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

    // Récupérer le produit avec toutes ses relations
    const products = await productModuleService.listProducts(
      { id: [productId] },
      {
        relations: ['variants', 'options', 'categories', 'images', 'tags'],
      }
    )

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      })
    }

    return res.json({
      product: products[0]
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
 * PUT /my-products/:id
 * Mettre à jour un produit
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
    const body = req.body as any

    // Vérifier que le produit existe
    const existingProducts = await productModuleService.listProducts(
      { id: [productId] },
      {}
    )

    if (!existingProducts || existingProducts.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      })
    }

    // Mettre à jour le produit
    const updateData: any = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle
    if (body.handle !== undefined) updateData.handle = body.handle
    if (body.is_giftcard !== undefined) updateData.is_giftcard = body.is_giftcard
    if (body.discountable !== undefined) updateData.discountable = body.discountable
    if (body.metadata !== undefined) updateData.metadata = body.metadata
    if (body.status !== undefined) updateData.status = body.status

    const updatedProduct = await productModuleService.updateProducts(productId, updateData)

    return res.json({
      product: updatedProduct
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
 * DELETE /my-products/:id
 * Supprimer un produit
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

    // Vérifier que le produit existe
    const existingProducts = await productModuleService.listProducts(
      { id: [productId] },
      {}
    )

    if (!existingProducts || existingProducts.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      })
    }

    // Supprimer le produit
    await productModuleService.deleteProducts([productId])

    return res.json({
      id: productId,
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
