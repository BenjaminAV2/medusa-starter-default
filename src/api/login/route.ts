import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { Modules } from '@medusajs/framework/utils'
import { loginSchema } from '../../validators/auth'
import { validateRequest } from '../../utils/validation'
import { generateTokenPair } from '../../utils/auth'
import { loginRateLimit } from '../../middlewares/rate-limit'

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Appliquer le rate limiting
  await new Promise<void>((resolve, reject) => {
    loginRateLimit(req, res, (error?: any) => {
      if (error) reject(error)
      else resolve()
    })
  }).catch(() => {
    // Le rate limiter a déjà envoyé la réponse
    return
  })

  // Valider les données d'entrée
  const validatedData = validateRequest(loginSchema, req.body, res)
  if (!validatedData) return // Erreur de validation déjà envoyée

  const { email, password } = validatedData

  const authModuleService = req.scope.resolve(Modules.AUTH)
  const userModuleService = req.scope.resolve(Modules.USER)

  try {
    // 1. Authentifier
    const authResult = await authModuleService.authenticate('emailpass', {
      body: { email, password },
    })

    if (!authResult.success) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Email ou mot de passe invalide',
      })
    }

    // 2. Récupérer l'utilisateur
    const users = await userModuleService.listUsers({ email })
    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Utilisateur introuvable',
      })
    }

    const user = users[0]

    // 3. Générer la paire de tokens (access + refresh)
    const tokens = generateTokenPair({
      user_id: user.id,
      email: user.email,
      auth_identity_id: authResult.authIdentity?.id,
    })

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      ...tokens,
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Login error:', err.message)

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Une erreur est survenue lors de la connexion',
    })
  }
}

export const AUTHENTICATE = false
