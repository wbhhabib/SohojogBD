import { Request, Response, NextFunction } from 'express'
import * as plantService from './plant.service'
import { sendSuccess, sendError, sendPaginated } from '../../utils/response'

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res, next)).catch(next)

export const getAllListings = asyncHandler(async (req, res) => {
    const { listings, meta } = await plantService.getAllListings(req.query)
    sendPaginated(res, listings, meta, 'Plant listings fetched successfully')
})

export const getListingBySlug = asyncHandler(async (req, res) => {
    const listing = await plantService.getListingBySlug(req.params.slug)
    sendSuccess(res, listing, 'Plant listing fetched successfully')
})

export const getMyListings = asyncHandler(async (req, res) => {
    const { listings, meta } = await plantService.getMyListings(req.user!.id, req.query)
    sendPaginated(res, listings, meta, 'Your plant listings fetched successfully')
})

export const getMyListingById = asyncHandler(async (req, res) => {
    const listing = await plantService.getMyListingById(req.params.id, req.user!.id)
    sendSuccess(res, listing, 'Plant listing fetched successfully')
})

export const createListing = asyncHandler(async (req, res) => {
    const listing = await plantService.createListing(req.user!.id, req.body)
    sendSuccess(res, listing, 'Plant listing created successfully', 201)
})

export const updateListing = asyncHandler(async (req, res) => {
    const listing = await plantService.updateListing(req.params.id, req.user!.id, req.body)
    sendSuccess(res, listing, 'Plant listing updated successfully')
})

export const deleteListing = asyncHandler(async (req, res) => {
    const result = await plantService.deleteListing(req.params.id, req.user!.id, req.user!.role)
    sendSuccess(res, null, result.message)
})

export const markCompleted = asyncHandler(async (req, res) => {
    const listing = await plantService.markCompleted(req.params.id, req.user!.id)
    sendSuccess(res, listing, 'Listing marked as completed')
})

export const uploadImages = asyncHandler(async (req, res) => {
    const files = req.files as Express.Multer.File[] | undefined
    if (!files || files.length === 0) {
        sendError(res, 'No images uploaded', 400)
        return
    }
    const imageUrls = files.map((f) => `/uploads/images/${f.filename}`)
    const listing = await plantService.addListingImages(req.params.id, req.user!.id, imageUrls)
    sendSuccess(res, listing, 'Images uploaded successfully')
})

export const createClaim = asyncHandler(async (req, res) => {
    const claim = await plantService.createClaim(req.params.id, req.user!.id, req.body)
    sendSuccess(res, claim, 'Request sent to the owner', 201)
})

export const getMyClaims = asyncHandler(async (req, res) => {
    const { claims, meta } = await plantService.getMyClaims(req.user!.id, req.query)
    sendPaginated(res, claims, meta, 'Your requests fetched successfully')
})

export const respondToClaim = asyncHandler(async (req, res) => {
    const claim = await plantService.respondToClaim(
        req.params.claimId,
        req.user!.id,
        req.body.status
    )
    sendSuccess(res, claim, 'Request updated successfully')
})

export const cancelClaim = asyncHandler(async (req, res) => {
    const result = await plantService.cancelClaim(req.params.claimId, req.user!.id)
    sendSuccess(res, null, result.message)
})