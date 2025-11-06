import { z } from 'zod'

export const uploadRequestSchema = z.object({
  order_id: z.string().min(1, 'ID de commande requis'),
  file_name: z.string().min(1, 'Nom de fichier requis'),
  file_type: z.string().regex(/^image\/(jpeg|jpg|png|gif|svg\+xml|webp)$/, 'Type de fichier invalide'),
  file_size: z.number().int().positive().max(10 * 1024 * 1024, 'Le fichier ne doit pas dépasser 10MB'),
})

export const uploadCompleteSchema = z.object({
  order_id: z.string().min(1, 'ID de commande requis'),
  file_url: z.string().url('URL invalide'),
  file_key: z.string().min(1, 'Clé de fichier requise'),
})

export type UploadRequestInput = z.infer<typeof uploadRequestSchema>
export type UploadCompleteInput = z.infer<typeof uploadCompleteSchema>
