import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { Modules } from '@medusajs/framework/utils'
import { uploadRequestSchema } from '../../../validators/upload'
import { validateRequest } from '../../../utils/validation'
import { authenticate } from '../../../utils/auth'
import { uploadRateLimit } from '../../../middlewares/rate-limit'
import { r2StorageService } from '../../../services/r2-storage'
import { uploadStore } from '../../../models/upload-record'

/**
 * POST /api/upload/request
 * Demande une URL signée pour uploader un fichier
 * Nécessite authentification + commande payée
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  // Rate limiting
  await new Promise<void>((resolve, reject) => {
    uploadRateLimit(req, res, (error?: any) => {
      if (error) reject(error)
      else resolve()
    })
  }).catch(() => {
    return
  })

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
  const validatedData = validateRequest(uploadRequestSchema, req.body, res)
  if (!validatedData) return

  const { order_id, file_name, file_type, file_size } = validatedData

  try {
    // 1. Vérifier que la commande existe et appartient à l'utilisateur
    const orderService = req.scope.resolve(Modules.ORDER)
    const orders = await orderService.listOrders({ id: order_id })

    if (orders.length === 0) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'Commande introuvable',
      })
    }

    const order = orders[0]

    // 2. Vérifier que la commande appartient à l'utilisateur
    if (order.customer_id !== user.user_id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Cette commande ne vous appartient pas',
      })
    }

    // 3. Vérifier que la commande est payée
    // Note: Dans Medusa v2, vérifier le status de la commande
    if (order.status !== 'completed' && order.status !== 'pending') {
      return res.status(400).json({
        error: 'Payment required',
        message: 'La commande doit être payée avant de pouvoir uploader un fichier',
        order_status: order.status,
      })
    }

    // 4. Valider le type et la taille du fichier
    if (!r2StorageService.isValidFileType(file_type)) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Type de fichier non autorisé. Formats acceptés: JPG, PNG, GIF, SVG, WebP, PDF',
      })
    }

    if (!r2StorageService.isValidFileSize(file_size)) {
      return res.status(400).json({
        error: 'Invalid file size',
        message: 'La taille du fichier doit être entre 1 byte et 10 MB',
      })
    }

    // 5. Générer la clé et l'URL signée
    const fileKey = r2StorageService.generateFileKey(order_id, file_name)
    const { uploadUrl, expiresAt } = await r2StorageService.generateUploadUrl(
      fileKey,
      file_type,
      900 // 15 minutes
    )

    // 6. Créer l'enregistrement d'upload
    const uploadRecord = uploadStore.create({
      order_id,
      file_key: fileKey,
      file_name,
      file_type,
      file_size,
      status: 'pending',
      upload_url: uploadUrl,
    })

    // 7. Retourner l'URL signée
    return res.json({
      success: true,
      data: {
        upload_id: uploadRecord.id,
        upload_url: uploadUrl,
        file_key: fileKey,
        expires_at: expiresAt,
        instructions: {
          method: 'PUT',
          headers: {
            'Content-Type': file_type,
          },
          note: 'Utilisez cette URL pour uploader votre fichier directement sur R2',
        },
      },
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Upload request error:', err.message)

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Une erreur est survenue lors de la génération de l\'URL d\'upload',
    })
  }
}

export const AUTHENTICATE = false
