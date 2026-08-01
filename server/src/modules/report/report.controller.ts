
import { Request, Response } from 'express'
import { asyncHandler } from '@/middlewares/async.middleware'
import { sendPaginated, sendSuccess } from '@/utils/response'
import { createReport, getAdminReports, updateReportStatus } from './report.service'
import { ReportReason, ReportStatus } from '../../types/prisma-enums'


export const createReportController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const reporterId = req.user!.id
    const { campaignId, reason } = req.body

    if (!campaignId || !reason) {
      res.status(400).json({ success: false, message: 'campaignId and reason are required.' })
      return
    }
    if (!Object.values(ReportReason).includes(reason)) {
      res.status(400).json({ success: false, message: 'Invalid reason.' })
      return
    }

    const data = await createReport(reporterId, campaignId, reason as ReportReason)
    sendSuccess(res, data, 'Report submitted successfully.', 201)
  }
)


export const getAdminReportsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await getAdminReports(req.query)
    sendPaginated(res, result.reports, result.meta, 'Reports fetched successfully.')
  }
)


export const updateReportController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const { status, note } = req.body

    if (!status || !['PENDING', 'REVIEWED', 'DISMISSED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Valid status required: PENDING | REVIEWED | DISMISSED' })
      return
    }

    const data = await updateReportStatus(id, status as ReportStatus, note)
    sendSuccess(res, data, 'Report updated successfully.')
  }
)