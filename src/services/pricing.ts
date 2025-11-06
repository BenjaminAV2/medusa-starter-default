import {
  PricingConfig,
  PriceCalculationResult,
  PRICING_COEFFICIENTS,
  QUANTITY_DISCOUNTS,
  AVAILABLE_QUANTITIES,
} from '../types/pricing'

export class PricingService {
  // Prix de base par taille (en centimes)
  private basePrices: Record<string, number> = {
    '5x5': 450, // 4.50 EUR
    '8x8': 550, // 5.50 EUR
    '10x10': 650, // 6.50 EUR
    '15x15': 900, // 9.00 EUR
  }

  /**
   * Calcule le prix final basé sur la configuration
   */
  calculatePrice(config: PricingConfig): PriceCalculationResult {
    // 1. Prix de base selon la taille
    const basePrice = this.basePrices[config.taille] || this.basePrices['5x5']

    // 2. Appliquer le coefficient support
    const supportCoeff = PRICING_COEFFICIENTS.support[config.support] || 1.0

    // 3. Appliquer le coefficient forme
    const formeCoeff = PRICING_COEFFICIENTS.forme[config.forme] || 1.0

    // 4. Calculer le prix après coefficients
    const priceWithCoefficients = Math.round(basePrice * supportCoeff * formeCoeff)

    // 5. Obtenir la remise quantité (trouver le tier le plus proche)
    const discount = this.getQuantityDiscount(config.quantity)

    // 6. Prix unitaire final
    const unitPrice = Math.round(priceWithCoefficients * (1 - discount))

    // 7. Prix total
    const totalPrice = unitPrice * config.quantity

    return {
      base_price_cents: basePrice,
      support_coefficient: supportCoeff,
      forme_coefficient: formeCoeff,
      discount_percentage: discount * 100,
      unit_price_cents: unitPrice,
      total_price_cents: totalPrice,
      quantity: config.quantity,
    }
  }

  /**
   * Obtient la remise pour une quantité donnée
   */
  private getQuantityDiscount(quantity: number): number {
    // Trouve le tier de quantité le plus élevé qui est <= à la quantité demandée
    const sortedQuantities = [...AVAILABLE_QUANTITIES].sort((a, b) => b - a)

    for (const tier of sortedQuantities) {
      if (quantity >= tier) {
        return QUANTITY_DISCOUNTS[tier] || 0
      }
    }

    return 0
  }

  /**
   * Génère une matrice de prix pour toutes les quantités disponibles
   */
  generatePriceMatrix(
    support: PricingConfig['support'],
    forme: PricingConfig['forme'],
    taille: PricingConfig['taille']
  ): Array<PriceCalculationResult> {
    return AVAILABLE_QUANTITIES.map((qty) =>
      this.calculatePrice({
        support,
        forme,
        taille,
        quantity: qty,
      })
    )
  }

  /**
   * Valide qu'une quantité est disponible
   */
  isValidQuantity(quantity: number): boolean {
    return AVAILABLE_QUANTITIES.includes(quantity) || (quantity >= 5 && quantity <= 1000)
  }

  /**
   * Obtient les quantités disponibles
   */
  getAvailableQuantities(): number[] {
    return [...AVAILABLE_QUANTITIES]
  }
}

// Export singleton instance
export const pricingService = new PricingService()
