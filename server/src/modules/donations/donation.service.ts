import { DonationStatus, CampaignStatus } from '../../types/prisma-enums'
import { prisma } from '../../config/database'
import { toDonationStatus, toCampaignStatus } from '../../utils/transform'
import { getPagination, getPaginationMeta } from '../../utils/pagination'
import { sendDonationConfirmation, sendDonationNotification } from '../../utils/email'
import { CreateDonationInput } from './donation.schema'

const createHttpError = (message: string, statusCode: number) => {
  const err = new Error(message) as Error & { statusCode: number }
  err.statusCode = statusCode
  return err
}

const DONATION_SELECT = {
  id: true,
  amount: true,
  message: true,
  isAnonymous: true,
  status: true,
  createdAt: true,
  campaign: {
    select: {
      id: true,
      title: true,
      slug: true,
      images: true,
    },
  },
  donor: {
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  },
} as const

type DonationRow = {
  isAnonymous: boolean
  donor: { id: string; name: string; email: string; avatar: string | null }
  status: string
  [key: string]: unknown
}

const maskAnonymous = (donation: DonationRow) => {
  if (donation.isAnonymous) {
    return {
      ...donation,
      status: toDonationStatus(donation.status as DonationStatus),
      donor: { id: 'anonymous', name: 'Anonymous', email: '', avatar: null },
    }
  }
  return { ...donation, status: toDonationStatus(donation.status as DonationStatus) }
}


interface DonationWhereInput {
  donorId?: string
  campaignId?: string
  status?: DonationStatus
  campaign?: { creatorId?: string }
  createdAt?: { gte?: Date }
}






function buildDateFilter(days: unknown): DonationWhereInput {
  if (!days || typeof days !== 'string') return {}
  const parsed = parseInt(days, 10)
  if (isNaN(parsed) || parsed <= 0) return {}
  const since = new Date()
  since.setDate(since.getDate() - parsed)
  return { createdAt: { gte: since } }
}

export const initiateDonation = async (
  donorId: string,
  data: CreateDonationInput
) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: data.campaignId },
    select: { id: true, status: true, deadline: true, title: true },
  })
  if (!campaign) throw createHttpError('Campaign not found', 404)
  if (campaign.status !== CampaignStatus.ACTIVE)
    throw createHttpError('Campaign is not accepting donations', 400)
  if (new Date() > campaign.deadline)
    throw createHttpError('Campaign deadline has passed', 400)

  const donation = await prisma.donation.create({
    data: {
      amount: data.amount,
      message: data.message,
      isAnonymous: data.isAnonymous,
      status: DonationStatus.PENDING,
      donorId,
      campaignId: data.campaignId,
    },
    select: { id: true },
  })
  return { donationId: donation.id }
}

export const completeDonation = async (donationId: string) => {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    select: {
      id: true, status: true, amount: true, campaignId: true, donorId: true,
      donor: { select: { name: true, email: true } },
      campaign: {
        select: {
          id: true, title: true, goalAmount: true, raisedAmount: true, creatorId: true,
          creator: { select: { name: true, email: true } },
        },
      },
    },
  })
  if (!donation) throw createHttpError('Donation not found', 404)
  if (donation.status !== DonationStatus.PENDING)
    throw createHttpError('Donation already processed', 400)

  const [updatedDonation, updatedCampaign] = await prisma.$transaction([
    prisma.donation.update({
      where: { id: donationId },
      data: { status: DonationStatus.COMPLETED },
    }),
    prisma.campaign.update({
      where: { id: donation.campaignId },
      data: { raisedAmount: { increment: donation.amount }, donorCount: { increment: 1 } },
    }),
  ])

  if (updatedCampaign.raisedAmount >= updatedCampaign.goalAmount) {
    await prisma.campaign.update({
      where: { id: donation.campaignId },
      data: { status: CampaignStatus.COMPLETED },
    })
  }

  await prisma.notification.create({
    data: {
      type: 'DONATION', title: 'Donation Successful',
      message: `Your donation of ৳${donation.amount.toLocaleString()} to "${donation.campaign.title}" was successful.`,
      userId: donation.donorId, campaignId: donation.campaignId,
    },
  })
  await prisma.notification.create({
    data: {
      type: 'DONATION', title: 'New Donation Received',
      message: `Your campaign "${donation.campaign.title}" received a donation of ৳${donation.amount.toLocaleString()}.`,
      userId: donation.campaign.creatorId, campaignId: donation.campaignId,
    },
  })

  sendDonationConfirmation(donation.donor.email, donation.donor.name, donation.campaign.title, donation.amount)
  sendDonationNotification(donation.campaign.creator.email, donation.campaign.creator.name, donation.campaign.title, donation.amount)

  return updatedDonation
}


export const getDonorDonations = async (
  donorId: string,
  query: { page?: unknown; limit?: unknown; days?: unknown }
) => {
  const { skip, take, page, limit } = getPagination(query)

  const where: DonationWhereInput = {
    donorId,
    ...buildDateFilter(query.days),
  }

  const [donations, total] = await Promise.all([
    prisma.donation.findMany({ where, select: DONATION_SELECT, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.donation.count({ where }),
  ])

  return {
    donations: donations.map((d: { status: string; [key: string]: unknown }) => ({ ...d, status: toDonationStatus(d.status as DonationStatus) })),
    meta: getPaginationMeta(total, page, limit),
  }
}

export const getCampaignDonations = async (
  campaignId: string,
  query: { page?: unknown; limit?: unknown }
) => {
  const { skip, take, page, limit } = getPagination(query)
  const where: DonationWhereInput = { campaignId, status: DonationStatus.COMPLETED }

  const [donations, total] = await Promise.all([
    prisma.donation.findMany({ where, select: DONATION_SELECT, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.donation.count({ where }),
  ])

  return { donations: donations.map((d: DonationRow) => maskAnonymous(d)), meta: getPaginationMeta(total, page, limit) }
}


export const getCreatorDonations = async (
  creatorId: string,
  query: { page?: unknown; limit?: unknown; days?: unknown; campaignId?: unknown }
) => {
  const { skip, take, page, limit } = getPagination(query)

  const where: DonationWhereInput = {
    campaign: { creatorId },
    ...buildDateFilter(query.days),
  }

  if (query.campaignId && typeof query.campaignId === 'string') {
    where.campaignId = query.campaignId
  }

  const [donations, total] = await Promise.all([
    prisma.donation.findMany({ where, select: DONATION_SELECT, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.donation.count({ where }),
  ])

  return { donations: donations.map((d: DonationRow) => maskAnonymous(d)), meta: getPaginationMeta(total, page, limit) }
}


export const getAllDonations = async (query: {
  page?: unknown
  limit?: unknown
  status?: unknown
  campaignId?: unknown
  days?: unknown
}) => {
  const { skip, take, page, limit } = getPagination(query)

  const where: DonationWhereInput = {
    ...buildDateFilter(query.days),
  }

  if (query.status && typeof query.status === 'string') {
    const statusUpper = query.status.toUpperCase()
    if (['PENDING', 'COMPLETED', 'REFUNDED'].includes(statusUpper)) {
      where.status = statusUpper as DonationStatus
    }
  }

  if (query.campaignId && typeof query.campaignId === 'string') {
    where.campaignId = query.campaignId
  }

  const [donations, total] = await Promise.all([
    prisma.donation.findMany({ where, select: DONATION_SELECT, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.donation.count({ where }),
  ])

  return {
    donations: donations.map((d: { status: string; [key: string]: unknown }) => ({ ...d, status: toDonationStatus(d.status as DonationStatus) })),
    meta: getPaginationMeta(total, page, limit),
  }
}

export const getDonationById = async (donationId: string, userId: string, userRole: string) => {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    select: DONATION_SELECT,
  })
  if (!donation) throw createHttpError('Donation not found', 404)
  if (userRole !== 'ADMIN' && donation.donor.id !== userId)
    throw createHttpError('Access denied', 403)

  return { ...donation, status: toDonationStatus(donation.status as DonationStatus) }
}