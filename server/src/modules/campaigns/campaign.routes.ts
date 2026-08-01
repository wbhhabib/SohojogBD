import { Router } from 'express'
import { Role } from '../../types/prisma-enums'

import * as campaignController from './campaign.controller'

import { authenticate, authorize } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { uploadSingle } from '../../middlewares/upload.middleware'

import {
  createCampaignSchema,
  updateCampaignSchema,
  adminUpdateSchema,
  addCampaignUpdateSchema,
} from './campaign.schema'

const router = Router()

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/', campaignController.getAllCampaigns)

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get(
  '/admin/all',
  authenticate,
  authorize(Role.ADMIN),
  campaignController.getAdminAllCampaigns
)

router.patch(
  '/admin/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate(adminUpdateSchema),
  campaignController.adminUpdateCampaign
)

// ── Donor: supported campaigns ─────────────────────────────────────────────────
// NOTE: must be declared BEFORE /:slug so "supported" is not treated as a slug
router.get(
  '/supported',
  authenticate,
  authorize(Role.DONOR),
  campaignController.getSupportedCampaigns
)

// ── Creator: own campaigns ────────────────────────────────────────────────────
// List all of creator's campaigns
router.get(
  '/my',
  authenticate,
  authorize(Role.CREATOR),
  campaignController.getMyCampaigns
)

// Get a single campaign by ID (for edit page) — must come before /:id PATCH/DELETE
router.get(
  '/my/:id',
  authenticate,
  authorize(Role.CREATOR),
  campaignController.getMyCampaignById
)

// Create campaign
router.post(
  '/',
  authenticate,
  authorize(Role.CREATOR),
  validate(createCampaignSchema),
  campaignController.createCampaign
)

// Update campaign (status toggle, field edits) — PATCH not PUT
router.patch(
  '/:id',
  authenticate,
  authorize(Role.CREATOR),
  validate(updateCampaignSchema),
  campaignController.updateCampaign
)

// Upload cover image
router.post(
  '/:slug/cover',
  authenticate,
  authorize(Role.CREATOR),
  uploadSingle,
  campaignController.uploadCover
)

// Campaign updates (posts to donors)
router.get(
  '/:id/updates',
  campaignController.getCampaignUpdates
)

router.post(
  '/:id/updates',
  authenticate,
  authorize(Role.CREATOR),
  validate(addCampaignUpdateSchema),
  campaignController.addCampaignUpdate
)

// ── Public: single campaign by slug ───────────────────────────────────────────
router.get('/:slug', campaignController.getCampaignBySlug)

// ── Delete ────────────────────────────────────────────────────────────────────
router.delete(
  '/:id',
  authenticate,
  campaignController.deleteCampaign
)

export default router