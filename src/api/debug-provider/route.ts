import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const authModuleService: any = req.scope.resolve(Modules.AUTH)
  
  const authIdentityId = "authid_01K9A7BX674VAPHMHPJZYA0GJ8"
  
  try {
    const providerIdentities = await authModuleService.listProviderIdentities({
      auth_identity_id: authIdentityId
    })
    
    return res.json({
      authIdentityId,
      providerIdentitiesCount: providerIdentities.length,
      providers: providerIdentities
    })
    
  } catch (error: any) {
    return res.status(500).json({ 
      error: error.message 
    })
  }
}

export const AUTHENTICATE = false
