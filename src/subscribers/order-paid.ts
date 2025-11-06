import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { Modules } from '@medusajs/framework/utils'
import { webhookService } from '../services/webhook'

/**
 * Subscriber pour l'événement order.placed
 * Déclenché quand une commande est passée et payée
 */
export default async function orderPaidHandler({ event, container }: SubscriberArgs<any>) {
  console.log('[Subscriber] Order paid event received', {
    order_id: event.data?.id,
  })

  try {
    const orderModuleService = container.resolve(Modules.ORDER)

    // Récupérer les détails de la commande
    const order = await orderModuleService.retrieveOrder(event.data.id, {
      relations: ['items', 'customer'],
    })

    console.log('[Subscriber] Order details:', {
      id: order.id,
      status: order.status,
      total: order.total,
      customer_id: order.customer_id,
      items_count: order.items?.length,
    })

    // Vérifier que la commande est bien placée
    if (order.status === 'completed' || order.status === 'pending') {
      // 1. Envoyer un webhook order.paid
      await webhookService.trigger('order.paid', {
        order_id: order.id,
        customer_id: order.customer_id,
        total: order.total,
        currency_code: order.currency_code,
        items: order.items,
        status: order.status,
      })

      // 2. TODO: Envoyer un email de confirmation
      console.log('[Subscriber] TODO: Send order confirmation email to customer')

      // 3. TODO: Envoyer un email demandant l'upload du fichier
      console.log('[Subscriber] TODO: Send upload request email to customer')

      // 4. Log pour le suivi
      console.log(`[Subscriber] Order ${order.id} successfully processed (placed)`)
    } else {
      console.log(
        `[Subscriber] Order ${order.id} not in correct status (status: ${order.status})`
      )
    }
  } catch (error: unknown) {
    const err = error as Error
    console.error('[Subscriber] Error processing order.paid event:', {
      error: err.message,
      order_id: event.data?.id,
    })
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed',
  context: {
    subscriberId: 'order-paid-handler',
  },
}
