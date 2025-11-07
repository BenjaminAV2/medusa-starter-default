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
 * POST /my-products/:id/images
 * Ajouter une image à un produit
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
      { relations: ['images'] }
    )

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      })
    }

    const product = products[0]

    // Valider les données de l'image
    if (!body.url) {
      return res.status(400).json({
        message: "Image URL is required"
      })
    }

    // Récupérer les images existantes
    const existingImages = product.images || []

    // Ajouter la nouvelle image
    const newImages = [
      ...existingImages,
      {
        url: body.url,
        metadata: body.metadata || {},
      }
    ]

    // Mettre à jour le produit avec les nouvelles images
    const updatedProduct = await productModuleService.updateProducts(productId, {
      images: newImages
    })

    return res.status(201).json({
      product: updatedProduct,
      message: "Image added successfully"
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
