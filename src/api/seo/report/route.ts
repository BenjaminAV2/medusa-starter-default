import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { seoAgent } from '../../../services/seo-agent'

/**
 * GET /api/seo/report
 * Génère un rapport SEO complet avec recommandations
 */
export const GET = async (_req: MedusaRequest, res: MedusaResponse) => {
  try {
    const report = seoAgent.generateSEOReport()

    return res.json({
      success: true,
      data: {
        ...report,
        generated_at: new Date().toISOString(),
        insights: {
          best_categories: report.metrics
            .sort((a, b) => b.seoScore - a.seoScore)
            .slice(0, 5)
            .map((m) => ({
              name: m.categoryName,
              score: m.seoScore,
              traffic_potential: m.estimatedTraffic,
            })),
          top_recommendations: report.recommendations
            .filter((r) => r.priority === 'critical' || r.priority === 'high')
            .slice(0, 10),
        },
      },
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('SEO report error:', err.message)

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la génération du rapport SEO',
    })
  }
}

export const AUTHENTICATE = false
