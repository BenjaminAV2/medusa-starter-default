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

    // Get the default sales channel
    const defaultSalesChannel = await salesChannelService.listSalesChannels({
      is_default: true
    }, {
      take: 1
    })

    if (!defaultSalesChannel || defaultSalesChannel.length === 0) {
      return res.status(404).json({
        error: "No default sales channel found"
      })
    }

    const salesChannel = defaultSalesChannel[0]
    logger.info(`Found default sales channel: ${salesChannel.id}`)

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
