import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import jwt from "jsonwebtoken"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const authModuleService: any = req.scope.resolve(Modules.AUTH)
  const userModuleService: any = req.scope.resolve(Modules.USER)
  
  const body = req.body as { email: string; password: string }
  const { email, password } = body
  
  try {
    // 1. Authentifier
    const authResult = await authModuleService.authenticate("emailpass", {
      body: { email, password }
    })
    
    if (!authResult.success) {
      return res.status(401).json({ message: "Invalid credentials" })
    }
    
    // 2. Récupérer l'utilisateur
    const users = await userModuleService.listUsers({ email })
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }
    
    const user = users[0]
    
    // 3. Générer le token JWT
    const secret = process.env.JWT_SECRET || "supersecret"
    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        auth_identity_id: authResult.authIdentity.id
      },
      secret,
      { expiresIn: "24h" }
    )
    
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      },
      token
    })
    
  } catch (error: any) {
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack
    })
  }
}

export const AUTHENTICATE = false
