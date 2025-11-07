import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ProductStatus } from "@medusajs/framework/utils"

/**
 * GET /store/products
 * Liste tous les produits publics (sans authentification)
 *
 * Query params:
 * - limit: nombre de produits à retourner (default: 50)
 * - offset: nombre de produits à sauter (default: 0)
 * - handle: filtrer par handle
 * - category_id: filtrer par catégorie
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const productModuleService: any = req.scope.resolve(Modules.PRODUCT)

    // Construire les filtres
    const filters: any = {
      status: ProductStatus.PUBLISHED, // Seulement les produits publiés
    }

    // Filtrer par handle si fourni
    if (req.query.handle) {
      filters.handle = req.query.handle
    }

    // Filtrer par catégorie si fourni
    if (req.query.category_id) {
      filters.category_id = req.query.category_id
    }

    // Récupérer les produits avec leurs relations
    const products = await productModuleService.listProducts(
      filters,
      {
        relations: ['variants', 'options', 'categories', 'images', 'tags'],
        take: req.query.limit ? parseInt(req.query.limit as string) : 50,
        skip: req.query.offset ? parseInt(req.query.offset as string) : 0,
      }
    )

    return res.json({
      products,
      count: products.length,
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
