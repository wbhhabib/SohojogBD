import { Router } from 'express'

import * as orgController from './org.controller'

import { authenticate } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { uploadMultiple } from '../../middlewares/upload.middleware'

import {
    createOrgSchema,
    updateOrgSchema,
    createVolunteerRequestSchema,
    updateVolunteerRequestSchema,
    createOrgUpdateSchema,
} from './org.schema'

const router = Router()

// ── Public ────────────────────────────────────────────────────────────────
router.get('/', orgController.getAllOrgs)

// ── My orgs (must come before /:slug) ────────────────────────────────────
router.get('/my', authenticate, orgController.getMyOrgs)

// ── My volunteer requests (requests I've sent) ───────────────────────────
router.get('/requests/my', authenticate, orgController.getMyVolunteerRequests)
router.patch('/requests/:requestId', authenticate, validate(updateVolunteerRequestSchema), orgController.respondToVolunteerRequest)
router.delete('/requests/:requestId', authenticate, orgController.cancelVolunteerRequest)

// ── Org updates (single-update actions, must come before /:slug) ─────────
router.delete('/updates/:updateId', authenticate, orgController.deleteOrgUpdate)

// ── Create ────────────────────────────────────────────────────────────────
router.post('/', authenticate, validate(createOrgSchema), orgController.createOrg)

// ── Update / Delete an org ────────────────────────────────────────────────
router.patch('/:id', authenticate, validate(updateOrgSchema), orgController.updateOrg)
router.delete('/:id', authenticate, orgController.deleteOrg)

// ── Images ────────────────────────────────────────────────────────────────
router.post('/:id/images', authenticate, uploadMultiple, orgController.uploadOrgImages)

// ── Volunteer requests on an org ─────────────────────────────────────────
router.post('/:id/requests', authenticate, validate(createVolunteerRequestSchema), orgController.createVolunteerRequest)
router.get('/:id/requests', authenticate, orgController.getOrgRequests)

// ── Org updates (feed) ────────────────────────────────────────────────────
router.post('/:id/updates', authenticate, validate(createOrgUpdateSchema), orgController.createOrgUpdate)
router.get('/:id/updates', orgController.getOrgUpdates)

// ── Public: single org by slug ────────────────────────────────────────────
router.get('/:slug', orgController.getOrgBySlug)

export default router