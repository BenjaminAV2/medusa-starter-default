import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

/**
 * Service pour gérer le stockage sur Cloudflare R2
 */
export class R2StorageService {
  private client: S3Client
  private bucket: string
  private publicUrl: string

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID
    const accessKeyId = process.env.R2_ACCESS_KEY_ID
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
    this.bucket = process.env.R2_BUCKET || 'client-uploads'
    this.publicUrl = process.env.R2_PUBLIC_URL || ''

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error('R2 credentials not configured')
    }

    // Configuration du client S3 pour R2
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  }

  /**
   * Génère une URL signée pour l'upload
   * @param key - Clé du fichier (chemin dans le bucket)
   * @param contentType - Type MIME du fichier
   * @param expiresIn - Durée de validité en secondes (défaut: 15 minutes)
   */
  async generateUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 900
  ): Promise<{
    uploadUrl: string
    key: string
    expiresAt: Date
  }> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn })

    return {
      uploadUrl,
      key,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    }
  }

  /**
   * Génère une URL signée pour la lecture
   * @param key - Clé du fichier
   * @param expiresIn - Durée de validité en secondes (défaut: 1 heure)
   */
  async generateDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })

    return await getSignedUrl(this.client, command, { expiresIn })
  }

  /**
   * Génère une clé unique pour un fichier
   * @param orderId - ID de la commande
   * @param fileName - Nom du fichier
   */
  generateFileKey(orderId: string, fileName: string): string {
    const timestamp = Date.now()
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    return `orders/${orderId}/${timestamp}-${sanitizedFileName}`
  }

  /**
   * Obtient l'URL publique d'un fichier (si domaine custom configuré)
   * @param key - Clé du fichier
   */
  getPublicUrl(key: string): string | null {
    if (!this.publicUrl) {
      return null
    }
    return `${this.publicUrl}/${key}`
  }

  /**
   * Valide le type de fichier
   */
  isValidFileType(contentType: string): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'image/webp',
      'application/pdf', // Pour les fichiers vectoriels
    ]

    return allowedTypes.includes(contentType)
  }

  /**
   * Valide la taille du fichier (en bytes)
   */
  isValidFileSize(size: number): boolean {
    const maxSize = 10 * 1024 * 1024 // 10 MB
    return size > 0 && size <= maxSize
  }
}

// Export singleton instance
export const r2StorageService = new R2StorageService()
