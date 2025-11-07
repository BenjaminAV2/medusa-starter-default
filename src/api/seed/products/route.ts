import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from '@medusajs/framework/utils'
import {
  createProductsWorkflow,
} from '@medusajs/medusa/core-flows'

interface ProductSeedResult {
  success: boolean
  message: string
  data?: {
    productsCreated: number
    productsList: Array<{
      id: string
      title: string
      handle: string
    }>
  }
  error?: string
}

/**
 * POST /seed/products
 * Endpoint pour créer les 16 produits séparés (Support × Forme)
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
    } as ProductSeedResult)
  }

  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    logger.info('🎨 Starting 16 products seeding...')

    const productService = req.scope.resolve(Modules.PRODUCT)

    // Définir les supports et formes
    const supports = [
      { value: 'vinyle-blanc', name: 'Vinyle Blanc', color: '#FFFFFF' },
      { value: 'vinyle-transparent', name: 'Vinyle Transparent', color: 'transparent' },
      { value: 'vinyle-holographique', name: 'Vinyle Holographique', color: 'rainbow' },
      { value: 'vinyle-miroir', name: 'Vinyle Miroir', color: '#C0C0C0' },
    ]

    const formes = [
      { value: 'cut-contour', name: 'Cut Contour', description: 'Découpe sur-mesure suivant votre design' },
      { value: 'carre', name: 'Carré', description: 'Format carré classique' },
      { value: 'rectangle', name: 'Rectangle', description: 'Format rectangle, idéal pour logos' },
      { value: 'rond', name: 'Rond', description: 'Format rond polyvalent' },
    ]

    const tailles = [
      { value: '5x5', name: '5×5 cm', description: 'Petit format' },
      { value: '8x8', name: '8×8 cm', description: 'Format moyen' },
      { value: '10x10', name: '10×10 cm', description: 'Format standard' },
      { value: '15x15', name: '15×15 cm', description: 'Grand format' },
    ]

    // Récupérer les catégories existantes
    const categories = await productService.listProductCategories({
      handle: [
        'stickers-vinyle-blanc',
        'stickers-vinyle-transparent',
        'stickers-vinyle-holographique',
        'stickers-vinyle-miroir',
        'stickers-cut-contour',
      ],
    })

    const categoryMap: Record<string, string> = {}
    categories.forEach((cat: any) => {
      categoryMap[cat.handle] = cat.id
    })

    // Générer les 16 produits
    const productsToCreate: any[] = []

    for (const support of supports) {
      for (const forme of formes) {
        const title = `Sticker ${forme.name} ${support.name}`
        const handle = `sticker-${forme.value}-${support.value}`

        // Déterminer la catégorie principale
        let categoryId = categoryMap[`stickers-vinyle-${support.value}`]
        if (forme.value === 'cut-contour') {
          categoryId = categoryMap['stickers-cut-contour']
        }

        const description = `
# ${title}

Stickers professionnels en **${support.name}** avec forme **${forme.name}**.

## Caractéristiques
- **Matière**: ${support.name} - ${forme.value === 'cut-contour' ? 'Découpe précise suivant votre design' : forme.description}
- **Forme**: ${forme.description}
- **Tailles disponibles**: de 5×5 cm à 15×15 cm
- **Qualité professionnelle**: Impression haute définition
- **Résistant**: À l'eau et aux UV
- **Adhésif**: Permanent de qualité supérieure

## Utilisations
Parfait pour la personnalisation de produits, packaging, décoration, événements, et bien plus encore.

## Personnalisation
Uploadez votre design et nous créerons vos stickers sur-mesure en ${support.name}.
        `.trim()

        productsToCreate.push({
          title,
          handle,
          subtitle: `Stickers ${forme.name.toLowerCase()} en ${support.name.toLowerCase()}`,
          description,
          status: ProductStatus.PUBLISHED,
          is_giftcard: false,
          discountable: true,
          options: [
            {
              title: 'Taille',
              values: tailles.map((t) => t.value),
            },
          ],
          metadata: {
            support: support.value,
            support_name: support.name,
            forme: forme.value,
            forme_name: forme.name,
            pricing_enabled: true,
            requires_artwork: true,
            upload_required: true,
            color: support.color,
          },
          images: [
            {
              url: 'https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png',
            },
          ],
          category_ids: categoryId ? [categoryId] : [],
        })
      }
    }

    logger.info(`📦 Creating ${productsToCreate.length} products...`)

    // Vérifier si les produits existent déjà
    const existingHandles = productsToCreate.map(p => p.handle)
    const existingProducts = await productService.listProducts({
      handle: existingHandles,
    })

    if (existingProducts.length > 0) {
      logger.info(`⚠️  ${existingProducts.length} products already exist`)
      return res.status(200).json({
        success: true,
        message: `${existingProducts.length} products already exist in database`,
        data: {
          productsCreated: 0,
          productsList: existingProducts.map((p: any) => ({
            id: p.id,
            title: p.title,
            handle: p.handle,
          })),
        },
      } as ProductSeedResult)
    }

    // Créer tous les produits
    const { result: createdProducts } = await createProductsWorkflow(req.scope).run({
      input: {
        products: productsToCreate,
      },
    })

    logger.info(`✅ Created ${createdProducts.length} products successfully!`)

    const result: ProductSeedResult = {
      success: true,
      message: `Successfully created ${createdProducts.length} products`,
      data: {
        productsCreated: createdProducts.length,
        productsList: createdProducts.map((p: any) => ({
          id: p.id,
          title: p.title,
          handle: p.handle,
        })),
      },
    }

    return res.status(201).json(result)
  } catch (error: any) {
    logger.error('❌ Error during products seeding:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Products seeding failed',
      error: error.message,
    } as ProductSeedResult)
  }
}

export const AUTHENTICATE = false
