import { Router } from 'express'

import * as courseController from './course.controller'
import { authenticate } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { uploadMultiple } from '../../middlewares/upload.middleware'
import { createCourseSchema } from './course.schema'

const router = Router()

// ── Public ────────────────────────────────────────────────────────────────
router.get('/', courseController.getAllCourses)

// ── Signed-in user's own courses / postable branches — before /:slug ────
router.get('/my', authenticate, courseController.getMyCourses)
router.get('/my-branches', authenticate, courseController.getMyPostableBranches)

// ── Create ───────────────────────────────────────────────────────────────
router.post('/', authenticate, validate(createCourseSchema), courseController.createCourse)

// ── Manage (branch's own login, provider owner, or admin) ────────────────
router.post('/:id/close', authenticate, courseController.closeCourse)
router.post('/:id/reopen', authenticate, courseController.reopenCourse)
router.post('/:id/images', authenticate, uploadMultiple, courseController.uploadCourseImages)

// ── Public: single course by slug ───────────────────────────────────────
router.get('/:slug', courseController.getCourseBySlug)

export default router