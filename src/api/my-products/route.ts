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
      discountable: body.discountable !== false
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
