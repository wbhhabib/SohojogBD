import { Router } from 'express'
import * as verificationController from './verification.controller'
import { authenticate, authorize } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { uploadDocument } from '../../middlewares/upload.middleware'
import { submitVerificationSchema, reviewVerificationSchema } from './verification.schema'
import { Role } from '../../types/prisma-enums'

const router = Router()

router.use(authenticate)

router.get('/me', verificationController.getMyVerification)
router.get('/check/:actionType', verificationController.checkReadiness)
router.post(
    '/submit',
    validate(submitVerificationSchema),
    verificationController.submitVerification,
)
router.post('/documents', uploadDocument, verificationController.uploadVerificationDocument)
router.get('/documents/:filename', verificationController.getVerificationDocument)

// Admin only
router.get(
    '/admin/pending',
    authorize(Role.ADMIN),
    verificationController.getPendingVerifications,
)
router.post(
    '/admin/:userId/review',
    authorize(Role.ADMIN),
    validate(reviewVerificationSchema),
    verificationController.reviewVerification,
)

export default router