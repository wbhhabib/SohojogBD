import { Request, Response, NextFunction } from 'express'
import * as campaignService from './campaign.service'
import { sendSuccess, sendError, sendPaginated } from '../../utils/response'

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next)

export const getAllCampaigns = asyncHandler(async (req, res) => {
  const { campaigns, meta } = await campaignService.getAllCampaigns(req.query, false)
  sendPaginated(res, campaigns, meta, 'Campaigns fetched successfully')
})

export const getAdminAllCampaigns = asyncHandler(async (req, res) => {
  const { campaigns, meta } = await campaignService.getAllCampaigns(req.query, true)
  sendPaginated(res, campaigns, meta, 'Campaigns fetched successfully')
})

export const getMyCampaigns = asyncHandler(async (req, res) => {
  const { campaigns, meta } = await campaignService.getCreatorCampaigns(
    req.user!.id,
    req.query
  )
  sendPaginated(res, campaigns, meta, 'Campaigns fetched successfully')
})

export const getMyCampaignById = asyncHandler(async (req, res) => {
  const campaign = await campaignService.getCampaignById(req.params.id)
  // Make sure the requester is the owner
  if (campaign.creatorId !== req.user!.id) {
    sendError(res, 'Access denied', 403)
    return
  }
  sendSuccess(res, campaign, 'Campaign fetched successfully')
})



export const getSupportedCampaigns = asyncHandler(async (req, res) => {
  const { campaigns, meta } = await campaignService.getSupportedCampaigns(
    req.user!.id,
    req.query
  )
  sendPaginated(res, campaigns, meta, 'Supported campaigns fetched successfully')
})

export const getCampaignBySlug = asyncHandler(async (req, res) => {
  const campaign = await campaignService.getCampaignBySlug(req.params.slug)
  sendSuccess(res, campaign, 'Campaign fetched successfully')
})

export const createCampaign = asyncHandler(async (req, res) => {
  const campaign = await campaignService.createCampaign(req.user!.id, req.body)
  sendSuccess(res, campaign, 'Campaign created successfully', 201)
})

export const updateCampaign = asyncHandler(async (req, res) => {
  const campaign = await campaignService.updateCampaign(
    req.params.id,
    req.user!.id,
    req.body
  )
  sendSuccess(res, campaign, 'Campaign updated successfully')
})

export const deleteCampaign = asyncHandler(async (req, res) => {
  const result = await campaignService.deleteCampaign(
    req.params.id,
    req.user!.id,
    req.user!.role
  )
  sendSuccess(res, null, result.message)
})

export const adminUpdateCampaign = asyncHandler(async (req, res) => {
  const campaign = await campaignService.adminUpdateCampaign(req.params.id, req.body)
  sendSuccess(res, campaign, 'Campaign updated successfully')
})

export const addCampaignUpdate = asyncHandler(async (req, res) => {
  const update = await campaignService.addCampaignUpdate(
    req.params.id,
    req.user!.id,
    req.body
  )
  sendSuccess(res, update, 'Campaign update posted successfully', 201)
})

export const getCampaignUpdates = asyncHandler(async (req, res) => {
  const updates = await campaignService.getCampaignUpdates(req.params.id)
  sendSuccess(res, updates, 'Campaign updates fetched successfully')
})

export const uploadCover = asyncHandler(async (req, res) => {
  if (!req.file) {
    sendError(res, 'No image uploaded', 400)
    return
  }
  const imageUrl = `/uploads/images/${req.file.filename}`
  const campaign = await campaignService.addCampaignImage(
    req.params.slug,
    req.user!.id,
    imageUrl
  )
  sendSuccess(res, campaign, 'Image uploaded successfully')
})