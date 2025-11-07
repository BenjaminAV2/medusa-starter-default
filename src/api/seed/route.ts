import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from '@medusajs/framework/utils'
import {
  createProductsWorkflow,
  createProductCategoriesWorkflow,
} from '@medusajs/medusa/core-flows'

interface SeedResult {
  success: boolean
  message: string
  data?: {
    categoriesCreated: number
    productsCreated: number
    productDetails?: {
      id: string
      title: string
      handle: string
      optionsCount: number
    }
  }
  error?: string
}

/**
 * POST /seed
 * Endpoint to seed the database with sticker products
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
    } as SeedResult)
  }

  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    logger.info('🎨 Starting sticker products seeding...')

    // 1. Check if products already exist
    const productService = req.scope.resolve(Modules.PRODUCT)
    const existingProducts = await productService.listProducts({
      handle: ['sticker-personnalise'],
    })

    if (existingProducts.length > 0) {
      logger.info('Products already exist, skipping seed')
      return res.status(200).json({
        success: true,
        message: 'Products already exist in database',
        data: {
          categoriesCreated: 0,
          productsCreated: 0,
          productDetails: {
            id: existingProducts[0].id,
            title: existingProducts[0].title,
            handle: existingProducts[0].handle || '',
            optionsCount: existingProducts[0].options?.length || 0,
          },
        },
      } as SeedResult)
    }

    // 2. Create categories
    logger.info('📁 Creating categories...')
    const { result: categories } = await createProductCategoriesWorkflow(req.scope).run({
      input: {
        product_categories: [
          {
            name: 'Stickers Vinyle Blanc',
            handle: 'stickers-vinyle-blanc',
            is_active: true,
            description: 'Stickers en vinyle blanc mat, parfaits pour tous vos projets',
          },
          {
            name: 'Stickers Vinyle Transparent',
            handle: 'stickers-vinyle-transparent',
            is_active: true,
            description: 'Stickers transparents pour un effet discret et élégant',
          },
          {
            name: 'Stickers Vinyle Holographique',
            handle: 'stickers-vinyle-holographique',
            is_active: true,
            description: 'Stickers holographiques aux reflets arc-en-ciel',
          },
          {
            name: 'Stickers Vinyle Miroir',
            handle: 'stickers-vinyle-miroir',
            is_active: true,
            description: 'Stickers effet miroir pour un rendu premium',
          },
          {
            name: 'Stickers Cut-Contour',
            handle: 'stickers-cut-contour',
            is_active: true,
            description: 'Stickers découpés suivant votre design exact',
          },
        ],
      },
    })

    logger.info(`✅ Created ${categories.length} categories`)

    // 3. Create products with options
    logger.info('🏷️  Creating products with options...')

    const supports = [
      { value: 'vinyle-blanc', name: 'Vinyle Blanc' },
      { value: 'vinyle-transparent', name: 'Vinyle Transparent' },
      { value: 'vinyle-holographique', name: 'Vinyle Holographique' },
      { value: 'vinyle-miroir', name: 'Vinyle Miroir' },
    ]

    const formes = [
      { value: 'rond', name: 'Rond' },
      { value: 'carre', name: 'Carré' },
      { value: 'rectangle', name: 'Rectangle' },
      { value: 'cut-contour', name: 'Découpe sur-mesure' },
    ]

    const tailles = [
      { value: '5x5', name: '5×5 cm', description: 'Petit format' },
      { value: '8x8', name: '8×8 cm', description: 'Format moyen' },
      { value: '10x10', name: '10×10 cm', description: 'Format standard' },
      { value: '15x15', name: '15×15 cm', description: 'Grand format' },
    ]

    const { result: products } = await createProductsWorkflow(req.scope).run({
      input: {
        products: [
          {
            title: 'Sticker Personnalisé',
            handle: 'sticker-personnalise',
            subtitle: 'Créez votre sticker unique',
            description: `
# Stickers personnalisés de qualité professionnelle

Créez vos propres stickers avec votre design ! Choisissez parmi nos différentes options :

## Matières disponibles
- **Vinyle Blanc** : Mat, opaque, parfait pour tous les designs
- **Vinyle Transparent** : Effet discret, laisse transparaître le support
- **Vinyle Holographique** : Reflets arc-en-ciel pour un effet premium
- **Vinyle Miroir** : Effet miroir chromé

## Formes
- **Rond** : Classique et polyvalent
- **Carré** : Format standard
- **Rectangle** : Idéal pour les logos
- **Découpe sur-mesure** : Suivez exactement votre design

## Tailles
- 5×5 cm à 15×15 cm
- Remises dégressives selon la quantité

## Qualité professionnelle
- Impression haute définition
- Vinyle de qualité supérieure
- Résistant à l'eau et aux UV
- Adhésif permanent
            `.trim(),
            status: ProductStatus.PUBLISHED,
            is_giftcard: false,
            discountable: true,
            options: [
              {
                title: 'Support',
                values: supports.map((s) => s.value),
              },
              {
                title: 'Forme',
                values: formes.map((f) => f.value),
              },
              {
                title: 'Taille',
                values: tailles.map((t) => t.value),
              },
            ],
            metadata: {
              pricing_enabled: true,
              requires_artwork: true,
              upload_required: true,
            },
            images: [
              {
                url: 'https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png',
              },
            ],
            category_ids: [categories[0].id],
          },
        ],
      },
    })

    logger.info(`✅ Created ${products.length} products`)

    const product = products[0]
    const result: SeedResult = {
      success: true,
      message: 'Database seeded successfully',
      data: {
        categoriesCreated: categories.length,
        productsCreated: products.length,
        productDetails: {
          id: product.id,
          title: product.title,
          handle: product.handle || '',
          optionsCount: product.options?.length || 0,
        },
      },
    }

    logger.info('✨ Seeding completed successfully!')
    return res.status(201).json(result)
  } catch (error: any) {
    logger.error('❌ Error during seeding:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Seeding failed',
      error: error.message,
    } as SeedResult)
  }
}

export const AUTHENTICATE = false
