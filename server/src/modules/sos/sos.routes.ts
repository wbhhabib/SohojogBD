import { Router } from 'express'
import * as sosController from './sos.controller'
import { authenticate } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validate.middleware'
import {
    createSOSSchema,
    respondToSOSSchema,
    updateSOSStatusSchema,
    responderSettingsSchema,
} from './sos.schema'

const router = Router()

// ── Specific routes first (before /:id) ──────────────────────────────────
router.get('/my', authenticate, sosController.getMySOSRequests)
router.get('/nearby', authenticate, sosController.getNearbyOpenSOS)
router.get('/responder-settings', authenticate, sosController.getResponderSettings)
router.patch('/responder-settings', authenticate, validate(responderSettingsSchema), sosController.updateResponderSettings)

// ── Create ────────────────────────────────────────────────────────────────
router.post('/', authenticate, validate(createSOSSchema), sosController.createSOSRequest)

// ── Actions on a specific SOS ───────────────────────────────────────────
router.post('/:id/respond', authenticate, validate(respondToSOSSchema), sosController.respondToSOS)
router.patch('/:id/status', authenticate, validate(updateSOSStatusSchema), sosController.updateSOSStatus)
router.get('/:id', authenticate, sosController.getSOSById)

export default router