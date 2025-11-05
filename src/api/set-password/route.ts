import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const authModuleService: any = req.scope.resolve(Modules.AUTH)
  
  const email = "admin@avdigital.com"
  const password = "supersecret123"
  
  try {
    // Créer ou mettre à jour les credentials
    await authModuleService.createProviderIdentities({
      entity_id: email,
      provider: "emailpass",
      provider_metadata: {
        password: password
      }
    })
    
    return res.json({ 
      message: "Password set successfully",
      email,
      password,
      warning: "DELETE THIS ENDPOINT AFTER USE"
    })
    
  } catch (error: any) {
    return res.status(500).json({ 
      message: "Error setting password",
      error: error.message 
    })
  }
}

export const AUTHENTICATE = false
