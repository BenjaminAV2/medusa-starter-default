/**
 * Script de seed pour créer les produits stickers avec leurs options
 * Usage: yarn medusa exec ./src/scripts/seed-stickers.ts
 */

import { ExecArgs } from '@medusajs/framework/types'
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from '@medusajs/framework/utils'
import {
  createProductsWorkflow,
  createProductCategoriesWorkflow,
} from '@medusajs/medusa/core-flows'

export default async function seedStickers({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info('🎨 Starting sticker products seeding...')

  try {
    // 1. Créer les catégories
    logger.info('📁 Creating categories...')
    const { result: categories } = await createProductCategoriesWorkflow(container).run({
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

    // 2. Créer les produits avec options
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

    // Créer un produit principal "Sticker Personnalisé"
    const { result: products } = await createProductsWorkflow(container).run({
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
            // Options de produit
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
            // Métadonnées pour le pricing
            metadata: {
              pricing_enabled: true,
              requires_artwork: true,
              upload_required: true,
            },
            // Images par défaut (à remplacer par vos vraies images)
            images: [
              {
                url: 'https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png',
              },
            ],
            // Catégorie
            category_ids: [categories[0].id],
          },
        ],
      },
    })

    logger.info(`✅ Created ${products.length} products`)

    // 3. Log des informations importantes
    const product = products[0]
    logger.info('\n📦 Product created successfully:')
    logger.info(`   ID: ${product.id}`)
    logger.info(`   Title: ${product.title}`)
    logger.info(`   Handle: ${product.handle}`)
    logger.info(`   Options: ${product.options?.length || 0}`)

    if (product.options) {
      product.options.forEach((option: any) => {
        logger.info(`   - ${option.title}: ${option.values?.length || 0} values`)
      })
    }

    logger.info('\n💡 Next steps:')
    logger.info('   1. Les prix sont calculés dynamiquement via l\'API /api/pricing')
    logger.info('   2. Les variants ne sont pas pré-créés (trop nombreux: 4×4×4 = 64)')
    logger.info('   3. Les variants seront créés à la volée lors de l\'ajout au panier')
    logger.info('   4. Uploadez vos propres images dans le dashboard Medusa')

    logger.info('\n✨ Seeding completed successfully!')
  } catch (error: any) {
    logger.error('❌ Error during seeding:', error.message)
    throw error
  }
}
