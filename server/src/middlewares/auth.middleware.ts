import { Request, Response, NextFunction } from 'express'
import { Role } from '../types/prisma-enums'
import { verifyAccessToken } from '../utils/jwt'
import { sendError } from '../utils/response'

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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

  req.user = {
    id: payload.id,
    email: payload.email,
    role: payload.role as 'DONOR' | 'CREATOR' | 'ADMIN',
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