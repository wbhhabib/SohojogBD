import { PoolStatus } from '../../types/prisma-enums'
import { prisma } from '../../config/database'
import { generateUniqueSlug } from '../../utils/slug'
import { getPagination, getPaginationMeta } from '../../utils/pagination'
import { checkCompleteness } from '../verification/verification.service'
import { CreatePoolInput, JoinPoolInput } from './pool.schema'

const createHttpError = (message: string, statusCode: number) => {
    const err = new Error(message) as Error & { statusCode: number; missingFields?: string[] }
    err.statusCode = statusCode
    return err
}

const ensureVerificationReady = async (userId: string) => {
    const { ready, missingFields } = await checkCompleteness(userId, 'WHOLESALE_JOIN')
    if (!ready) {
        const err = createHttpError(
            'Please complete your verification profile before joining or creating a wholesale pool',
            403
        ) as Error & { missingFields?: string[] }
        err.missingFields = missingFields
        throw err
    }
}

const PERSON_SELECT = { id: true, name: true, avatar: true } as const

const POOL_SELECT = {
    id: true,
    slug: true,
    title: true,
    description: true,
    category: true,
    unit: true,
    targetQuantity: true,
    minJoinQuantity: true,
    pricePerUnit: true,
    marketPricePerUnit: true,
    division: true,
    district: true,
    upazila: true,
    location: true,
    contactPhone: true,
    groupLink: true,
    images: true,
    status: true,
    deadline: true,
    createdAt: true,
    ownerId: true,
    owner: { select: PERSON_SELECT },
    participants: {
        orderBy: { createdAt: 'asc' as const },
        select: {
            id: true,
            quantity: true,
            note: true,
            createdAt: true,
            participant: { select: PERSON_SELECT },
        },
    },
} as const

interface PoolWhereInput {
    status?: { in: (typeof PoolStatus)[keyof typeof PoolStatus][] }
    category?: string
    division?: string
    district?: string
    upazila?: string
    ownerId?: string
    OR?: Array<{
        title?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
        location?: { contains: string; mode: 'insensitive' }
    }>
}

const joinedQuantity = (pool: { participants: { quantity: number }[] }) =>
    pool.participants.reduce((sum, p) => sum + p.quantity, 0)

export const getAllPools = async (query: {
    page?: unknown
    limit?: unknown
    search?: unknown
    category?: unknown
    division?: unknown
    district?: unknown
    upazila?: unknown
}) => {
    const { skip, take, page, limit } = getPagination(query)

    const where: PoolWhereInput = {
        status: { in: [PoolStatus.OPEN, PoolStatus.TARGET_REACHED] },
    }

    if (query.category && typeof query.category === 'string' && query.category !== 'All') {
        where.category = query.category
    }
    if (query.division && typeof query.division === 'string' && query.division !== 'All') {
        where.division = query.division
    }
    if (query.district && typeof query.district === 'string' && query.district !== 'All') {
        where.district = query.district
    }
    if (query.upazila && typeof query.upazila === 'string' && query.upazila !== 'All') {
        where.upazila = query.upazila
    }
    if (query.search && typeof query.search === 'string') {
        where.OR = [
            { title: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
            { location: { contains: query.search, mode: 'insensitive' } },
        ]
    }

    const [pools, total] = await Promise.all([
        prisma.wholesalePool.findMany({
            where,
            select: POOL_SELECT,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.wholesalePool.count({ where }),
    ])

    return { pools, meta: getPaginationMeta(total, page, limit) }
}

export const getPoolBySlug = async (slug: string) => {
    const pool = await prisma.wholesalePool.findUnique({
        where: { slug },
        select: POOL_SELECT,
    })
    if (!pool) throw createHttpError('Pool not found', 404)
    return pool
}

export const getMyPools = async (ownerId: string, query: { page?: unknown; limit?: unknown }) => {
    const { skip, take, page, limit } = getPagination(query)
    const where = { ownerId }

    const [pools, total] = await Promise.all([
        prisma.wholesalePool.findMany({
            where,
            select: POOL_SELECT,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.wholesalePool.count({ where }),
    ])

    return { pools, meta: getPaginationMeta(total, page, limit) }
}

export const getJoinedPools = async (userId: string, query: { page?: unknown; limit?: unknown }) => {
    const { skip, take, page, limit } = getPagination(query)
    const where = { participants: { some: { participantId: userId } } }

    const [pools, total] = await Promise.all([
        prisma.wholesalePool.findMany({
            where,
            select: POOL_SELECT,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.wholesalePool.count({ where }),
    ])

    return { pools, meta: getPaginationMeta(total, page, limit) }
}

export const createPool = async (ownerId: string, data: CreatePoolInput) => {
    await ensureVerificationReady(ownerId)

    const existingSlugs = await prisma.wholesalePool
        .findMany({ select: { slug: true } })
        .then((rows: Array<{ slug: string }>) => rows.map((row) => row.slug))

    const slug = generateUniqueSlug(data.title, existingSlugs)

    const pool = await prisma.wholesalePool.create({
        data: {
            title: data.title,
            description: data.description,
            category: data.category,
            unit: data.unit,
            targetQuantity: data.targetQuantity,
            minJoinQuantity: data.minJoinQuantity,
            pricePerUnit: data.pricePerUnit,
            marketPricePerUnit: data.marketPricePerUnit,
            division: data.division,
            district: data.district,
            upazila: data.upazila,
            location: data.location,
            contactPhone: data.contactPhone,
            groupLink: data.groupLink || null,
            images: Array.isArray(data.images) ? data.images : [],
            deadline: data.deadline,
            slug,
            status: PoolStatus.OPEN,
            ownerId,
        },
        select: POOL_SELECT,
    })

    return pool
}

export const joinPool = async (poolId: string, userId: string, data: JoinPoolInput) => {
    await ensureVerificationReady(userId)

    const pool = await prisma.wholesalePool.findUnique({
        where: { id: poolId },
        include: { participants: true },
    })
    if (!pool) throw createHttpError('Pool not found', 404)
    if (pool.ownerId === userId) throw createHttpError('You cannot join your own pool', 400)
    if (pool.status !== PoolStatus.OPEN && pool.status !== PoolStatus.TARGET_REACHED) {
        throw createHttpError('This pool is no longer accepting participants', 400)
    }
    const alreadyIn = pool.participants.some((p: { participantId: string }) => p.participantId === userId)
    if (alreadyIn) throw createHttpError('You have already joined this pool', 400)
    if (data.quantity < pool.minJoinQuantity) {
        throw createHttpError(`Minimum join quantity is ${pool.minJoinQuantity}`, 400)
    }

    await prisma.poolParticipant.create({
        data: {
            poolId,
            participantId: userId,
            quantity: data.quantity,
            note: data.note,
        },
    })

    const updatedTotal = joinedQuantity(pool) + data.quantity
    if (updatedTotal >= pool.targetQuantity && pool.status === PoolStatus.OPEN) {
        await prisma.wholesalePool.update({
            where: { id: poolId },
            data: { status: PoolStatus.TARGET_REACHED },
        })
    }

    await prisma.notification.create({
        data: {
            type: 'SYSTEM',
            title: 'New participant joined your pool',
            message: `Someone joined "${pool.title}"`,
            userId: pool.ownerId,
        },
    })

    return prisma.wholesalePool.findUnique({ where: { id: poolId }, select: POOL_SELECT })
}

export const leavePool = async (poolId: string, userId: string) => {
    const pool = await prisma.wholesalePool.findUnique({
        where: { id: poolId },
        include: { participants: true },
    })
    if (!pool) throw createHttpError('Pool not found', 404)

    const participation = pool.participants.find((p: { participantId: string }) => p.participantId === userId)
    if (!participation) throw createHttpError('You have not joined this pool', 400)

    await prisma.poolParticipant.delete({ where: { id: participation.id } })

    const remainingQuantity = joinedQuantity(pool) - participation.quantity
    if (pool.status === PoolStatus.TARGET_REACHED && remainingQuantity < pool.targetQuantity) {
        await prisma.wholesalePool.update({
            where: { id: poolId },
            data: { status: PoolStatus.OPEN },
        })
    }

    return { message: 'You have left the pool' }
}

export const cancelPool = async (poolId: string, ownerId: string) => {
    const pool = await prisma.wholesalePool.findUnique({ where: { id: poolId } })
    if (!pool) throw createHttpError('Pool not found', 404)
    if (pool.ownerId !== ownerId) throw createHttpError('Access denied', 403)

    await prisma.wholesalePool.update({
        where: { id: poolId },
        data: { status: PoolStatus.CANCELLED },
    })

    return { message: 'Pool cancelled' }
}