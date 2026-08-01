import fs from 'fs'
import path from 'path'

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'platform-settings.json')

export interface PlatformSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  supportPhone: string
  allowRegistrations: boolean
  allowCampaignCreation: boolean
  emailVerificationRequired: boolean
  googleLoginEnabled: boolean
  maintenanceMode: boolean
  maintenanceMessage: string
}

const DEFAULTS: PlatformSettings = {
  siteName: 'FundRaise',
  siteDescription:
    'A trusted crowdfunding platform connecting donors with meaningful causes across Bangladesh.',
  contactEmail: 'support@fundraise.com.bd',
  supportPhone: '+880 1800-FUNDRAISE',
  allowRegistrations: true,
  allowCampaignCreation: true,
  emailVerificationRequired: true,
  googleLoginEnabled: true,
  maintenanceMode: false,
  maintenanceMessage:
    'We are currently performing scheduled maintenance. We will be back shortly. Thank you for your patience.',
}

function ensureDir() {
  const dir = path.dirname(SETTINGS_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export function getSettings(): PlatformSettings {
  try {
    ensureDir()
    if (!fs.existsSync(SETTINGS_FILE)) {
      return { ...DEFAULTS }
    }
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8')
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function updateSettings(patch: Partial<PlatformSettings>): PlatformSettings {
  ensureDir()
  const current = getSettings()
  const updated = { ...current, ...patch }
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8')
  return updated
}