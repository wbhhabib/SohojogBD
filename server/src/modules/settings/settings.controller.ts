import { Request, Response } from 'express'
import { asyncHandler } from '@/middlewares/async.middleware'
import { sendSuccess } from '@/utils/response'
import { getSettings, updateSettings } from './settings.service'
import type { PlatformSettings } from './settings.service'

// Admin only — full settings
export const getSettingsController = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const settings = getSettings()
    sendSuccess(res, settings, 'Settings fetched successfully.')
  }
)

// Public — only exposes maintenance status & message (safe to call without auth)
export const getPublicStatusController = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const { maintenanceMode, maintenanceMessage } = getSettings()
    sendSuccess(res, { maintenanceMode, maintenanceMessage }, 'Status fetched.')
  }
)

// Admin only — update settings
export const updateSettingsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const allowed: (keyof PlatformSettings)[] = [
      'siteName',
      'siteDescription',
      'contactEmail',
      'supportPhone',
      'allowRegistrations',
      'allowCampaignCreation',
      'emailVerificationRequired',
      'googleLoginEnabled',
      'maintenanceMode',
      'maintenanceMessage',
    ]

    const patch: Partial<PlatformSettings> = {}
    for (const key of allowed) {
      if (key in req.body) {
        ;(patch as any)[key] = req.body[key]
      }
    }

    if (Object.keys(patch).length === 0) {
      res.status(400).json({ success: false, message: 'No valid fields provided.' })
      return
    }

    const updated = updateSettings(patch)
    sendSuccess(res, updated, 'Settings updated successfully.')
  }
)