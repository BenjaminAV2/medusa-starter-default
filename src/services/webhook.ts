/**
 * Service de gestion des webhooks
 */

export interface WebhookPayload {
  event: string
  data: any
  timestamp: Date
  metadata?: Record<string, any>
}

export interface WebhookSubscriber {
  url: string
  events: string[]
  secret?: string
  active: boolean
}

class WebhookService {
  private subscribers: Map<string, WebhookSubscriber> = new Map()

  /**
   * Enregistre un subscriber de webhook
   */
  register(id: string, subscriber: WebhookSubscriber) {
    this.subscribers.set(id, subscriber)
  }

  /**
   * Déclenche un webhook
   */
  async trigger(event: string, data: any, metadata?: Record<string, any>) {
    const payload: WebhookPayload = {
      event,
      data,
      timestamp: new Date(),
      metadata,
    }

    console.log(`[Webhook] Triggering event: ${event}`, {
      data_keys: Object.keys(data),
      subscribers_count: this.getSubscribersForEvent(event).length,
    })

    // Trouver tous les subscribers pour cet event
    const subscribers = this.getSubscribersForEvent(event)

    // Envoyer à tous les subscribers (en parallèle)
    const results = await Promise.allSettled(
      subscribers.map((subscriber) => this.sendWebhook(subscriber, payload))
    )

    // Logger les résultats
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`[Webhook] Failed to send to ${subscribers[index].url}:`, result.reason)
      } else {
        console.log(`[Webhook] Successfully sent to ${subscribers[index].url}`)
      }
    })

    return {
      event,
      sent: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
    }
  }

  /**
   * Envoie un webhook à un subscriber
   */
  private async sendWebhook(subscriber: WebhookSubscriber, payload: WebhookPayload) {
    if (!subscriber.active) {
      throw new Error('Subscriber is not active')
    }

    const response = await fetch(subscriber.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(subscriber.secret && { 'X-Webhook-Secret': subscriber.secret }),
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response
  }

  /**
   * Récupère les subscribers pour un event spécifique
   */
  private getSubscribersForEvent(event: string): WebhookSubscriber[] {
    return Array.from(this.subscribers.values()).filter(
      (sub) => sub.active && (sub.events.includes(event) || sub.events.includes('*'))
    )
  }

  /**
   * Liste tous les subscribers
   */
  listSubscribers(): WebhookSubscriber[] {
    return Array.from(this.subscribers.values())
  }

  /**
   * Supprime un subscriber
   */
  unregister(id: string): boolean {
    return this.subscribers.delete(id)
  }
}

export const webhookService = new WebhookService()
