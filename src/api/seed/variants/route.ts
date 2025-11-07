import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { Modules } from '@medusajs/framework/utils'
import {
  createProductVariantsWorkflow,
} from '@medusajs/medusa/core-flows'

interface VariantSeedResult {
  success: boolean
  message: string
  data?: {
    totalVariantsCreated: number
    productsProcessed: number
    details: Array<{
      productId: string
      productTitle: string
      variantsCreated: number
    }>
  }
  error?: string
}

/**
 * POST /seed/variants
 * Endpoint pour créer les variantes des 16 produits
 * Chaque produit aura 4 variantes (une par taille)
 *
 * Security: Seulement si ALLOW_SEED=true
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Security check
  if (process.env.ALLOW_SEED !== 'true') {
    return res.status(403).json({
      success: false,
      message: 'Seeding is disabled. Set ALLOW_SEED=true to enable.',
      error: 'Forbidden',
    } as VariantSeedResult)
  }

  const logger = req.scope.resolve('logger')

  try {
    logger.info('🎨 Starting variants seeding for 16 products...')

    const productService = req.scope.resolve(Modules.PRODUCT)

    // Récupérer tous les produits créés par le seed
    const products = await productService.listProducts(
      {
        handle: [
          'sticker-cut-contour-vinyle-blanc',
          'sticker-carre-vinyle-blanc',
          'sticker-rectangle-vinyle-blanc',
          'sticker-rond-vinyle-blanc',
          'sticker-cut-contour-vinyle-transparent',
          'sticker-carre-vinyle-transparent',
          'sticker-rectangle-vinyle-transparent',
          'sticker-rond-vinyle-transparent',
          'sticker-cut-contour-vinyle-holographique',
          'sticker-carre-vinyle-holographique',
          'sticker-rectangle-vinyle-holographique',
          'sticker-rond-vinyle-holographique',
          'sticker-cut-contour-vinyle-miroir',
          'sticker-carre-vinyle-miroir',
          'sticker-rectangle-vinyle-miroir',
          'sticker-rond-vinyle-miroir',
        ],
      },
      {
        relations: ['variants', 'options'],
      }
    )

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No products found. Please run /seed/products first.',
        error: 'Products not found',
      } as VariantSeedResult)
    }

    logger.info(`📦 Found ${products.length} products`)

    // Définir les tailles
    const tailles = [
      { value: '5x5', name: '5×5 cm' },
      { value: '8x8', name: '8×8 cm' },
      { value: '10x10', name: '10×10 cm' },
      { value: '15x15', name: '15×15 cm' },
    ]

    const details: Array<{
      productId: string
      productTitle: string
      variantsCreated: number
    }> = []

    let totalVariantsCreated = 0

    for (const product of products) {
      // Vérifier si le produit a déjà des variantes
      if (product.variants && product.variants.length > 0) {
        logger.info(`⚠️  Product ${product.title} already has ${product.variants.length} variants, skipping...`)
        details.push({
          productId: product.id,
          productTitle: product.title,
          variantsCreated: 0,
        })
        continue
      }

      // Récupérer l'option "Taille" du produit
      const tailleOption = product.options?.find((opt: any) => opt.title === 'Taille')

      if (!tailleOption) {
        logger.warn(`⚠️  Product ${product.title} has no "Taille" option, skipping...`)
        continue
      }

      logger.info(`Creating variants for product: ${product.title}`)

      // Créer une variante pour chaque taille
      const variantsToCreate: any[] = []

      for (const taille of tailles) {
        variantsToCreate.push({
          product_id: product.id,
          title: `${product.title} - ${taille.name}`,
          sku: `${product.handle}-${taille.value}`,
          manage_inventory: false,
          allow_backorder: true,
          options: {
            [tailleOption.title]: taille.value,
          },
        })
      }

      // Créer toutes les variantes pour ce produit
      const { result } = await createProductVariantsWorkflow(req.scope).run({
        input: {
          product_variants: variantsToCreate,
        },
      })

      const variantsCreated = result?.length || 0
      totalVariantsCreated += variantsCreated

      details.push({
        productId: product.id,
        productTitle: product.title,
        variantsCreated,
      })

      logger.info(`✅ Created ${variantsCreated} variants for ${product.title}`)
    }

    logger.info(`✅ Total: ${totalVariantsCreated} variants created for ${products.length} products`)

    const resultData: VariantSeedResult = {
      success: true,
      message: `Successfully created ${totalVariantsCreated} variants for ${products.length} products`,
      data: {
        totalVariantsCreated,
        productsProcessed: products.length,
        details,
      },
    }

    return res.status(201).json(resultData)
  } catch (error: any) {
    logger.error('❌ Error during variants seeding:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Variants seeding failed',
      error: error.message,
    } as VariantSeedResult)
  }
}

export const AUTHENTICATE = false
