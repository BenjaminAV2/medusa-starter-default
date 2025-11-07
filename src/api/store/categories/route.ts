import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * GET /store/categories
 * Liste toutes les catégories publiques
 *
 * Query params:
 * - limit: nombre de catégories à retourner (default: 50)
 * - offset: nombre de catégories à sauter (default: 0)
 * - parent_category_id: filtrer par catégorie parent
 * - handle: filtrer par handle
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const productModuleService: any = req.scope.resolve(Modules.PRODUCT)

    // Construire les filtres
    const filters: any = {
      is_active: true, // Seulement les catégories actives
    }

    // Filtrer par handle si fourni
    if (req.query.handle) {
      filters.handle = req.query.handle
    }

    // Filtrer par catégorie parent si fourni
    if (req.query.parent_category_id) {
      filters.parent_category_id = req.query.parent_category_id
    }

    // Récupérer les catégories
    const categories = await productModuleService.listProductCategories(
      filters,
      {
        relations: ['parent_category'],
        take: req.query.limit ? parseInt(req.query.limit as string) : 50,
        skip: req.query.offset ? parseInt(req.query.offset as string) : 0,
      }
    )

    return res.json({
      categories,
      count: categories.length,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
    })

  } catch (error: any) {
    return res.status(500).json({
      error: error.message
    })
  }
}

export const AUTHENTICATE = false
