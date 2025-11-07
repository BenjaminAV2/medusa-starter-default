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
 * GET /my-products
 * Liste tous les produits avec leurs variantes
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    // Vérifier l'authentification
    const user = authenticate(req)

    const productModuleService: any = req.scope.resolve(Modules.PRODUCT)

    // Récupérer tous les produits avec leurs relations
    const products = await productModuleService.listProducts(
      {},
      {
        relations: ['variants', 'options', 'categories', 'images'],
        take: req.query.limit ? parseInt(req.query.limit as string) : 50,
        skip: req.query.offset ? parseInt(req.query.offset as string) : 0,
      }
    )

    return res.json({
      products,
      count: products.length
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
 * POST /my-products
 * Créer un nouveau produit
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    // Vérifier l'authentification
    const user = authenticate(req)

    const productModuleService: any = req.scope.resolve(Modules.PRODUCT)

    const body = req.body as any

    const product = await productModuleService.createProducts({
      title: body.title,
      description: body.description,
      is_giftcard: body.is_giftcard || false,
      discountable: body.discountable !== false,
      handle: body.handle,
      subtitle: body.subtitle,
      metadata: body.metadata,
    })

    return res.json({
      product
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
