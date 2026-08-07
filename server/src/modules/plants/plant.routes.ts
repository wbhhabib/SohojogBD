import { Router } from 'express'

import * as plantController from './plant.controller'

import { authenticate } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { uploadMultiple, uploadSingleMemory } from '../../middlewares/upload.middleware'

import {
    createPlantListingSchema,
    updatePlantListingSchema,
    createPlantClaimSchema,
    updatePlantClaimSchema,
} from './plant.schema'

const router = Router()

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/', plantController.getAllListings)

// ── My listings (must come before /:slug) ────────────────────────────────────
router.get('/my', authenticate, plantController.getMyListings)
router.get('/my/:id', authenticate, plantController.getMyListingById)

// ── My claims (requests I've sent) ───────────────────────────────────────────
router.get('/claims/my', authenticate, plantController.getMyClaims)
router.patch('/claims/:claimId', authenticate, validate(updatePlantClaimSchema), plantController.respondToClaim)
router.delete('/claims/:claimId', authenticate, plantController.cancelClaim)

// ── AI: analyze a plant photo → suggested title/description/type ────────────
router.post('/analyze-image', authenticate, uploadSingleMemory, plantController.analyzeImage)

// ── Create ────────────────────────────────────────────────────────────────────
router.post('/', authenticate, validate(createPlantListingSchema), plantController.createListing)

// ── Update / Delete ───────────────────────────────────────────────────────────
router.patch('/:id', authenticate, validate(updatePlantListingSchema), plantController.updateListing)
router.delete('/:id', authenticate, plantController.deleteListing)
router.post('/:id/complete', authenticate, plantController.markCompleted)

// ── Images ────────────────────────────────────────────────────────────────────
router.post('/:id/images', authenticate, uploadMultiple, plantController.uploadImages)

// ── Claims on a listing ───────────────────────────────────────────────────────
router.post('/:id/claims', authenticate, validate(createPlantClaimSchema), plantController.createClaim)

// ── Public: single listing by slug ────────────────────────────────────────────
router.get('/:slug', plantController.getListingBySlug)

export default router