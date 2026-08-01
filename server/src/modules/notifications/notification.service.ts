
import { prisma } from '../../config/database'
import { NotifType } from '../../types/prisma-enums'
import { PaginationMeta } from '@/utils/response'

const NOTIF_SELECT = {
  id: true,
  type: true,
  title: true,
  message: true,
  isRead: true,
  createdAt: true,
  campaign: {
    select: {
      id: true,
      title: true,
      slug: true,
    },
  },
} as const

interface NotifQuery {
  page?: string
  limit?: string
  isRead?: string
}

interface CreateNotificationData {
  userId: string
  type: NotifType
  title: string
  message: string
  campaignId?: string
}

export const getUserNotifications = async (
  userId: string,
  query: NotifQuery
): Promise<{ notifications: unknown[]; meta: PaginationMeta }> => {
  const page  = Math.max(1, parseInt(query.page  ?? '1',  10))
  const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? '10', 10)))
  const skip  = (page - 1) * limit

  const where: { userId: string; isRead?: boolean } = { userId }

  if (query.isRead !== undefined) {
    where.isRead = query.isRead === 'true'
  }

  const [notifications, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      select: NOTIF_SELECT,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ])

  return {
    notifications,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export const markAsRead = async (id: string, userId: string): Promise<unknown> => {
  const notification = await prisma.notification.findUnique({
    where: { id },
    select: { id: true, userId: true },
  })

  if (!notification) {
    const err = new Error('Notification not found')
    ;(err as NodeJS.ErrnoException).code = '404'
    throw err
  }

  if (notification.userId !== userId) {
    const err = new Error('Forbidden: You do not own this notification')
    ;(err as NodeJS.ErrnoException).code = '403'
    throw err
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
    select: NOTIF_SELECT,
  })

  return updated
}

export const markAllAsRead = async (userId: string): Promise<{ count: number }> => {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })

  return { count: result.count }
}

export const getUnreadCount = async (userId: string): Promise<{ count: number }> => {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  })

  return { count }
}

export const createNotification = async (data: CreateNotificationData): Promise<void> => {
  try {
    await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        ...(data.campaignId ? { campaignId: data.campaignId } : {}),
      },
    })
  } catch (error) {
    console.error('[createNotification] Failed to create notification:', error)
  }
}