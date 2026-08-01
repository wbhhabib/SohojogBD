import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { env } from '../config/env'

interface HttpError extends Error {
  statusCode?: number
}

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,

  next: NextFunction
): void => {

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
    return
  }


  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const fields = (err.meta?.target as string[])?.join(', ') ?? 'field'
        res.status(409).json({
          success: false,
          message: `Already exists: ${fields}`,
        })
        return
      }
      case 'P2025':
        res.status(404).json({
          success: false,
          message: 'Record not found',
        })
        return
      case 'P2003':
        res.status(400).json({
          success: false,
          message: 'Invalid reference',
        })
        return
      default:
        res.status(400).json({
          success: false,
          message: 'Database error',
        })
        return
    }
  }


  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      success: false,
      message: 'Token expired',
    })
    return
  }


  if (err instanceof JsonWebTokenError) {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    })
    return
  }


  if (err instanceof Error && (err as HttpError).statusCode) {
    const httpErr = err as HttpError
    res.status(httpErr.statusCode!).json({
      success: false,
      message: httpErr.message,
    })
    return
  }


  const message =
    err instanceof Error ? err.message : 'Internal server error'

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(env.NODE_ENV === 'development' && {
      detail: message,
      stack: err instanceof Error ? err.stack : undefined,
    }),
  })
}