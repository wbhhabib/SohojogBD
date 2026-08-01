import { PaginationMeta } from './response'

interface PaginationQuery {
  page?: unknown
  limit?: unknown
}

interface PaginationResult {
  skip: number
  take: number
  page: number
  limit: number
}

export const getPagination = (query: PaginationQuery): PaginationResult => {
  const page = Math.max(1, parseInt(String(query.page ?? 1)))
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit ?? 10))))
  const skip = (page - 1) * limit

  return { skip, take: limit, page, limit }
}

export const getPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}