import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const userModuleService: any = req.scope.resolve(Modules.USER)
  
  const email = "admin@avdigital.com"
  const password = "supersecret123"
  
  try {
    // Vérifie si un utilisateur existe déjà
    const existingUsers = await userModuleService.listUsers({ email })
    
    if (existingUsers.length > 0) {
      return res.json({ 
        message: "Admin user already exists",
        email 
      })
    }
    
    // Crée l'utilisateur
    const user = await userModuleService.createUsers({
      email,
      first_name: "Admin",
      last_name: "AV Digital"
    })
    
    return res.json({ 
      message: "Admin user created successfully",
      email,
      password,
      userId: user.id,
      warning: "DELETE THIS ENDPOINT AFTER FIRST USE"
    })
    
  } catch (error: any) {
    return res.status(500).json({ 
      message: "Error creating user",
      error: error.message 
    })
  }
}

export const AUTHENTICATE = false
