import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const authModuleService: any = req.scope.resolve(Modules.AUTH)
  const userModuleService: any = req.scope.resolve(Modules.USER)
  
  const email = "admin@avdigital.com"
  const password = "supersecret123"
  
  try {
    // Récupérer l'utilisateur
    const users = await userModuleService.listUsers({ email })
    
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }
    
    const user = users[0]
    
    // Créer l'auth identity
    const authIdentity = await authModuleService.createAuthIdentities({
      app_metadata: {
        user_id: user.id
      }
    })
    
    // Créer le provider identity avec le mot de passe
    await authModuleService.createProviderIdentities({
      auth_identity_id: authIdentity.id,
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
      userId: user.id,
      authIdentityId: authIdentity.id,
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
