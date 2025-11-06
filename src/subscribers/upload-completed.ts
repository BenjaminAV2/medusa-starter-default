/**
 * Handler pour l'événement upload.completed
 * Ce fichier montre comment on pourrait écouter les événements d'upload
 *
 * Note: Pour l'instant, cet événement est déclenché manuellement
 * via webhookService.trigger() dans l'endpoint /api/upload/complete
 */

import { webhookService } from '../services/webhook'

/**
 * Fonction à appeler quand un upload est complété
 * (appelée depuis /api/upload/complete)
 */
export async function handleUploadCompleted(uploadData: any) {
  console.log('[Upload] File uploaded successfully', {
    upload_id: uploadData.upload_id,
    order_id: uploadData.order_id,
    file_name: uploadData.file_name,
  })

  try {
    // 1. Déclencher le webhook upload.completed
    await webhookService.trigger('upload.completed', {
      upload_id: uploadData.upload_id,
      order_id: uploadData.order_id,
      file_key: uploadData.file_key,
      file_name: uploadData.file_name,
      file_type: uploadData.file_type,
      status: 'uploaded',
      uploaded_at: uploadData.uploaded_at,
    })

    // 2. TODO: Envoyer un email de confirmation d'upload
    console.log('[Upload] TODO: Send upload confirmation email')

    // 3. TODO: Déclencher le processus de génération de preview
    console.log('[Upload] TODO: Trigger preview generation')

    // 4. TODO: Mettre à jour le statut de la commande
    console.log('[Upload] TODO: Update order status to "artwork_received"')

    console.log(`[Upload] Upload ${uploadData.upload_id} successfully processed`)
  } catch (error: unknown) {
    const err = error as Error
    console.error('[Upload] Error processing upload.completed:', {
      error: err.message,
      upload_id: uploadData.upload_id,
    })
  }
}
