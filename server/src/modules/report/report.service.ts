import { prisma } from '../../config/database'
import { ReportReason, ReportStatus } from '../../types/prisma-enums'



export const createReport = async (
  reporterId: string,
  campaignId: string,
  reason: ReportReason
) => {

  const existing = await prisma.report.findFirst({
    where: { reporterId, campaignId },
  })
  if (existing) {
    throw new Error('You have already reported this campaign.')
  }

  return prisma.report.create({
    data: { reporterId, campaignId, reason },
    select: { id: true, reason: true, status: true, createdAt: true },
  })
}



export const getAdminReports = async (query: {
  status?: unknown
  page?: unknown
  limit?: unknown
}) => {
  const page  = Math.max(1, parseInt(String(query.page  ?? 1),   10))
  const limit = Math.min(200, parseInt(String(query.limit ?? 20), 10))
  const skip  = (page - 1) * limit

  const where: { status?: ReportStatus } = {}
  if (
    query.status &&
    typeof query.status === 'string' &&
    ['PENDING', 'REVIEWED', 'DISMISSED'].includes(query.status.toUpperCase())
  ) {
    where.status = query.status.toUpperCase() as ReportStatus
  }

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id:        true,
        reason:    true,
        status:    true,
        note:      true,
        createdAt: true,
        reporter:  { select: { id: true, name: true, email: true } },
        campaign:  { select: { id: true, title: true, slug: true, status: true } },
      },
    }),
    prisma.report.count({ where }),
  ])

  return {
    reports,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}



export const updateReportStatus = async (
  id: string,
  status: ReportStatus,
  note?: string
) => {
  const report = await prisma.report.findUnique({ where: { id } })
  if (!report) throw new Error('Report not found.')

  return prisma.report.update({
    where: { id },
    data:  { status, ...(note !== undefined ? { note } : {}) },
    select: { id: true, status: true, note: true },
  })
}