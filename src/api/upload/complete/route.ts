import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { uploadCompleteSchema } from '../../../validators/upload'
import { validateRequest } from '../../../utils/validation'
import { authenticate } from '../../../utils/auth'
import { uploadStore } from '../../../models/upload-record'
import { r2StorageService } from '../../../services/r2-storage'

/**
 * POST /api/upload/complete
 * Confirme qu'un upload a été complété avec succès
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Authentification
  let user
  try {
    user = authenticate(req)
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentification requise',
    })
  }

  // Validation
  const validatedData = validateRequest(uploadCompleteSchema, req.body, res)
  if (!validatedData) return

  const { order_id, file_url, file_key } = validatedData

  try {
    // 1. Trouver l'enregistrement d'upload
    const uploads = uploadStore.findByOrderId(order_id)
    const upload = uploads.find((u) => u.file_key === file_key)

    if (!upload) {
      return res.status(404).json({
        error: 'Upload not found',
        message: 'Enregistrement d\'upload introuvable',
      })
    }

    // 2. Générer une URL de téléchargement signée (valide 7 jours)
    const downloadUrl = await r2StorageService.generateDownloadUrl(
      file_key,
      7 * 24 * 60 * 60 // 7 jours
    )

    // 3. Obtenir l'URL publique si disponible
    const publicUrl = r2StorageService.getPublicUrl(file_key)

    // 4. Mettre à jour l'enregistrement
    const updatedUpload = uploadStore.update(upload.id, {
      status: 'uploaded',
      download_url: downloadUrl,
      public_url: publicUrl || undefined,
      uploaded_at: new Date(),
    })

    // 5. Déclencher le webhook upload.completed
    await require('../../../subscribers/upload-completed').handleUploadCompleted({
      upload_id: updatedUpload!.id,
      order_id: updatedUpload!.order_id,
      file_key: updatedUpload!.file_key,
      file_name: updatedUpload!.file_name,
      file_type: updatedUpload!.file_type,
      uploaded_at: updatedUpload!.uploaded_at,
    })

    return res.json({
      success: true,
      data: {
        upload_id: updatedUpload!.id,
        status: 'uploaded',
        download_url: downloadUrl,
        public_url: publicUrl,
        uploaded_at: updatedUpload!.uploaded_at,
        message: 'Votre fichier a été uploadé avec succès',
      },
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Upload complete error:', err.message)

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Une erreur est survenue lors de la confirmation de l\'upload',
    })
  }
}

export const AUTHENTICATE = false
