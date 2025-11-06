/**
 * Agent SEO pour optimiser la structure de catégories et produits
 * Prend en compte le SEO, l'UX et le taux de conversion
 */

export interface SEOCategoryStructure {
  name: string
  handle: string
  description: string
  seoTitle: string
  seoDescription: string
  keywords: string[]
  parent?: string
  level: number
  priority: 'high' | 'medium' | 'low'
  conversionPotential: number // 0-100
  searchVolume: 'high' | 'medium' | 'low'
  competition: 'high' | 'medium' | 'low'
  children?: SEOCategoryStructure[]
}

export interface SEORecommendation {
  category: string
  recommendations: string[]
  priority: 'critical' | 'high' | 'medium' | 'low'
  impact: string
}

export interface CategoryMetrics {
  categoryName: string
  estimatedTraffic: number
  competitionLevel: number
  conversionScore: number
  seoScore: number
}

class SEOAgent {
  /**
   * Génère la structure de catégories optimale pour l'e-commerce de stickers
   * Basé sur les meilleures pratiques SEO et conversion
   */
  generateOptimalStructure(): SEOCategoryStructure[] {
    const structure: SEOCategoryStructure[] = [
      // Niveau 1: Catégories principales (par matière)
      {
        name: 'Stickers Vinyle',
        handle: 'stickers-vinyle',
        description:
          'Découvrez notre gamme complète de stickers en vinyle personnalisables. Qualité professionnelle, résistants et imperméables.',
        seoTitle: 'Stickers Vinyle Personnalisés | Impression Pro & Livraison Rapide',
        seoDescription:
          'Créez vos stickers vinyle sur mesure. Vinyle blanc, transparent, holographique ou miroir. À partir de 5 unités. Livraison rapide. Qualité garantie.',
        keywords: [
          'stickers vinyle',
          'stickers personnalisés',
          'autocollants vinyle',
          'impression stickers',
        ],
        level: 1,
        priority: 'high',
        conversionPotential: 95,
        searchVolume: 'high',
        competition: 'medium',
        children: [
          // Niveau 2: Par type de vinyle
          {
            name: 'Stickers Vinyle Blanc',
            handle: 'stickers-vinyle-blanc',
            description:
              'Stickers en vinyle blanc mat. Parfaits pour tous vos designs. Impression haute qualité, résistants à l\'eau et aux UV.',
            seoTitle: 'Stickers Vinyle Blanc Mat | Personnalisés & Résistants',
            seoDescription:
              'Commandez vos stickers vinyle blanc personnalisés. Finition mat professionnelle. Résistants eau & UV. À partir de 4,50€. Livraison express.',
            keywords: [
              'sticker vinyle blanc',
              'autocollant blanc',
              'sticker mat',
              'vinyle blanc mat',
            ],
            level: 2,
            priority: 'high',
            conversionPotential: 92,
            searchVolume: 'high',
            competition: 'medium',
          },
          {
            name: 'Stickers Vinyle Transparent',
            handle: 'stickers-vinyle-transparent',
            description:
              'Stickers transparents pour un effet discret et élégant. Idéaux pour vitres, fenêtres et surfaces vitrées.',
            seoTitle: 'Stickers Transparents Personnalisés | Vinyle Transparent',
            seoDescription:
              'Stickers vinyle transparent sur mesure. Effet vitrage élégant. Parfait pour vitres & fenêtres. Résistant UV. Dès 4,86€.',
            keywords: [
              'sticker transparent',
              'autocollant transparent',
              'sticker vitrage',
              'vinyle transparent',
            ],
            level: 2,
            priority: 'high',
            conversionPotential: 88,
            searchVolume: 'medium',
            competition: 'low',
          },
          {
            name: 'Stickers Vinyle Holographique',
            handle: 'stickers-vinyle-holographique',
            description:
              'Stickers holographiques aux reflets arc-en-ciel. Effet premium qui capte la lumière. Idéal pour se démarquer.',
            seoTitle: 'Stickers Holographiques | Effet Arc-en-Ciel Premium',
            seoDescription:
              'Stickers holographiques personnalisés. Reflets arc-en-ciel irisés. Effet premium unique. Parfait pour packaging & branding. Dès 5,40€.',
            keywords: [
              'sticker holographique',
              'autocollant holographique',
              'sticker irisé',
              'sticker arc-en-ciel',
            ],
            level: 2,
            priority: 'high',
            conversionPotential: 85,
            searchVolume: 'medium',
            competition: 'low',
          },
          {
            name: 'Stickers Vinyle Miroir',
            handle: 'stickers-vinyle-miroir',
            description:
              'Stickers effet miroir chromé. Finition premium réfléchissante. Parfait pour un branding haut de gamme.',
            seoTitle: 'Stickers Effet Miroir | Vinyle Chromé Premium',
            seoDescription:
              'Stickers vinyle effet miroir personnalisés. Finition chromée réfléchissante. Look premium & moderne. Idéal packaging luxe. Dès 5,18€.',
            keywords: [
              'sticker miroir',
              'autocollant chromé',
              'sticker effet miroir',
              'vinyle miroir',
            ],
            level: 2,
            priority: 'medium',
            conversionPotential: 82,
            searchVolume: 'low',
            competition: 'low',
          },
        ],
      },

      // Catégorie par forme (pour le SEO)
      {
        name: 'Stickers par Forme',
        handle: 'stickers-par-forme',
        description:
          'Choisissez la forme parfaite pour vos stickers : ronds, carrés, rectangles ou découpe sur-mesure.',
        seoTitle: 'Stickers Toutes Formes | Rond, Carré, Rectangle, Sur-mesure',
        seoDescription:
          'Stickers personnalisés toutes formes. Ronds, carrés, rectangles ou découpe sur-mesure selon votre design. Impression pro.',
        keywords: ['sticker rond', 'sticker carré', 'sticker rectangulaire', 'découpe sur-mesure'],
        level: 1,
        priority: 'medium',
        conversionPotential: 78,
        searchVolume: 'medium',
        competition: 'medium',
        children: [
          {
            name: 'Stickers Ronds',
            handle: 'stickers-ronds',
            description:
              'Stickers ronds personnalisés. Format classique et polyvalent. Toutes tailles disponibles.',
            seoTitle: 'Stickers Ronds Personnalisés | Toutes Tailles',
            seoDescription:
              'Commandez vos stickers ronds sur mesure. Format classique indémodable. De 5 à 15 cm. Vinyle qualité pro. Dès 4,50€.',
            keywords: ['sticker rond', 'autocollant rond', 'sticker circulaire'],
            level: 2,
            priority: 'medium',
            conversionPotential: 80,
            searchVolume: 'medium',
            competition: 'medium',
          },
          {
            name: 'Stickers Découpés à la Forme',
            handle: 'stickers-decoupe-forme',
            description:
              'Stickers découpés suivant exactement votre design. Découpe de contour précise au laser.',
            seoTitle: 'Stickers Découpe Forme | Contour Sur-Mesure',
            seoDescription:
              'Stickers découpés à la forme de votre design. Découpe laser précise. Contour parfait. Idéal logos & illustrations. +10%.',
            keywords: [
              'sticker découpe forme',
              'découpe contour',
              'sticker forme personnalisée',
              'kiss cut',
            ],
            level: 2,
            priority: 'high',
            conversionPotential: 90,
            searchVolume: 'medium',
            competition: 'low',
          },
        ],
      },

      // Catégorie par usage (longue traîne SEO)
      {
        name: 'Stickers par Usage',
        handle: 'stickers-par-usage',
        description:
          'Trouvez les stickers parfaits selon votre usage : packaging, branding, événements, décoration.',
        seoTitle: 'Stickers Professionnels par Usage | Packaging, Branding, Événements',
        seoDescription:
          'Stickers adaptés à chaque usage professionnel. Packaging produits, branding entreprise, événements, décoration. Qualité pro.',
        keywords: [
          'stickers packaging',
          'stickers branding',
          'stickers événements',
          'stickers entreprise',
        ],
        level: 1,
        priority: 'high',
        conversionPotential: 88,
        searchVolume: 'high',
        competition: 'low',
        children: [
          {
            name: 'Stickers pour Packaging',
            handle: 'stickers-packaging',
            description:
              'Stickers professionnels pour embellir vos emballages produits. Parfait pour e-commerce et marques.',
            seoTitle: 'Stickers Packaging Produits | Personnalisés pour E-commerce',
            seoDescription:
              'Stickers pro pour packaging e-commerce. Valorisez vos colis & produits. Impression premium. Fidélisez vos clients. Dès 4,50€.',
            keywords: [
              'sticker packaging',
              'autocollant emballage',
              'sticker colis',
              'sticker produit',
            ],
            level: 2,
            priority: 'high',
            conversionPotential: 95,
            searchVolume: 'high',
            competition: 'low',
          },
          {
            name: 'Stickers Logo Entreprise',
            handle: 'stickers-logo-entreprise',
            description:
              'Stickers avec votre logo pour le branding et la visibilité de votre entreprise.',
            seoTitle: 'Stickers Logo Entreprise | Branding Professionnel',
            seoDescription:
              'Stickers logo personnalisés pour votre entreprise. Renforcez votre image de marque. Qualité pro. Livraison rapide. Devis gratuit.',
            keywords: [
              'sticker logo',
              'autocollant logo entreprise',
              'sticker branding',
              'goodies entreprise',
            ],
            level: 2,
            priority: 'high',
            conversionPotential: 92,
            searchVolume: 'high',
            competition: 'medium',
          },
        ],
      },

      // Catégorie par quantité (conversion)
      {
        name: 'Stickers en Gros',
        handle: 'stickers-en-gros',
        description:
          'Commandez vos stickers en grande quantité avec des remises dégressives jusqu\'à -45%. Idéal professionnels.',
        seoTitle: 'Stickers en Gros | Remises jusqu\'à -45% | Pro',
        seoDescription:
          'Stickers en gros avec remises dégressives. De 100 à 1000 unités. Jusqu\'à -45% de réduction. Qualité pro. Devis rapide.',
        keywords: ['stickers en gros', 'stickers quantité', 'stickers professionnels', 'grossiste'],
        level: 1,
        priority: 'high',
        conversionPotential: 85,
        searchVolume: 'medium',
        competition: 'medium',
      },
    ]

    return structure
  }

  /**
   * Analyse une catégorie et donne des recommandations SEO
   */
  analyzeCategory(category: SEOCategoryStructure): SEORecommendation[] {
    const recommendations: SEORecommendation[] = []

    // 1. Analyse du titre
    if (category.seoTitle.length > 60) {
      recommendations.push({
        category: category.name,
        recommendations: [
          `Titre SEO trop long (${category.seoTitle.length} caractères). Idéal: 50-60 caractères.`,
        ],
        priority: 'medium',
        impact: 'Peut réduire le CTR dans les résultats de recherche',
      })
    }

    // 2. Analyse de la description
    if (category.seoDescription.length > 160) {
      recommendations.push({
        category: category.name,
        recommendations: [
          `Meta description trop longue (${category.seoDescription.length} caractères). Idéal: 120-160 caractères.`,
        ],
        priority: 'medium',
        impact: 'Sera tronquée dans les résultats Google',
      })
    }

    // 3. Analyse des mots-clés
    if (category.keywords.length < 3) {
      recommendations.push({
        category: category.name,
        recommendations: [
          'Ajouter plus de mots-clés (minimum 3-5) pour élargir la couverture SEO',
        ],
        priority: 'high',
        impact: 'Perd des opportunités de trafic organique',
      })
    }

    // 4. Analyse du potentiel de conversion
    if (category.conversionPotential < 80) {
      recommendations.push({
        category: category.name,
        recommendations: [
          'Optimiser le contenu pour améliorer les conversions',
          'Ajouter des éléments de réassurance (qualité, livraison, garantie)',
          'Inclure des CTA clairs et visibles',
        ],
        priority: 'high',
        impact: `Potentiel de conversion actuel: ${category.conversionPotential}%`,
      })
    }

    // 5. Analyse de la compétition
    if (category.competition === 'high' && category.searchVolume === 'high') {
      recommendations.push({
        category: category.name,
        recommendations: [
          'Haute compétition + haut volume = focus sur la longue traîne',
          'Créer des sous-catégories plus spécifiques',
          'Développer du contenu unique et approfondi',
        ],
        priority: 'critical',
        impact: 'Risque de faible visibilité sans différenciation',
      })
    }

    return recommendations
  }

  /**
   * Calcule les métriques de performance d'une catégorie
   */
  calculateMetrics(category: SEOCategoryStructure): CategoryMetrics {
    // Formules simplifiées pour l'exemple
    const volumeScore = category.searchVolume === 'high' ? 100 : category.searchVolume === 'medium' ? 60 : 30
    const competitionScore =
      category.competition === 'low' ? 90 : category.competition === 'medium' ? 60 : 30

    return {
      categoryName: category.name,
      estimatedTraffic: Math.round(volumeScore * (1 - competitionScore / 100) * 100),
      competitionLevel: competitionScore,
      conversionScore: category.conversionPotential,
      seoScore: Math.round(
        (volumeScore * 0.3 + competitionScore * 0.3 + category.conversionPotential * 0.4)
      ),
    }
  }

  /**
   * Génère un rapport SEO complet
   */
  generateSEOReport(): {
    structure: SEOCategoryStructure[]
    recommendations: SEORecommendation[]
    metrics: CategoryMetrics[]
    summary: {
      totalCategories: number
      highPriorityCategories: number
      averageConversionPotential: number
      criticalIssues: number
    }
  } {
    const structure = this.generateOptimalStructure()
    const allCategories = this.flattenStructure(structure)

    const recommendations = allCategories.flatMap((cat) => this.analyzeCategory(cat))
    const metrics = allCategories.map((cat) => this.calculateMetrics(cat))

    return {
      structure,
      recommendations,
      metrics,
      summary: {
        totalCategories: allCategories.length,
        highPriorityCategories: allCategories.filter((c) => c.priority === 'high').length,
        averageConversionPotential:
          allCategories.reduce((sum, c) => sum + c.conversionPotential, 0) / allCategories.length,
        criticalIssues: recommendations.filter((r) => r.priority === 'critical').length,
      },
    }
  }

  /**
   * Aplatit la structure hiérarchique en liste
   */
  private flattenStructure(structure: SEOCategoryStructure[]): SEOCategoryStructure[] {
    const result: SEOCategoryStructure[] = []

    const flatten = (categories: SEOCategoryStructure[]) => {
      categories.forEach((cat) => {
        result.push(cat)
        if (cat.children) {
          flatten(cat.children)
        }
      })
    }

    flatten(structure)
    return result
  }
}

export const seoAgent = new SEOAgent()
