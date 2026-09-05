import { Request, Response, NextFunction } from 'express'
import * as poolService from './pool.service'
import { sendSuccess, sendPaginated } from '../../utils/response'

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res, next)).catch(next)

export const getAllPools = asyncHandler(async (req, res) => {
    const { pools, meta } = await poolService.getAllPools(req.query)
    sendPaginated(res, pools, meta, 'Pools fetched successfully')
})

export const getPoolBySlug = asyncHandler(async (req, res) => {
    const pool = await poolService.getPoolBySlug(req.params.slug, req.user?.id)
    sendSuccess(res, pool, 'Pool fetched successfully')
})

export const getMyPools = asyncHandler(async (req, res) => {
    const { pools, meta } = await poolService.getMyPools(req.user!.id, req.query)
    sendPaginated(res, pools, meta, 'Your pools fetched successfully')
})

export const getJoinedPools = asyncHandler(async (req, res) => {
    const { pools, meta } = await poolService.getJoinedPools(req.user!.id, req.query)
    sendPaginated(res, pools, meta, 'Joined pools fetched successfully')
})

export const createPool = asyncHandler(async (req, res) => {
    const pool = await poolService.createPool(req.user!.id, req.body)
    sendSuccess(res, pool, 'Pool created successfully', 201)
})

export const joinPool = asyncHandler(async (req, res) => {
    const pool = await poolService.joinPool(req.params.id, req.user!.id, req.body)
    sendSuccess(res, pool, 'You have joined the pool')
})

export const leavePool = asyncHandler(async (req, res) => {
    const result = await poolService.leavePool(req.params.id, req.user!.id)
    sendSuccess(res, null, result.message)
})

export const cancelPool = asyncHandler(async (req, res) => {
    const result = await poolService.cancelPool(req.params.id, req.user!.id)
    sendSuccess(res, null, result.message)
})