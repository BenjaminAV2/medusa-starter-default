import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const userModuleService: any = req.scope.resolve(Modules.USER)
  const authModuleService: any = req.scope.resolve(Modules.AUTH)
  
  const email = "admin@avdigital.com"
  
  try {
    const users = await userModuleService.listUsers({ email })
    
    if (users.length === 0) {
      return res.json({ message: "User not found" })
    }
    
    const user = users[0]
    
    // Chercher les auth identities
    const authIdentities = await authModuleService.listAuthIdentities({
      app_metadata: { user_id: user.id }
    })
    
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      },
      authIdentities: authIdentities.length,
      details: authIdentities
    })
    
  } catch (error: any) {
    return res.status(500).json({ 
      error: error.message 
    })
  }
}

export const AUTHENTICATE = false
