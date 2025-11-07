import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ProductStatus } from "@medusajs/framework/utils"

/**
 * GET /store/products/:id
 * Récupérer les détails d'un produit public
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    const productModuleService: any = req.scope.resolve(Modules.PRODUCT)
    const productId = req.params.id

    // Récupérer le produit avec toutes ses relations
    const products = await productModuleService.listProducts(
      {
        id: [productId],
        status: ProductStatus.PUBLISHED, // Seulement les produits publiés
      },
      {
        relations: ['variants', 'options', 'categories', 'images', 'tags'],
      }
    )

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      })
    }

    return res.json({
      product: products[0]
    })

  } catch (error: any) {
    return res.status(500).json({
      error: error.message
    })
  }
}

export const AUTHENTICATE = false
