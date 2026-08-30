import { Request, Response, NextFunction } from 'express'
import * as sosService from './sos.service'
import { sendSuccess } from '../../utils/response'

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res, next)).catch(next)

export const createSOSRequest = asyncHandler(async (req, res) => {
    const sos = await sosService.createSOSRequest(req.user!.id, req.body)
    sendSuccess(res, sos, 'SOS request created. Nearby volunteers have been alerted.', 201)
})

export const getSOSById = asyncHandler(async (req, res) => {
    const sos = await sosService.getSOSById(req.params.id)
    sendSuccess(res, sos, 'SOS request fetched successfully')
})

export const getMySOSRequests = asyncHandler(async (req, res) => {
    const requests = await sosService.getMySOSRequests(req.user!.id)
    sendSuccess(res, requests, 'Your SOS requests fetched successfully')
})

export const getNearbyOpenSOS = asyncHandler(async (req, res) => {
    const requests = await sosService.getNearbyOpenSOS(req.user!.id)
    sendSuccess(res, requests, 'Nearby SOS requests fetched successfully')
})

export const respondToSOS = asyncHandler(async (req, res) => {
    const response = await sosService.respondToSOS(req.params.id, req.user!.id, req.body.status)
    sendSuccess(res, response, 'Response recorded')
})

export const updateSOSStatus = asyncHandler(async (req, res) => {
    const sos = await sosService.updateSOSStatus(req.params.id, req.user!.id, req.user!.role, req.body.status)
    sendSuccess(res, sos, 'SOS status updated')
})

export const updateResponderSettings = asyncHandler(async (req, res) => {
    const settings = await sosService.updateResponderSettings(req.user!.id, req.body)
    sendSuccess(res, settings, 'Responder settings updated')
})

export const getResponderSettings = asyncHandler(async (req, res) => {
    const settings = await sosService.getResponderSettings(req.user!.id)
    sendSuccess(res, settings, 'Responder settings fetched')
})