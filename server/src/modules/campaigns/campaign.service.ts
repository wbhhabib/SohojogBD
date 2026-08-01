import { CampaignStatus, Role } from '../../types/prisma-enums'
import { prisma } from '../../config/database'
import { generateUniqueSlug } from '../../utils/slug'
import { toCampaignStatus } from '../../utils/transform'
import { getPagination, getPaginationMeta } from '../../utils/pagination'
import {
  CreateCampaignInput,
  UpdateCampaignInput,
  AdminUpdateInput,
  AddCampaignUpdateInput,
} from './campaign.schema'

const createHttpError = (message: string, statusCode: number) => {
  const err = new Error(message) as Error & { statusCode: number }
  err.statusCode = statusCode
  return err
}

const CAMPAIGN_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  story: true,
  goalAmount: true,
  raisedAmount: true,
  donorCount: true,
  category: true,
  status: true,
  images: true,
  beneficiaryName: true,
  beneficiaryInfo: true,
  deadline: true,
  createdAt: true,
  updatedAt: true,
  creatorId: true,
  creator: {
    select: {
      id: true,
      name: true,
      avatar: true,
      email: true,
    },
  },
} as const


interface CampaignWhereInput {
  status?: CampaignStatus
  category?: string
  creatorId?: string
  OR?: Array<{ title?: { contains: string; mode: 'insensitive' }; description?: { contains: string; mode: 'insensitive' } }>
}

interface CampaignOrderByInput {
  raisedAmount?: 'asc' | 'desc'
  deadline?: 'asc' | 'desc'
  donorCount?: 'asc' | 'desc'
  createdAt?: 'asc' | 'desc'
}

const transformCampaign = (campaign: { status: string; [key: string]: unknown }) => ({
  ...campaign,
  status: toCampaignStatus(campaign.status as CampaignStatus),
})


function buildOrderBy(sort?: unknown): CampaignOrderByInput {
  switch (sort) {
    case 'most-funded':
    case 'raisedAmount':  return { raisedAmount: 'desc' }
    case 'ending-soon':   return { deadline: 'asc' }
    case 'most-donors':   return { donorCount: 'desc' }
    case 'oldest':        return { createdAt: 'asc' }
    case 'newest':
    default:              return { createdAt: 'desc' }
  }
}

export const getAllCampaigns = async (
  query: {
    page?: unknown
    limit?: unknown
    category?: unknown
    status?: unknown
    search?: unknown
    creatorId?: unknown
    sort?: unknown
  },
  isAdmin = false
) => {
  const { skip, take, page, limit } = getPagination(query)

  const where: CampaignWhereInput = {}

  if (!isAdmin) {
    where.status = CampaignStatus.ACTIVE
  } else if (query.status && typeof query.status === 'string') {
    const statusUpper = query.status.toUpperCase()
    if (['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'SUSPENDED'].includes(statusUpper)) {
      where.status = statusUpper as CampaignStatus
    }
  }

  if (query.category && typeof query.category === 'string') {
    where.category = query.category
  }

  if (query.creatorId && typeof query.creatorId === 'string') {
    where.creatorId = query.creatorId
  }

  if (query.search && typeof query.search === 'string') {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const orderBy = buildOrderBy(query.sort)

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      select: CAMPAIGN_SELECT,
      skip,
      take,
      orderBy,
    }),
    prisma.campaign.count({ where }),
  ])

  return {
    campaigns: campaigns.map((c: { status: string; [key: string]: unknown }) => transformCampaign(c)),
    meta: getPaginationMeta(total, page, limit),
  }
}





export const getSupportedCampaigns = async (
  donorId: string,
  query: { page?: unknown; limit?: unknown }
) => {
  const { skip, take, page, limit } = getPagination(query)


  const donatedCampaignRows = await prisma.donation.findMany({
    where: { donorId },
    distinct: ['campaignId'],
    select: { campaignId: true },
    orderBy: { createdAt: 'desc' },
  })

  const campaignIds = donatedCampaignRows.map((r: { campaignId: string }) => r.campaignId)

  if (campaignIds.length === 0) {
    return { campaigns: [], meta: getPaginationMeta(0, 1, take) }
  }

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where: { id: { in: campaignIds } },
      select: CAMPAIGN_SELECT,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.campaign.count({ where: { id: { in: campaignIds } } }),
  ])

  return {
    campaigns: campaigns.map((c: { status: string; [key: string]: unknown }) => transformCampaign(c)),
    meta: getPaginationMeta(total, page, limit),
  }
}

export const getCampaignBySlug = async (slug: string) => {
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    select: {
      ...CAMPAIGN_SELECT,
      comments: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: { select: { id: true, name: true, avatar: true } },
        },
      },
      updates: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
        },
      },
      _count: {
        select: { donations: true, comments: true },
      },
    },
  })

  if (!campaign) throw createHttpError('Campaign not found', 404)

  return transformCampaign(campaign)
}

export const getCampaignById = async (id: string) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    select: CAMPAIGN_SELECT,
  })

  if (!campaign) throw createHttpError('Campaign not found', 404)

  return transformCampaign(campaign)
}

export const getCreatorCampaigns = async (
  creatorId: string,
  query: { page?: unknown; limit?: unknown }
) => {
  const { skip, take, page, limit } = getPagination(query)

  const where: CampaignWhereInput = { creatorId }

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      select: CAMPAIGN_SELECT,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.campaign.count({ where }),
  ])

  return {
    campaigns: campaigns.map((c: { status: string; [key: string]: unknown }) => transformCampaign(c)),
    meta: getPaginationMeta(total, page, limit),
  }
}

export const createCampaign = async (
  creatorId: string,
  data: CreateCampaignInput
) => {
  const user = await prisma.user.findUnique({ where: { id: creatorId }, select: { id: true } })
  if (!user) throw createHttpError('Creator account not found', 404)

  const existingSlugs = await prisma.campaign
    .findMany({ select: { slug: true } })
    .then((rows: Array<{ slug: string }>) => rows.map((row) => row.slug))

  const slug = generateUniqueSlug(data.title, existingSlugs)

  const images = Array.isArray(data.images) ? data.images : []

  const campaign = await prisma.campaign.create({
    data: {
      title: data.title,
      description: data.description,
      story: data.story,
      goalAmount: data.goalAmount,
      category: data.category,
      beneficiaryName: data.beneficiaryName,
      beneficiaryInfo: data.beneficiaryInfo,
      deadline: new Date(data.deadline),
      images,
      slug,
      status: CampaignStatus.DRAFT,
      creatorId,
    },
    select: CAMPAIGN_SELECT,
  })

  return transformCampaign(campaign)
}

export const updateCampaign = async (
  id: string,
  creatorId: string,
  data: UpdateCampaignInput
) => {
  const existing = await prisma.campaign.findUnique({ where: { id } })

  if (!existing) throw createHttpError('Campaign not found', 404)

  if (existing.creatorId !== creatorId) {
    throw createHttpError('Access denied', 403)
  }

  if (
    existing.status === CampaignStatus.COMPLETED ||
    existing.status === CampaignStatus.SUSPENDED
  ) {
    throw createHttpError('Cannot edit this campaign', 403)
  }

  const campaign = await prisma.campaign.update({
    where: { id },
    data: {
      ...data,
      ...(data.status && { status: data.status as CampaignStatus }),
      ...(data.deadline && { deadline: new Date(data.deadline) }),
    },
    select: CAMPAIGN_SELECT,
  })

  return transformCampaign(campaign)
}

export const deleteCampaign = async (
  id: string,
  userId: string,
  userRole: string
) => {
  const existing = await prisma.campaign.findUnique({ where: { id } })

  if (!existing) throw createHttpError('Campaign not found', 404)

  if (userRole === Role.ADMIN) {
    await prisma.campaign.delete({ where: { id } })
    return { message: 'Campaign deleted successfully' }
  }

  if (existing.creatorId !== userId) {
    throw createHttpError('Access denied', 403)
  }

  if (existing.status !== CampaignStatus.DRAFT) {
    throw createHttpError('Only DRAFT campaigns can be deleted', 403)
  }

  await prisma.campaign.delete({ where: { id } })
  return { message: 'Campaign deleted successfully' }
}

export const adminUpdateCampaign = async (id: string, data: AdminUpdateInput) => {
  const existing = await prisma.campaign.findUnique({ where: { id } })

  if (!existing) throw createHttpError('Campaign not found', 404)

  const campaign = await prisma.campaign.update({
    where: { id },
    data: {
      ...data,
      ...(data.status && { status: data.status as CampaignStatus }),
      ...(data.deadline && { deadline: new Date(data.deadline) }),
    },
    select: CAMPAIGN_SELECT,
  })

  return transformCampaign(campaign)
}

export const addCampaignUpdate = async (
  campaignId: string,
  creatorId: string,
  data: AddCampaignUpdateInput
) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, creatorId: true, title: true },
  })

  if (!campaign) throw createHttpError('Campaign not found', 404)

  if (campaign.creatorId !== creatorId) {
    throw createHttpError('Access denied', 403)
  }

  const update = await prisma.campaignUpdate.create({
    data: {
      title: data.title,
      content: data.content,
      campaignId,
    },
  })

  const donations = await prisma.donation.findMany({
    where: { campaignId, status: 'COMPLETED' },
    select: { donorId: true },
    distinct: ['donorId'],
  })

  if (donations.length > 0) {
    await prisma.notification.createMany({
      data: donations.map((d: { donorId: string }) => ({
        type: 'MILESTONE' as const,
        title: `Update: ${campaign.title}`,
        message: data.title,
        userId: d.donorId,
        campaignId,
      })),
    })
  }

  return update
}

export const getCampaignUpdates = async (campaignId: string) => {
  const updates = await prisma.campaignUpdate.findMany({
    where: { campaignId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      campaignId: true,
    },
  })
  return updates
}

export const addCampaignImage = async (
  slug: string,
  creatorId: string,
  imageUrl: string
) => {
  const existing = await prisma.campaign.findUnique({ where: { slug } })

  if (!existing) throw createHttpError('Campaign not found', 404)
  if (existing.creatorId !== creatorId) throw createHttpError('Access denied', 403)

  const campaign = await prisma.campaign.update({
    where: { slug },
    data: { images: { push: imageUrl } },
    select: CAMPAIGN_SELECT,
  })

  return transformCampaign(campaign)
}