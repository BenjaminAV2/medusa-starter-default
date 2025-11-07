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
 * DELETE /my-products/:id/images/:imageId
 * Supprimer une image d'un produit
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
    const imageId = req.params.imageId

    // Vérifier que le produit existe
    const products = await productModuleService.listProducts(
      { id: [productId] },
      { relations: ['images'] }
    )

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      })
    }

    const product = products[0]

    // Vérifier que l'image existe
    const images = product.images || []
    const imageIndex = images.findIndex((img: any) => img.id === imageId)

    if (imageIndex === -1) {
      return res.status(404).json({
        message: "Image not found"
      })
    }

    // Retirer l'image
    const updatedImages = images.filter((img: any) => img.id !== imageId)

    // Mettre à jour le produit
    const updatedProduct = await productModuleService.updateProducts(productId, {
      images: updatedImages
    })

    return res.json({
      id: imageId,
      deleted: true,
      message: "Image deleted successfully"
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
