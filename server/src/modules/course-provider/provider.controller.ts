import { Request, Response, NextFunction } from 'express'
import path from 'path'
import * as providerService from './provider.service'
import { sendSuccess, sendError, sendPaginated } from '../../utils/response'
import { DOCUMENT_STORAGE_DIR } from '../../middlewares/upload.middleware'
import { Role } from '../../types/prisma-enums'

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res, next)).catch(next)

// ── Document upload (used while filling the multi-step registration form —
// not tied to a provider yet, the client uploads then submits the URL) ────
export const uploadProviderDocument = asyncHandler(async (req, res) => {
    const file = req.file as Express.Multer.File | undefined
    if (!file) {
        sendError(res, 'No file uploaded', 400)
        return
    }
    const url = `/grow-together/providers/documents/${file.filename}`
    sendSuccess(res, { url }, 'Document uploaded successfully', 201)
})

export const getProviderDocument = asyncHandler(async (req, res) => {
    const { filename } = req.params

    if (!/^[a-f0-9-]+\.[a-z0-9]+$/i.test(filename)) {
        sendError(res, 'Document not found', 404)
        return
    }

    const isAdmin = req.user!.role === Role.ADMIN
    if (!isAdmin) {
        const owns = await providerService.userOwnsProviderDocument(req.user!.id, filename)
        if (!owns) {
            sendError(res, 'Access denied', 403)
            return
        }
    }

    res.sendFile(path.join(process.cwd(), DOCUMENT_STORAGE_DIR, filename), (err) => {
        if (err && !res.headersSent) {
            sendError(res, 'Document not found', 404)
        }
    })
})

// ── Registration ─────────────────────────────────────────────────────────

export const registerProvider = asyncHandler(async (req, res) => {
    const provider = await providerService.registerProvider(req.user!.id, req.body)
    sendSuccess(res, provider, 'Course provider registered — pending review', 201)
})

export const getMyProviders = asyncHandler(async (req, res) => {
    const providers = await providerService.getMyProviders(req.user!.id)
    sendSuccess(res, providers, 'Your course providers fetched successfully')
})

// ── Admin ──────────────────────────────────────────────────────────────

export const getAdminProviders = asyncHandler(async (req, res) => {
    const { providers, meta } = await providerService.getAdminProviders(req.query)
    sendPaginated(res, providers, meta, 'Course providers fetched successfully')
})

export const getAdminProviderById = asyncHandler(async (req, res) => {
    const provider = await providerService.getAdminProviderById(req.params.id)
    sendSuccess(res, provider, 'Course provider fetched successfully')
})

export const updateProviderStatus = asyncHandler(async (req, res) => {
    const provider = await providerService.updateProviderStatus(req.params.id, req.user!.id, req.body)
    sendSuccess(res, provider, 'Verification status updated')
})

// ── Branches ──────────────────────────────────────────────────────────

export const getMyBranches = asyncHandler(async (req, res) => {
    const branches = await providerService.getMyBranches(req.user!.id)
    sendSuccess(res, branches, 'Your branches fetched successfully')
})

export const createBranch = asyncHandler(async (req, res) => {
    const branch = await providerService.createBranch(req.params.id, req.user!.id, req.user!.role, req.body)
    sendSuccess(res, branch, 'Branch created successfully', 201)
})

export const blockBranch = asyncHandler(async (req, res) => {
    const result = await providerService.setBranchBlocked(req.params.branchId, req.user!.id, req.user!.role, true)
    sendSuccess(res, null, result.message)
})

export const unblockBranch = asyncHandler(async (req, res) => {
    const result = await providerService.setBranchBlocked(req.params.branchId, req.user!.id, req.user!.role, false)
    sendSuccess(res, null, result.message)
})

export const deleteBranch = asyncHandler(async (req, res) => {
    const result = await providerService.deleteBranch(req.params.branchId, req.user!.id, req.user!.role)
    sendSuccess(res, null, result.message)
})