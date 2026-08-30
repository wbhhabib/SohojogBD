import { Router } from 'express'
import * as pushController from './push.controller'
import { authenticate } from '../../middlewares/auth.middleware'

const router = Router()

router.get('/vapid-public-key', pushController.getPublicKey)
router.post('/subscribe', authenticate, pushController.subscribe)
router.post('/unsubscribe', authenticate, pushController.unsubscribe)

export default router