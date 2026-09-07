import { Request, Response, NextFunction } from 'express'
import { Role } from '../types/prisma-enums'
import { verifyAccessToken } from '../utils/jwt'
import { sendError } from '../utils/response'
import { prisma } from '../config/database'

// JWT নিজে থেকে শুধু signature আর expiry ভ্যালিড কিনা বলে — এটা "stateless"।
// তার মানে কাউকে ব্যান করার পরেও তার হাতে থাকা পুরনো access token exp পর্যন্ত
// (ডিফল্ট ১৫ মিনিট) পুরোপুরি ভ্যালিড থেকে যেত, কারণ কোথাও DB গিয়ে isBanned
// চেক করা হতো না। এখানে প্রতিটা authenticated request-এ হালকা একটা DB lookup
// করে (শুধু id/role/isBanned — 3 কলাম, ইনডেক্সড primary key দিয়ে, তাই cost কম)
// current ban-status আর current role রিফ্রেশ করা হচ্ছে। এতে দুইটা জিনিস
// নিশ্চিত হয়:
//   ১) ব্যান করা মাত্র (refresh/re-login-এর অপেক্ষা ছাড়াই) সেই ইউজারের
//      পরবর্তী যেকোনো protected request 403 পাবে।
//   ২) কারো role পরিবর্তন হলে (promote/demote) পুরনো টোকেনে থাকা স্টেল role
//      দিয়ে privilege escalation/leftover-access হবে না — সবসময় DB-এর
//      বর্তমান role ব্যবহার হচ্ছে।
const getLiveUserOrFail = async (
  userId: string
): Promise<{ id: string; role: string; isBanned: boolean } | null> => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isBanned: true },
  })
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication required', 401)
    return
  }

  const token = authHeader.split(' ')[1]
  const payload = verifyAccessToken(token)

  if (!payload) {
    sendError(res, 'Invalid or expired token', 401)
    return
  }

  let liveUser
  try {
    liveUser = await getLiveUserOrFail(payload.id)
  } catch {
    sendError(res, 'Authentication failed, please try again', 500)
    return
  }

  if (!liveUser) {
    // ইউজার ডিলিট হয়ে গেছে কিন্তু পুরনো টোকেন এখনও কারো হাতে আছে
    sendError(res, 'Invalid or expired token', 401)
    return
  }

  if (liveUser.isBanned) {
    sendError(
      res,
      'Your account has been suspended. Please contact support.',
      403,
      { code: 'ACCOUNT_BANNED' }
    )
    return
  }

  req.user = {
    id: liveUser.id,
    email: payload.email,
    role: liveUser.role as 'USER' | 'ADMIN',
  }

  next()
}

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role as Role)) {
      sendError(res, 'Access denied', 403)
      return
    }
    next()
  }
}

export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next()
    return
  }

  const token = authHeader.split(' ')[1]
  const payload = verifyAccessToken(token)

  if (payload) {
    try {
      const liveUser = await getLiveUserOrFail(payload.id)
      // optional-auth রুটে ব্যান হওয়া ইউজারকে হার্ড 403 দিয়ে ব্লক করার দরকার
      // নেই (এগুলো পাবলিক রুট) — শুধু তাকে "unauthenticated" হিসেবে treat
      // করাই যথেষ্ট, যাতে সে verified-viewer-only ডেটা/actions না পায়।
      if (liveUser && !liveUser.isBanned) {
        req.user = {
          id: liveUser.id,
          email: payload.email,
          role: liveUser.role as 'USER' | 'ADMIN',
        }
      }
    } catch {
      // DB না পেলে fail-open করে "unauthenticated" হিসেবে চালিয়ে যাওয়া হচ্ছে,
      // কারণ এটা optional-auth পাবলিক রুট — পুরো request ৫০০ করে দেওয়া ঠিক না
    }
  }

  next()
}