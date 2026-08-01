import { Request, Response, NextFunction } from 'express'
import { getSettings } from '../modules/settings/settings.service'

/**
 * Maintenance mode middleware.
 *
 * When maintenance is ON, blocks everything EXCEPT:
 *   GET  /health                     — uptime checks
 *   GET  /api/v1/settings/public     — maintenance page reads the message
 *   POST /api/v1/auth/login          — admin must log in to turn it off
 *   POST /api/v1/auth/refresh        — keep admin session alive
 *   GET  /api/v1/settings            — admin reads full settings
 *   PATCH /api/v1/settings           — admin turns maintenance off
 */
const ALLOWED: { method: string; path: string }[] = [
  { method: 'GET',   path: '/health' },
  { method: 'GET',   path: '/api/v1/settings/public' },
  { method: 'POST',  path: '/api/v1/auth/login' },
  { method: 'POST',  path: '/api/v1/auth/refresh' },
  { method: 'GET',   path: '/api/v1/settings' },
  { method: 'PATCH', path: '/api/v1/settings' },
]

function isAllowed(method: string, path: string): boolean {
  return ALLOWED.some(
    (rule) =>
      rule.method === method.toUpperCase() &&
      (path === rule.path || path.startsWith(rule.path + '/') || path.startsWith(rule.path + '?'))
  )
}

export const maintenanceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const settings = getSettings()
    if (!settings.maintenanceMode || isAllowed(req.method, req.path)) {
      next()
      return
    }
    res.status(503).json({
      success: false,
      maintenance: true,
      message:
        settings.maintenanceMessage ||
        'We are currently performing scheduled maintenance. We will be back shortly.',
    })
  } catch {
    next()
  }
}