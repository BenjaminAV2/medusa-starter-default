import { z } from 'zod'

export const supportTypes = ['vinyle-blanc', 'vinyle-transparent', 'vinyle-holographique', 'vinyle-miroir'] as const
export const formeTypes = ['rond', 'carre', 'rectangle', 'cut-contour'] as const
export const tailleTypes = ['5x5', '8x8', '10x10', '15x15'] as const

export const createProductSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères').optional(),
  support: z.enum(supportTypes),
  forme: z.enum(formeTypes),
  taille: z.enum(tailleTypes),
  is_giftcard: z.boolean().default(false),
  discountable: z.boolean().default(true),
})

export const priceQuerySchema = z.object({
  variant_id: z.string().min(1, 'ID de variant requis'),
  quantity: z.coerce.number().int().positive().min(5).max(1000),
  support: z.enum(supportTypes).optional(),
  forme: z.enum(formeTypes).optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type PriceQueryInput = z.infer<typeof priceQuerySchema>
