/**
 * Modèle pour stocker les enregistrements d'upload
 * Note: En production, cela devrait être une table PostgreSQL
 * Pour l'instant, on utilise un store en mémoire
 */

export interface UploadRecord {
  id: string
  order_id: string
  file_key: string
  file_name: string
  file_type: string
  file_size: number
  status: 'pending' | 'uploaded' | 'processing' | 'completed' | 'failed'
  upload_url?: string
  download_url?: string
  public_url?: string
  uploaded_at?: Date
  created_at: Date
  updated_at: Date
  metadata?: Record<string, any>
}

/**
 * Store en mémoire pour les uploads
 * TODO: Remplacer par une table PostgreSQL en production
 */
class UploadStore {
  private uploads: Map<string, UploadRecord> = new Map()

  create(data: Omit<UploadRecord, 'id' | 'created_at' | 'updated_at'>): UploadRecord {
    const id = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date()

    const record: UploadRecord = {
      id,
      ...data,
      created_at: now,
      updated_at: now,
    }

    this.uploads.set(id, record)
    return record
  }

  findById(id: string): UploadRecord | undefined {
    return this.uploads.get(id)
  }

  findByOrderId(orderId: string): UploadRecord[] {
    return Array.from(this.uploads.values()).filter((upload) => upload.order_id === orderId)
  }

  update(id: string, data: Partial<UploadRecord>): UploadRecord | undefined {
    const record = this.uploads.get(id)
    if (!record) return undefined

    const updated = {
      ...record,
      ...data,
      updated_at: new Date(),
    }

    this.uploads.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.uploads.delete(id)
  }

  findAll(): UploadRecord[] {
    return Array.from(this.uploads.values())
  }
}

export const uploadStore = new UploadStore()
