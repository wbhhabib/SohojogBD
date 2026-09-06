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

// ── Supported campaigns (নিজের donation history) ───────────────────────────────
// NOTE: must be declared BEFORE /:slug so "supported" is not treated as a slug
// role-gate লাগবে না — controller নিজেই req.user.id দিয়ে scope করে
router.get(
  '/supported',
  authenticate,
  campaignController.getSupportedCampaigns
)

// ── নিজের campaign গুলো ────────────────────────────────────────────────────────
// List all of my campaigns
router.get(
  '/my',
  authenticate,
  campaignController.getMyCampaigns
)

// Get a single campaign by ID (for edit page) — must come before /:id PATCH/DELETE
router.get(
  '/my/:id',
  authenticate,
  campaignController.getMyCampaignById
)

// Create campaign — role-gate সরানো হয়েছে, verification-gate service লেয়ারে আছে
router.post(
  '/',
  authenticate,
  validate(createCampaignSchema),
  campaignController.createCampaign
)

// Update campaign (status toggle, field edits) — PATCH not PUT
// ownership check service-এ আছে (creatorId মিলছে কিনা)
router.patch(
  '/:id',
  authenticate,
  validate(updateCampaignSchema),
  campaignController.updateCampaign
)

// Upload cover image — ownership check service-এ আছে
router.post(
  '/:slug/cover',
  authenticate,
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