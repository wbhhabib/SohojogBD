import { Request, Response, NextFunction } from 'express'
import * as orgService from './org.service'
import { sendSuccess, sendError, sendPaginated } from '../../utils/response'

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res, next)).catch(next)

export const getAllOrgs = asyncHandler(async (req, res) => {
    const { orgs, meta } = await orgService.getAllOrgs(req.query)
    sendPaginated(res, orgs, meta, 'Organizations fetched successfully')
})

export const getOrgBySlug = asyncHandler(async (req, res) => {
    const org = await orgService.getOrgBySlug(req.params.slug)
    sendSuccess(res, org, 'Organization fetched successfully')
})

export const getMyOrgs = asyncHandler(async (req, res) => {
    const { orgs, meta } = await orgService.getMyOrgs(req.user!.id, req.query)
    sendPaginated(res, orgs, meta, 'Your organizations fetched successfully')
})

export const createOrg = asyncHandler(async (req, res) => {
    const org = await orgService.createOrg(req.user!.id, req.body)
    sendSuccess(res, org, 'Organization created successfully', 201)
})

export const updateOrg = asyncHandler(async (req, res) => {
    const org = await orgService.updateOrg(req.params.id, req.user!.id, req.body)
    sendSuccess(res, org, 'Organization updated successfully')
})

export const deleteOrg = asyncHandler(async (req, res) => {
    const result = await orgService.deleteOrg(req.params.id, req.user!.id, req.user!.role)
    sendSuccess(res, null, result.message)
})

export const uploadOrgImages = asyncHandler(async (req, res) => {
    const files = req.files as Express.Multer.File[] | undefined
    if (!files || files.length === 0) {
        sendError(res, 'No images uploaded', 400)
        return
    }
    const urls = files.map((f) => `/uploads/images/${f.filename}`)
    const org = await orgService.updateOrg(req.params.id, req.user!.id, {
        ...(req.body.field === 'coverImage' ? { coverImage: urls[0] } : { logo: urls[0] }),
    })
    sendSuccess(res, org, 'Image uploaded successfully')
})

export const createVolunteerRequest = asyncHandler(async (req, res) => {
    const request = await orgService.createVolunteerRequest(req.params.id, req.user!.id, req.body)
    sendSuccess(res, request, 'Request sent to the organization', 201)
})

export const getOrgRequests = asyncHandler(async (req, res) => {
    const { requests, meta } = await orgService.getOrgRequests(req.params.id, req.user!.id, req.query)
    sendPaginated(res, requests, meta, 'Volunteer requests fetched successfully')
})

export const getMyVolunteerRequests = asyncHandler(async (req, res) => {
    const { requests, meta } = await orgService.getMyVolunteerRequests(req.user!.id, req.query)
    sendPaginated(res, requests, meta, 'Your volunteer requests fetched successfully')
})

export const respondToVolunteerRequest = asyncHandler(async (req, res) => {
    const request = await orgService.respondToVolunteerRequest(
        req.params.requestId,
        req.user!.id,
        req.body.status
    )
    sendSuccess(res, request, 'Request updated successfully')
})

export const cancelVolunteerRequest = asyncHandler(async (req, res) => {
    const result = await orgService.cancelVolunteerRequest(req.params.requestId, req.user!.id)
    sendSuccess(res, null, result.message)
})

export const createOrgUpdate = asyncHandler(async (req, res) => {
    const update = await orgService.createOrgUpdate(req.params.id, req.user!.id, req.body)
    sendSuccess(res, update, 'Update posted successfully', 201)
})

export const getOrgUpdates = asyncHandler(async (req, res) => {
    const { updates, meta } = await orgService.getOrgUpdates(req.params.id, req.query)
    sendPaginated(res, updates, meta, 'Updates fetched successfully')
})

export const deleteOrgUpdate = asyncHandler(async (req, res) => {
    const result = await orgService.deleteOrgUpdate(req.params.updateId, req.user!.id)
    sendSuccess(res, null, result.message)
})