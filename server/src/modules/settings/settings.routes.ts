import { Router } from 'express'
import { Role } from '../../types/prisma-enums'
import { authenticate, authorize } from '@/middlewares/auth.middleware'
import {
  getSettingsController,
  getPublicStatusController,
  updateSettingsController,
} from './settings.controller'

const router = Router()

// PUBLIC — no auth needed, returns only { maintenanceMode, maintenanceMessage }
// Used by maintenance page & Next.js middleware
router.get('/public', getPublicStatusController)

// ADMIN — full settings read
router.get('/', authenticate, authorize(Role.ADMIN), getSettingsController)

// ADMIN — update settings
router.patch('/', authenticate, authorize(Role.ADMIN), updateSettingsController)

export default router