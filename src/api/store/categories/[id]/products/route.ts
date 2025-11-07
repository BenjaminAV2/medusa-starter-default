import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ProductStatus } from "@medusajs/framework/utils"

/**
 * GET /store/categories/:id/products
 * Récupérer tous les produits d'une catégorie
 *
 * Query params:
 * - limit: nombre de produits à retourner (default: 50)
 * - offset: nombre de produits à sauter (default: 0)
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const productModuleService: any = req.scope.resolve(Modules.PRODUCT)
    const categoryId = req.params.id

    // Vérifier que la catégorie existe
    const categories = await productModuleService.listProductCategories({
      id: [categoryId],
      is_active: true,
    })

    if (!categories || categories.length === 0) {
      return res.status(404).json({
        message: "Category not found"
      })
    }

    const category = categories[0]

    // Récupérer les produits de cette catégorie
    const products = await productModuleService.listProducts(
      {
        category_id: [categoryId],
        status: ProductStatus.PUBLISHED, // Seulement les produits publiés
      },
      {
        relations: ['variants', 'options', 'categories', 'images', 'tags'],
        take: req.query.limit ? parseInt(req.query.limit as string) : 50,
        skip: req.query.offset ? parseInt(req.query.offset as string) : 0,
      }
    )

    return res.json({
      category,
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
