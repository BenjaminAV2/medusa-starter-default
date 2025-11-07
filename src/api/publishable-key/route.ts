import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const apiKeyModuleService = req.scope.resolve(Modules.API_KEY)

  // Get the first publishable API key
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

  const publishableKey = apiKeys[0]

  res.json({
    publishable_key: publishableKey.token,
    id: publishableKey.id,
    title: publishableKey.title,
  })
}
