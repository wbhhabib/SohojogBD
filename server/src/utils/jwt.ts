import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface JwtPayload {
  id: string
  email: string
  role: string
}

export interface RefreshPayload {
  id: string
}

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions)
}

export const signRefreshToken = (payload: RefreshPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions)
}

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export const verifyRefreshToken = (token: string): RefreshPayload | null => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload
  } catch {
    return null
  }
}