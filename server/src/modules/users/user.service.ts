
import { Role } from '../../types/prisma-enums'
import { prisma } from '../../config/database'
import { toRole } from '../../utils/transform'
import { getPagination, getPaginationMeta } from '../../utils/pagination'
import { UpdateProfileInput } from './user.schema'

const createHttpError = (message: string, statusCode: number) => {
  const err = new Error(message) as Error & { statusCode: number }
  err.statusCode = statusCode
  return err
}


interface UserWhereInput {
  role?: Role
  isBanned?: boolean
  OR?: Array<{
    name?: { contains: string; mode: 'insensitive' }
    email?: { contains: string; mode: 'insensitive' }
  }>
}

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  phone: true,
  address: true,
  isVerified: true,
  isBanned: true,
  createdAt: true,
  updatedAt: true,
} as const

const transformUser = (user: {
  role: string
  id: string
  name: string
  email: string
  avatar: string | null
  phone: string | null
  address: string | null
  isVerified: boolean
  isBanned: boolean
  createdAt: Date
  updatedAt: Date
}) => ({
  ...user,
  role: toRole(user.role as Role),
})

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: USER_SELECT,
  })

  if (!user) throw createHttpError('User not found', 404)

  return transformUser(user)
}

export const updateProfile = async (
  userId: string,
  data: UpdateProfileInput
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: USER_SELECT,
  })

  return transformUser(user)
}


export const updateAvatar = async (userId: string, avatarUrl: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
    select: USER_SELECT,
  })

  return transformUser(user)
}

export const getAllUsers = async (query: {
  page?: unknown
  limit?: unknown
  role?: unknown
  isBanned?: unknown
  search?: unknown
  sort?: unknown
}) => {
  const { skip, take, page, limit } = getPagination(query)

  const where: UserWhereInput = {}

  if (query.role && typeof query.role === 'string') {
    const roleUpper = query.role.toUpperCase()
    if (['DONOR', 'CREATOR', 'ADMIN'].includes(roleUpper)) {
      where.role = roleUpper as Role
    }
  }

  if (query.isBanned !== undefined) {
    where.isBanned = query.isBanned === 'true'
  }

  if (query.search && typeof query.search === 'string') {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: USER_SELECT,
      skip,
      take,
      orderBy: query.sort === 'oldest'
        ? { createdAt: 'asc' }
        : { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  return {
    users: users.map(transformUser),
    meta: getPaginationMeta(total, page, limit),
  }
}

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: USER_SELECT,
  })

  if (!user) throw createHttpError('User not found', 404)

  return transformUser(user)
}

export const banUser = async (id: string, adminId: string) => {
  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  })

  if (!target) throw createHttpError('User not found', 404)

  if (target.role === Role.ADMIN) {
    throw createHttpError('Cannot ban another admin', 403)
  }

  if (id === adminId) {
    throw createHttpError('Cannot ban yourself', 403)
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isBanned: true },
    select: USER_SELECT,
  })

  return transformUser(user)
}

export const unbanUser = async (id: string) => {
  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!target) throw createHttpError('User not found', 404)

  const user = await prisma.user.update({
    where: { id },
    data: { isBanned: false },
    select: USER_SELECT,
  })

  return transformUser(user)
}

export const deleteUser = async (id: string, adminId: string) => {
  if (id === adminId) {
    throw createHttpError('Cannot delete yourself', 403)
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!target) throw createHttpError('User not found', 404)

  await prisma.user.delete({ where: { id } })

  return { message: 'User deleted successfully' }
}