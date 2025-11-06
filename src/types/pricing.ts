// Types pour le système de pricing dégressif

export interface PriceTier {
  id: string
  variant_id: string
  min_quantity: number
  unit_price_cents: number
  discount_percentage?: number
  created_at: Date
  updated_at: Date
}

export interface PricingConfig {
  support: 'vinyle-blanc' | 'vinyle-transparent' | 'vinyle-holographique' | 'vinyle-miroir'
  forme: 'rond' | 'carre' | 'rectangle' | 'cut-contour'
  taille: '5x5' | '8x8' | '10x10' | '15x15' | 'custom'
  quantity: number
}

export interface PricingCoefficients {
  support: {
    'vinyle-blanc': number
    'vinyle-transparent': number
    'vinyle-holographique': number
    'vinyle-miroir': number
  }
  forme: {
    rond: number
    carre: number
    rectangle: number
    'cut-contour': number
  }
}

export const PRICING_COEFFICIENTS: PricingCoefficients = {
  support: {
    'vinyle-blanc': 1.0,
    'vinyle-transparent': 1.08,
    'vinyle-holographique': 1.2,
    'vinyle-miroir': 1.15,
  },
  forme: {
    rond: 1.0,
    carre: 1.0,
    rectangle: 1.0,
    'cut-contour': 1.1,
  },
}

export const QUANTITY_DISCOUNTS: Record<number, number> = {
  5: 0,
  10: 0.05,
  25: 0.1,
  50: 0.15,
  100: 0.22,
  250: 0.3,
  500: 0.38,
  1000: 0.45,
}

export const AVAILABLE_QUANTITIES = [5, 10, 25, 50, 100, 250, 500, 1000]

export interface PriceCalculationResult {
  unit_price_cents: number
  total_price_cents: number
  discount_percentage: number
  support_coefficient: number
  forme_coefficient: number
  base_price_cents: number
  quantity: number
}
