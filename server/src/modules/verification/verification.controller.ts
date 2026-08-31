import { Request, Response, NextFunction } from 'express'
import path from 'path'
import * as verificationService from './verification.service'
import { sendSuccess, sendError, sendPaginated } from '../../utils/response'
import { Role } from '../../types/prisma-enums'
import { DOCUMENT_STORAGE_DIR } from '../../middlewares/upload.middleware'
import { ActionType } from './verification.config'

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res, next)).catch(next)

// GET /verification/check/:actionType — action নেওয়ার আগে frontend এটা কল করবে
export const checkReadiness = asyncHandler(async (req, res) => {
    const actionType = req.params.actionType as ActionType
    const result = await verificationService.checkCompleteness(req.user!.id, actionType)
    sendSuccess(res, result, 'Completeness checked')
})

// GET /verification/me — নিজের বর্তমান verification অবস্থা দেখা
export const getMyVerification = asyncHandler(async (req, res) => {
    const user = await verificationService.getMyVerification(req.user!.id)
    sendSuccess(res, user, 'Verification info fetched')
})

// POST /verification/submit — progressive profiling, যেটুকু পাঠাবে সেটুকুই সেভ হবে
export const submitVerification = asyncHandler(async (req, res) => {
    const user = await verificationService.submitVerification(req.user!.id, req.body)
    sendSuccess(res, user, 'Verification info submitted')
})

// POST /verification/documents — NID/student-ID/certificate ছবি আপলোড
export const uploadVerificationDocument = asyncHandler(async (req, res) => {
    const file = req.file as Express.Multer.File | undefined
    if (!file) {
        sendError(res, 'No file uploaded', 400)
        return
    }
    // Public URL না — শুধু filename ফেরত যাচ্ছে, client এটা submit payload-এ বসাবে
    sendSuccess(res, { filename: file.filename }, 'Document uploaded successfully', 201)
})

// GET /verification/documents/:filename — শুধু owner অথবা admin দেখতে পারবে
export const getVerificationDocument = asyncHandler(async (req, res) => {
    const { filename } = req.params

    if (!/^[a-f0-9-]+\.[a-z0-9]+$/i.test(filename)) {
        sendError(res, 'Document not found', 404)
        return
    }

    const isAdmin = req.user!.role === Role.ADMIN
    if (!isAdmin) {
        const owns = await verificationService.userOwnsVerificationDocument(req.user!.id, filename)
        if (!owns) {
            sendError(res, 'Access denied', 403)
            return
        }
    }

    const filePath = path.join(process.cwd(), DOCUMENT_STORAGE_DIR, filename)
    res.sendFile(filePath, (err) => {
        if (err && !res.headersSent) {
            sendError(res, 'Document not found', 404)
        }
    })
})

// ── Admin ──────────────────────────────────────────────────────────

// GET /verification/admin/pending
export const getPendingVerifications = asyncHandler(async (req, res) => {
    const { users, meta } = await verificationService.getPendingVerifications(req.query as never)
    sendPaginated(res, users, meta, 'Pending verifications fetched')
})

// POST /verification/admin/:userId/review
export const reviewVerification = asyncHandler(async (req, res) => {
    const user = await verificationService.reviewVerification(req.params.userId, req.body)
    sendSuccess(res, user, 'Verification reviewed')
})