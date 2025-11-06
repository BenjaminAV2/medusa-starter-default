import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { authenticate } from '../../../utils/auth'
import { uploadStore } from '../../../models/upload-record'

/**
 * GET /api/upload/status?order_id=xxx
 * Récupère le statut des uploads pour une commande
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
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

  const orderId = req.query.order_id as string

  if (!orderId) {
    return res.status(400).json({
      error: 'Missing parameter',
      message: 'Le paramètre order_id est requis',
    })
  }

  try {
    // Récupérer tous les uploads pour cette commande
    const uploads = uploadStore.findByOrderId(orderId)

    // Masquer les URLs sensibles
    const sanitizedUploads = uploads.map((upload) => ({
      id: upload.id,
      order_id: upload.order_id,
      file_name: upload.file_name,
      file_type: upload.file_type,
      file_size: upload.file_size,
      status: upload.status,
      uploaded_at: upload.uploaded_at,
      created_at: upload.created_at,
      // Ne pas exposer upload_url et download_url par défaut
      has_download_url: !!upload.download_url,
    }))

    return res.json({
      success: true,
      data: {
        order_id: orderId,
        uploads: sanitizedUploads,
        total: sanitizedUploads.length,
      },
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Upload status error:', err.message)

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Une erreur est survenue lors de la récupération du statut',
    })
  }
}

export const AUTHENTICATE = false
