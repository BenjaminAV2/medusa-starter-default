import { describe, it, expect } from '@jest/globals'
import { pricingService } from '../../services/pricing'
import type { PricingConfig } from '../../types/pricing'

describe('PricingService', () => {
  describe('calculatePrice', () => {
    it('devrait calculer le prix de base pour 5x5 vinyle-blanc rond', () => {
      const config: PricingConfig = {
        support: 'vinyle-blanc',
        forme: 'rond',
        taille: '5x5',
        quantity: 5,
      }

      const result = pricingService.calculatePrice(config)

      expect(result.base_price_cents).toBe(450)
      expect(result.support_coefficient).toBe(1.0)
      expect(result.forme_coefficient).toBe(1.0)
      expect(result.discount_percentage).toBe(0)
      expect(result.unit_price_cents).toBe(450)
      expect(result.total_price_cents).toBe(2250) // 450 * 5
    })

    it('devrait appliquer le coefficient support holographique', () => {
      const config: PricingConfig = {
        support: 'vinyle-holographique',
        forme: 'rond',
        taille: '5x5',
        quantity: 5,
      }

      const result = pricingService.calculatePrice(config)

      expect(result.support_coefficient).toBe(1.2)
      expect(result.unit_price_cents).toBe(540) // 450 * 1.2 = 540
    })

    it('devrait appliquer le coefficient forme cut-contour', () => {
      const config: PricingConfig = {
        support: 'vinyle-blanc',
        forme: 'cut-contour',
        taille: '5x5',
        quantity: 5,
      }

      const result = pricingService.calculatePrice(config)

      expect(result.forme_coefficient).toBe(1.1)
      expect(result.unit_price_cents).toBe(495) // 450 * 1.1 = 495
    })

    it('devrait appliquer la remise pour 100 unités', () => {
      const config: PricingConfig = {
        support: 'vinyle-blanc',
        forme: 'rond',
        taille: '5x5',
        quantity: 100,
      }

      const result = pricingService.calculatePrice(config)

      expect(result.discount_percentage).toBe(22) // 22% de remise pour 100 unités
      expect(result.unit_price_cents).toBe(351) // 450 * (1 - 0.22) = 351
      expect(result.total_price_cents).toBe(35100) // 351 * 100
    })

    it('devrait appliquer tous les coefficients et remises', () => {
      const config: PricingConfig = {
        support: 'vinyle-holographique', // +20%
        forme: 'cut-contour', // +10%
        taille: '10x10',
        quantity: 250, // -30%
      }

      const result = pricingService.calculatePrice(config)

      // Prix de base 10x10 = 650
      // Avec support: 650 * 1.2 = 780
      // Avec forme: 780 * 1.1 = 858
      // Avec remise: 858 * 0.7 = 600.6 = 601 (arrondi)
      expect(result.base_price_cents).toBe(650)
      expect(result.support_coefficient).toBe(1.2)
      expect(result.forme_coefficient).toBe(1.1)
      expect(result.discount_percentage).toBe(30)
      expect(result.unit_price_cents).toBe(601)
    })
  })

  describe('generatePriceMatrix', () => {
    it('devrait générer une matrice pour toutes les quantités', () => {
      const matrix = pricingService.generatePriceMatrix('vinyle-blanc', 'rond', '5x5')

      expect(matrix).toHaveLength(8) // 8 quantités disponibles
      expect(matrix[0].quantity).toBe(5)
      expect(matrix[7].quantity).toBe(1000)
    })

    it('devrait avoir des prix décroissants par unité', () => {
      const matrix = pricingService.generatePriceMatrix('vinyle-blanc', 'rond', '5x5')

      // Le prix unitaire doit diminuer avec la quantité
      for (let i = 1; i < matrix.length; i++) {
        expect(matrix[i].unit_price_cents).toBeLessThanOrEqual(matrix[i - 1].unit_price_cents)
      }
    })
  })

  describe('isValidQuantity', () => {
    it('devrait valider les quantités standards', () => {
      expect(pricingService.isValidQuantity(5)).toBe(true)
      expect(pricingService.isValidQuantity(100)).toBe(true)
      expect(pricingService.isValidQuantity(1000)).toBe(true)
    })

    it('devrait valider les quantités dans la plage', () => {
      expect(pricingService.isValidQuantity(50)).toBe(true)
      expect(pricingService.isValidQuantity(500)).toBe(true)
    })

    it('devrait rejeter les quantités invalides', () => {
      expect(pricingService.isValidQuantity(1)).toBe(false)
      expect(pricingService.isValidQuantity(2000)).toBe(false)
    })
  })

  describe('getAvailableQuantities', () => {
    it('devrait retourner toutes les quantités disponibles', () => {
      const quantities = pricingService.getAvailableQuantities()

      expect(quantities).toEqual([5, 10, 25, 50, 100, 250, 500, 1000])
    })
  })
})
