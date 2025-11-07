import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { Modules } from '@medusajs/framework/utils'

/**
 * GET /seed/status
 * Check the current state of seeded products
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const productService = req.scope.resolve(Modules.PRODUCT)
    const categoryService = req.scope.resolve(Modules.PRODUCT)

    // Check products
    const products = await productService.listProducts({
      handle: ['sticker-personnalise'],
    })

    // Check categories
    const categories = await categoryService.listProductCategories({
      handle: [
        'stickers-vinyle-blanc',
        'stickers-vinyle-transparent',
        'stickers-vinyle-holographique',
        'stickers-vinyle-miroir',
        'stickers-cut-contour',
      ],
    })

    const productDetails = products.length > 0 ? products[0] : null

    return res.status(200).json({
      success: true,
      data: {
        products: {
          count: products.length,
          details: productDetails
            ? {
                id: productDetails.id,
                title: productDetails.title,
                handle: productDetails.handle,
                status: productDetails.status,
                optionsCount: productDetails.options?.length || 0,
                options: productDetails.options?.map((opt: any) => ({
                  id: opt.id,
                  title: opt.title,
                  valuesCount: opt.values?.length || 0,
                  values: opt.values?.map((v: any) => v.value),
                })),
                metadata: productDetails.metadata,
              }
            : null,
        },
        categories: {
          count: categories.length,
          handles: categories.map((c: any) => c.handle),
        },
      },
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export const AUTHENTICATE = false
