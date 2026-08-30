import { Request, Response, NextFunction } from 'express'
import * as pushService from './push.service'
import { sendSuccess, sendError } from '../../utils/response'
import { env } from '../../config/env'

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res, next)).catch(next)

export const getPublicKey = asyncHandler(async (req, res) => {
    sendSuccess(res, { publicKey: env.VAPID_PUBLIC_KEY })
})

export const subscribe = asyncHandler(async (req, res) => {
    const { endpoint, keys } = req.body
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
        sendError(res, 'Invalid subscription payload', 400)
        return
    }
    await pushService.saveSubscription(req.user!.id, { endpoint, keys })
    sendSuccess(res, null, 'Subscribed successfully')
})

export const unsubscribe = asyncHandler(async (req, res) => {
    const { endpoint } = req.body
    const result = await pushService.removeSubscription(endpoint)
    sendSuccess(res, null, result.message)
})