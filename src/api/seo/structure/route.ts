import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { seoAgent } from '../../../services/seo-agent'

/**
 * GET /api/seo/structure
 * Retourne la structure de catégories optimale pour le SEO
 */
export const GET = async (_req: MedusaRequest, res: MedusaResponse) => {
  try {
    const structure = seoAgent.generateOptimalStructure()

    return res.json({
      success: true,
      data: {
        structure,
        metadata: {
          total_categories: structure.reduce((sum, cat) => {
            return sum + 1 + (cat.children?.length || 0)
          }, 0),
          high_priority: structure.filter((c) => c.priority === 'high').length,
          generated_at: new Date().toISOString(),
        },
        implementation_guide: {
          step1: 'Utiliser le script seed-stickers.ts pour créer les catégories',
          step2: 'Ajouter les images et contenus enrichis via le dashboard',
          step3: 'Configurer les URLs canoniques et les redirections',
          step4: 'Soumettre le sitemap à Google Search Console',
          step5: 'Monitorer les performances avec Google Analytics',
        },
      },
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('SEO structure error:', err.message)

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Erreur lors de la génération de la structure SEO',
    })
  }
}

export const AUTHENTICATE = false
