import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const authModuleService: any = req.scope.resolve(Modules.AUTH)
  
  const body = req.body as { email: string; password: string }
  const { email, password } = body
  
  try {
    const result = await authModuleService.authenticate("emailpass", {
      body: { email, password }
    })
    
    return res.json({ 
      success: true,
      result
    })
    
  } catch (error: any) {
    return res.status(401).json({ 
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
}

export const AUTHENTICATE = false
