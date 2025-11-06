import jwt from 'jsonwebtoken'
import type { MedusaRequest } from '@medusajs/framework/http'

export interface JWTPayload {
  user_id: string
  email: string
  auth_identity_id?: string
  type: 'access' | 'refresh'
}

export interface AuthenticatedUser {
  user_id: string
  email: string
  auth_identity_id?: string
}

/**
 * Génère un token JWT
 */
export function generateToken(
  payload: Omit<JWTPayload, 'type'>,
  type: 'access' | 'refresh' = 'access'
): string {
  const secret = process.env.JWT_SECRET || 'supersecret'
  const expiresIn = type === 'access' ? '1h' : '7d'

  return jwt.sign({ ...payload, type }, secret, { expiresIn })
}

/**
 * Vérifie et décode un token JWT
 */
export function verifyToken(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET || 'supersecret'

  try {
    return jwt.verify(token, secret) as JWTPayload
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

/**
 * Extrait le token Bearer de l'en-tête Authorization
 */
export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  return authHeader.substring(7)
}

/**
 * Middleware d'authentification pour les routes protégées
 */
export function authenticate(req: MedusaRequest): AuthenticatedUser {
  const authHeader = req.headers.authorization as string
  const token = extractBearerToken(authHeader)

  if (!token) {
    throw new Error('No token provided')
  }

  try {
    const decoded = verifyToken(token)

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type')
    }

    return {
      user_id: decoded.user_id,
      email: decoded.email,
      auth_identity_id: decoded.auth_identity_id,
    }
  } catch (error) {
    throw new Error('Invalid token')
  }
}

/**
 * Génère une paire de tokens (access + refresh)
 */
export function generateTokenPair(user: Omit<JWTPayload, 'type'>) {
  return {
    access_token: generateToken(user, 'access'),
    refresh_token: generateToken(user, 'refresh'),
    expires_in: 3600, // 1 heure en secondes
  }
}
