import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { linkSalesChannelsToApiKeyWorkflow } from "@medusajs/medusa/core-flows"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const apiKeyModuleService = req.scope.resolve(Modules.API_KEY)
  const salesChannelService = req.scope.resolve(Modules.SALES_CHANNEL)
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    // Get the publishable API key
    const apiKeys = await apiKeyModuleService.listApiKeys({
      type: "publishable",
    }, {
      take: 1,
    })

    if (!apiKeys || apiKeys.length === 0) {
      return res.status(404).json({
        error: "No publishable API key found"
      })
    }

    const apiKey = apiKeys[0]
    logger.info(`Found publishable API key: ${apiKey.id}`)

    // Get the first sales channel (or the one named "Default Sales Channel")
    const salesChannels = await salesChannelService.listSalesChannels({}, {
      take: 10
    })

    // Try to find the default one by name, or just take the first one
    const defaultSalesChannel = salesChannels.filter(sc =>
      sc.name === "Default Sales Channel" || sc.name === "default"
    )
    const selectedChannel = defaultSalesChannel.length > 0
      ? [defaultSalesChannel[0]]
      : salesChannels.slice(0, 1)

    if (!selectedChannel || selectedChannel.length === 0) {
      return res.status(404).json({
        error: "No sales channel found"
      })
    }

    const salesChannel = selectedChannel[0]
    logger.info(`Found sales channel: ${salesChannel.id} (${salesChannel.name})`)

    // Link the sales channel to the API key
    await linkSalesChannelsToApiKeyWorkflow(req.scope).run({
      input: {
        id: apiKey.id,
        add: [salesChannel.id],
      },
    })

    logger.info("✅ Sales channel linked to publishable API key")

    return res.json({
      success: true,
      message: "Sales channel successfully linked to publishable API key",
      api_key_id: apiKey.id,
      sales_channel_id: salesChannel.id,
    })
  } catch (error) {
    logger.error("Failed to link sales channel:", error)
    return res.status(500).json({
      error: "Failed to link sales channel",
      details: error.message
    })
  }
}
