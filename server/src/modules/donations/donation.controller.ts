import { Request, Response, NextFunction } from 'express'
import * as donationService from './donation.service'
import { sendSuccess, sendPaginated } from '../../utils/response'

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next)

export const initiateDonation = asyncHandler(async (req, res) => {
  const result = await donationService.initiateDonation(req.user!.id, req.body)
  sendSuccess(res, result, 'Donation initiated successfully', 201)
})

export const getMyDonations = asyncHandler(async (req, res) => {
  const { donations, meta } = await donationService.getDonorDonations(
    req.user!.id,
    req.query
  )
  sendPaginated(res, donations, meta, 'Donations fetched successfully')
})

export const getCreatorDonations = asyncHandler(async (req, res) => {
  const { donations, meta } = await donationService.getCreatorDonations(
    req.user!.id,
    req.query
  )
  sendPaginated(res, donations, meta, 'Donations fetched successfully')
})

export const getAllDonations = asyncHandler(async (req, res) => {
  const { donations, meta } = await donationService.getAllDonations(req.query)
  sendPaginated(res, donations, meta, 'Donations fetched successfully')
})

export const getCampaignDonations = asyncHandler(async (req, res) => {
  const { donations, meta } = await donationService.getCampaignDonations(
    req.params.id,
    req.query
  )
  sendPaginated(res, donations, meta, 'Donations fetched successfully')
})

export const getDonationById = asyncHandler(async (req, res) => {
  const donation = await donationService.getDonationById(
    req.params.id,
    req.user!.id,
    req.user!.role
  )
  sendSuccess(res, donation, 'Donation fetched successfully')
})