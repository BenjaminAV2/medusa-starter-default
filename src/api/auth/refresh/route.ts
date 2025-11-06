import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { Modules } from '@medusajs/framework/utils'
import { refreshTokenSchema } from '../../../validators/auth'
import { validateRequest } from '../../../utils/validation'
import { verifyToken, generateTokenPair } from '../../../utils/auth'

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Valider les données d'entrée
  const validatedData = validateRequest(refreshTokenSchema, req.body, res)
  if (!validatedData) return

  const { refresh_token } = validatedData

  try {
    // Vérifier le refresh token
    const decoded = verifyToken(refresh_token)

    if (decoded.type !== 'refresh') {
      return res.status(400).json({
        error: 'Invalid token type',
        message: 'Le token fourni n\'est pas un refresh token',
      })
    }

    // Vérifier que l'utilisateur existe toujours
    const userModuleService = req.scope.resolve(Modules.USER)
    const users = await userModuleService.listUsers({ id: decoded.user_id })

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Utilisateur introuvable',
      })
    }

    const user = users[0]

    // Générer une nouvelle paire de tokens
    const tokens = generateTokenPair({
      user_id: user.id,
      email: user.email,
      auth_identity_id: decoded.auth_identity_id,
    })

    return res.json(tokens)
  } catch (error: unknown) {
    const err = error as Error

    if (err.message.includes('expired')) {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Le refresh token a expiré. Veuillez vous reconnecter.',
      })
    }

    return res.status(401).json({
      error: 'Invalid token',
      message: 'Le refresh token est invalide',
    })
  }
}

export const AUTHENTICATE = false
