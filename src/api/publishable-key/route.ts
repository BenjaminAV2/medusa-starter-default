import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createApiKeysWorkflow, linkSalesChannelsToApiKeyWorkflow } from "@medusajs/medusa/core-flows"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const apiKeyModuleService = req.scope.resolve(Modules.API_KEY)
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  // Get the first publishable API key
  let apiKeys = await apiKeyModuleService.listApiKeys({
    type: "publishable",
  }, {
    take: 1,
  })

  // If no publishable API key exists, create one
  if (!apiKeys || apiKeys.length === 0) {
    logger.info("No publishable API key found, creating one...")

    try {
      const { result } = await createApiKeysWorkflow(req.scope).run({
        input: {
          api_keys: [
            {
              title: "Webshop",
              type: "publishable",
              created_by: "system",
            },
          ],
        },
      })

      apiKeys = result
      logger.info("✅ Publishable API key created successfully")

      // Link the first sales channel to the publishable API key
      try {
        const salesChannelService = req.scope.resolve(Modules.SALES_CHANNEL)
        const salesChannels = await salesChannelService.listSalesChannels({}, {
          take: 10
        })

        // Try to find one named "Default Sales Channel" or just use the first one
        const defaultSalesChannel = salesChannels.filter(sc =>
          sc.name === "Default Sales Channel" || sc.name === "default"
        )
        const selectedChannel = defaultSalesChannel.length > 0
          ? [defaultSalesChannel[0]]
          : salesChannels.slice(0, 1)

        if (selectedChannel && selectedChannel.length > 0) {
          await linkSalesChannelsToApiKeyWorkflow(req.scope).run({
            input: {
              id: apiKeys[0].id,
              add: [selectedChannel[0].id],
            },
          })
          logger.info(`✅ Sales channel "${selectedChannel[0].name}" linked to publishable API key`)
        }
      } catch (error) {
        logger.error("Failed to link sales channel to publishable API key:", error)
      }
    } catch (error) {
      logger.error("Failed to create publishable API key:", error)
      return res.status(500).json({
        error: "Failed to create publishable API key"
      })
    }
  }

  const publishableKey = apiKeys[0]

  res.json({
    publishable_key: publishableKey.token,
    id: publishableKey.id,
    title: publishableKey.title,
  })
}
