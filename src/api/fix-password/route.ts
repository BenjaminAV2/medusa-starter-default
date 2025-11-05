import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const authModuleService: any = req.scope.resolve(Modules.AUTH)
  
  const email = "admin@avdigital.com"
  const password = "supersecret123"
  const authIdentityId = "authid_01K9A7BX674VAPHMHPJZYA0GJ8"
  
  try {
    // Supprimer l'ancien provider identity
    await authModuleService.deleteProviderIdentities(["01K9A7BX6MM74MRMX7H9CVZVW6"])
    
    // Créer un nouveau avec le password hashé via register
    await authModuleService.register("emailpass", {
      entity_id: email,
      auth_identity_id: authIdentityId,
      body: {
        email,
        password
      }
    })
    
    return res.json({ 
      message: "Password fixed with proper hashing",
      email,
      warning: "DELETE THIS ENDPOINT AFTER USE"
    })
    
  } catch (error: any) {
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack
    })
  }
}

export const AUTHENTICATE = false
