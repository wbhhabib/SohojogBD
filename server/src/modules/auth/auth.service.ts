import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/config/database'
import { hashPassword, comparePassword } from '@/utils/bcrypt'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt'
import { sendPasswordResetEmail } from '@/utils/email'
import { toRole } from '@/utils/transform'
import { RegisterInput, LoginInput } from './auth.schema'

const createHttpError = (message: string, statusCode: number) => {
  const err = new Error(message) as Error & { statusCode: number }
  err.statusCode = statusCode
  return err
}

const omitPassword = <T extends { password: string }>(user: T) => {
  const { password: _, ...rest } = user
  return rest
}

export const register = async (data: RegisterInput) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existing) {
    throw createHttpError('Email already registered', 409)
  }

  const hashed = await hashPassword(data.password)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      role: data.role,
      isVerified: true,
    },
  })

  return {
    ...omitPassword(user),
    role: toRole(user.role),
  }
}

export const verifyEmail = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: { verifyToken: token },
  })

  if (!user) {
    throw createHttpError('Invalid or expired verification token', 400)
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verifyToken: null },
  })

  return { message: 'Email verified successfully' }
}

export const login = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (!user) {
    throw createHttpError('Invalid credentials', 401)
  }

  if (user.isBanned) {
    throw createHttpError('Account suspended', 403)
  }

  const isMatch = await comparePassword(data.password, user.password)

  if (!isMatch) {
    throw createHttpError('Invalid credentials', 401)
  }

  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  })

  const refreshToken = signRefreshToken({ id: user.id })

  return {
    user: {
      ...omitPassword(user),
      role: toRole(user.role),
    },
    accessToken,
    refreshToken,
  }
}

export const refreshToken = async (token: string) => {
  const payload = verifyRefreshToken(token)

  if (!payload) {
    throw createHttpError('Invalid refresh token', 401)
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
  })

  if (!user) {
    throw createHttpError('User not found', 401)
  }

  if (user.isBanned) {
    throw createHttpError('Account suspended', 403)
  }

  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  })

  return { accessToken }
}

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } })

  if (user) {
    const resetToken = uuidv4()
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    })

    await sendPasswordResetEmail(user.email, user.name, resetToken)
  }

  return { message: 'If this email exists, a reset link has been sent' }
}

export const resetPassword = async (token: string, newPassword: string) => {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  })

  if (!user) {
    throw createHttpError('Invalid or expired reset token', 400)
  }

  const hashed = await hashPassword(newPassword)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      resetToken: null,
      resetTokenExpiry: null,
    },
  })

  return { message: 'Password reset successfully' }
}

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    throw createHttpError('User not found', 404)
  }

  const isMatch = await comparePassword(currentPassword, user.password)

  if (!isMatch) {
    throw createHttpError('Current password incorrect', 400)
  }

  const hashed = await hashPassword(newPassword)

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  })

  return { message: 'Password changed successfully' }
}


export const issueTokens = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    throw createHttpError('User not found', 404)
  }

  if (user.isBanned) {
    throw createHttpError('Account suspended', 403)
  }

  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  })

  const refreshToken = signRefreshToken({ id: user.id })

  return { accessToken, refreshToken }
}