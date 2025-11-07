import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import {
  ContainerRegistrationKeys,
  Modules,
} from '@medusajs/framework/utils'
import {
  deleteProductsWorkflow,
  deleteProductCategoriesWorkflow,
} from '@medusajs/medusa/core-flows'

/**
 * POST /seed/reset
 * Delete all seeded products and categories to allow fresh seeding
 *
 * Security: Only works if ALLOW_SEED environment variable is set to 'true'
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Security check
  if (process.env.ALLOW_SEED !== 'true') {
    return res.status(403).json({
      success: false,
      message: 'Seeding is disabled. Set ALLOW_SEED=true to enable.',
      error: 'Forbidden',
    })
  }

  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    logger.info('🗑️  Starting database reset...')

    const productService = req.scope.resolve(Modules.PRODUCT)

    // 1. Find and delete products
    const products = await productService.listProducts({
      handle: ['sticker-personnalise'],
    })

    let productsDeleted = 0
    if (products.length > 0) {
      logger.info(`Found ${products.length} products to delete`)
      for (const product of products) {
        await deleteProductsWorkflow(req.scope).run({
          input: { ids: [product.id] },
        })
        productsDeleted++
        logger.info(`Deleted product: ${product.id}`)
      }
    }

    // 2. Find and delete categories
    const categories = await productService.listProductCategories({
      handle: [
        'stickers-vinyle-blanc',
        'stickers-vinyle-transparent',
        'stickers-vinyle-holographique',
        'stickers-vinyle-miroir',
        'stickers-cut-contour',
      ],
    })

    let categoriesDeleted = 0
    if (categories.length > 0) {
      logger.info(`Found ${categories.length} categories to delete`)
      for (const category of categories) {
        await deleteProductCategoriesWorkflow(req.scope).run({
          input: { ids: [category.id] },
        })
        categoriesDeleted++
        logger.info(`Deleted category: ${category.id}`)
      }
    }

    logger.info('✅ Database reset completed')

    return res.status(200).json({
      success: true,
      message: 'Database reset successfully',
      data: {
        productsDeleted,
        categoriesDeleted,
      },
    })
  } catch (error: any) {
    logger.error('❌ Error during reset:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Reset failed',
      error: error.message,
    })
  }
}

export const AUTHENTICATE = false
