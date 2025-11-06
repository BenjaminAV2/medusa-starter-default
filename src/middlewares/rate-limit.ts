import { RateLimiterMemory } from 'rate-limiter-flexible'
import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from '@medusajs/framework/http'

// Configuration des rate limiters
const loginLimiter = new RateLimiterMemory({
  points: 5, // 5 tentatives
  duration: 15 * 60, // par 15 minutes
  blockDuration: 15 * 60, // bloquer pendant 15 minutes
})

const apiLimiter = new RateLimiterMemory({
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000') / 1000,
})

const uploadLimiter = new RateLimiterMemory({
  points: 10, // 10 uploads
  duration: 60 * 60, // par heure
})

/**
 * Middleware de rate limiting pour les endpoints de login
 */
export async function loginRateLimit(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    await loginLimiter.consume(ip)
    next()
  } catch (error) {
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
    })
  }
}

/**
 * Middleware de rate limiting général pour les API
 */
export async function apiRateLimit(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    await apiLimiter.consume(ip)
    next()
  } catch (error) {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Trop de requêtes. Veuillez patienter un instant.',
    })
  }
}

/**
 * Middleware de rate limiting pour les uploads
 */
export async function uploadRateLimit(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    await uploadLimiter.consume(ip)
    next()
  } catch (error) {
    res.status(429).json({
      error: 'Too many uploads',
      message: 'Trop d\'uploads. Limite atteinte pour cette heure.',
    })
  }
}

/**
 * Rate limiter personnalisé
 */
export function createRateLimiter(points: number, duration: number) {
  const limiter = new RateLimiterMemory({ points, duration })

  return async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown'
      await limiter.consume(ip)
      next()
    } catch (error) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Limite de requêtes dépassée. Veuillez réessayer plus tard.',
      })
    }
  }
}
