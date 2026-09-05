import { Router } from 'express'

import * as poolController from './pool.controller'
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { createPoolSchema, joinPoolSchema } from './pool.schema'

const router = Router()

// ── Public ────────────────────────────────────────────────────────────────
router.get('/', poolController.getAllPools)

// ── My pools / joined pools (must come before /:slug) ──────────────────────
router.get('/my', authenticate, poolController.getMyPools)
router.get('/joined', authenticate, poolController.getJoinedPools)

// ── Create ───────────────────────────────────────────────────────────────
router.post('/', authenticate, validate(createPoolSchema), poolController.createPool)

// ── Join / leave / cancel ───────────────────────────────────────────────
router.post('/:id/join', authenticate, validate(joinPoolSchema), poolController.joinPool)
router.post('/:id/leave', authenticate, poolController.leavePool)
router.post('/:id/cancel', authenticate, poolController.cancelPool)

// ── Public: single pool by slug (optional auth — verified viewer পেলে contact info দেখাবে) ──
router.get('/:slug', optionalAuthenticate, poolController.getPoolBySlug)

export default router