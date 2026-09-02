import { Router } from 'express'

import * as courseController from './course.controller'
import { authenticate } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { createCourseSchema } from './course.schema'

const router = Router()

// ── Public ────────────────────────────────────────────────────────────────
router.get('/', courseController.getAllCourses)

// ── Org's own course list (must come before /:slug) ─────────────────────
router.get('/org/:organizationId', courseController.getOrgCourses)

// ── Create ───────────────────────────────────────────────────────────────
router.post('/', authenticate, validate(createCourseSchema), courseController.createCourse)

// ── Manage (org owner / admin only) ─────────────────────────────────────
router.post('/:id/close', authenticate, courseController.closeCourse)
router.post('/:id/reopen', authenticate, courseController.reopenCourse)

// ── Public: single course by slug ───────────────────────────────────────
router.get('/:slug', courseController.getCourseBySlug)

export default router