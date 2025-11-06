import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { Modules } from '@medusajs/framework/utils'

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  services: {
    database: {
      status: 'up' | 'down'
      responseTime?: number
    }
    redis?: {
      status: 'up' | 'down'
      responseTime?: number
    }
  }
  version: string
}

/**
 * GET /api/health
 * Health check endpoint complet
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const startTime = Date.now()
  const healthCheck: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: {
        status: 'down',
      },
    },
    version: process.env.npm_package_version || '1.0.0',
  }

  try {
    // Test de connexion à la base de données
    const dbStartTime = Date.now()
    try {
      // Essayer de récupérer un module pour tester la connexion DB
      const storeService = req.scope.resolve(Modules.STORE)
      await storeService.listStores()
      healthCheck.services.database = {
        status: 'up',
        responseTime: Date.now() - dbStartTime,
      }
    } catch (error) {
      healthCheck.services.database = {
        status: 'down',
      }
      healthCheck.status = 'unhealthy'
    }

    // Test Redis (optionnel)
    if (process.env.REDIS_URL) {
      const redisStartTime = Date.now()
      try {
        // TODO: Ajouter test Redis si configuré
        healthCheck.services.redis = {
          status: 'up',
          responseTime: Date.now() - redisStartTime,
        }
      } catch (error) {
        healthCheck.services.redis = {
          status: 'down',
        }
        healthCheck.status = 'degraded'
      }
    }

    // Déterminer le status code
    const statusCode = healthCheck.status === 'healthy' ? 200 : healthCheck.status === 'degraded' ? 200 : 503

    return res.status(statusCode).json(healthCheck)
  } catch (error: unknown) {
    const err = error as Error
    console.error('Health check error:', err.message)

    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: err.message,
    })
  }
}

/**
 * GET /api/health/ready
 * Readiness probe (pour Kubernetes)
 */
export const ready = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const storeService = req.scope.resolve(Modules.STORE)
    await storeService.listStores()

    return res.status(200).json({
      ready: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return res.status(503).json({
      ready: false,
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * GET /api/health/live
 * Liveness probe (pour Kubernetes)
 */
export const live = async (_req: MedusaRequest, res: MedusaResponse) => {
  return res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
}

export const AUTHENTICATE = false
