import { Router } from 'express'

import * as providerController from './provider.controller'
import { authenticate, authorize } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { uploadDocument } from '../../middlewares/upload.middleware'
import { Role } from '../../types/prisma-enums'
import { createProviderSchema, updateProviderStatusSchema, createBranchSchema } from './provider.schema'

const router = Router()

// ── Document upload (used while filling the registration form) ──────────
router.post('/documents', authenticate, uploadDocument, providerController.uploadProviderDocument)
router.get('/documents/:filename', authenticate, providerController.getProviderDocument)

// ── My provider(s) / my branches ─────────────────────────────────────────
router.get('/my', authenticate, providerController.getMyProviders)
router.get('/branches/my', authenticate, providerController.getMyBranches)

// ── Admin: verification dashboard (must come before /:id) ────────────────
router.get('/admin/all', authenticate, authorize(Role.ADMIN), providerController.getAdminProviders)
router.get('/admin/:id', authenticate, authorize(Role.ADMIN), providerController.getAdminProviderById)
router.patch(
    '/admin/:id/status',
    authenticate,
    authorize(Role.ADMIN),
    validate(updateProviderStatusSchema),
    providerController.updateProviderStatus
)

// ── Register ───────────────────────────────────────────────────────────
router.post('/', authenticate, validate(createProviderSchema), providerController.registerProvider)

// ── Branch management (provider owner only) ──────────────────────────────
router.post('/:id/branches', authenticate, validate(createBranchSchema), providerController.createBranch)
router.patch('/branches/:branchId/block', authenticate, providerController.blockBranch)
router.patch('/branches/:branchId/unblock', authenticate, providerController.unblockBranch)
router.delete('/branches/:branchId', authenticate, providerController.deleteBranch)

export default router