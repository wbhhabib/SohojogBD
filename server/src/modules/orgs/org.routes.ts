import { Router } from 'express'

import * as orgController from './org.controller'

import { authenticate, authorize } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { uploadMultiple, uploadDocument } from '../../middlewares/upload.middleware'
import { Role } from '../../types/prisma-enums'

import {
    createOrgSchema,
    updateOrgSchema,
    updateVerificationStatusSchema,
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

// ── Verification document upload/download (used while filling the form, ──
// and later by admins/owners reviewing it). Access-controlled — see
// org.controller.ts#getOrgDocument for who's allowed to fetch a given file.
router.post('/documents', authenticate, uploadDocument, orgController.uploadOrgDocument)
router.get('/documents/:filename', authenticate, orgController.getOrgDocument)

// ── Admin: verification dashboard (must come before /:slug) ──────────────
router.get('/admin/all', authenticate, authorize(Role.ADMIN), orgController.getAdminOrgs)
router.get('/admin/:id', authenticate, authorize(Role.ADMIN), orgController.getAdminOrgById)
router.patch(
    '/admin/:id/status',
    authenticate,
    authorize(Role.ADMIN),
    validate(updateVerificationStatusSchema),
    orgController.updateVerificationStatus
)

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
