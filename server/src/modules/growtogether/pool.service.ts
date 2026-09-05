import { PoolStatus } from '../../types/prisma-enums'
import { prisma } from '../../config/database'
import { generateUniqueSlug } from '../../utils/slug'
import { getPagination, getPaginationMeta } from '../../utils/pagination'
import { checkCompleteness, isUserVerified } from '../verification/verification.service'
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

    // ফিল্ড ভরা থাকলেও admin এখনো approve করেনি এমন অবস্থা এখানে ধরা হচ্ছে —
    // শুধু ফর্ম জমা দেওয়া যথেষ্ট না, actual VERIFIED status লাগবে
    const verified = await isUserVerified(userId)
    if (!verified) {
        throw createHttpError(
            'Your verification is still pending admin approval. Please wait until it is approved before creating or joining a wholesale pool.',
            403
        )
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
    division: true,
    district: true,
    upazila: true,
    location: true,
    contactPhone: true,
    groupLink: true,
    facebookLink: true,
    images: true,
    status: true,
    createdAt: true,
    ownerId: true,
    owner: { select: PERSON_SELECT },
    participants: {
        orderBy: { createdAt: 'asc' as const },
        select: {
            id: true,
            note: true,
            createdAt: true,
            participant: { select: PERSON_SELECT },
        },
    },
} as const

interface PoolWhereInput {
    status?: PoolStatus
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

    const where: PoolWhereInput = { status: PoolStatus.OPEN }

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

// contact info (phone/whatsapp/facebook) শুধু owner অথবা admin-approved
// VERIFIED viewer-কে দেখানো হয়; বাকি সবার জন্য null পাঠানো হয়
export const getPoolBySlug = async (slug: string, viewerId?: string) => {
    const pool = await prisma.wholesalePool.findUnique({
        where: { slug },
        select: POOL_SELECT,
    })
    if (!pool) throw createHttpError('Pool not found', 404)

    const isOwner = !!viewerId && viewerId === pool.ownerId
    const verified = !isOwner && !!viewerId && (await isUserVerified(viewerId))
    if (isOwner || verified) return pool

    return { ...pool, contactPhone: null, groupLink: null, facebookLink: null }
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
            division: data.division,
            district: data.district,
            upazila: data.upazila,
            location: data.location,
            contactPhone: data.contactPhone,
            groupLink: data.groupLink,
            facebookLink: data.facebookLink || null,
            images: Array.isArray(data.images) ? data.images : [],
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
    if (pool.status !== PoolStatus.OPEN) {
        throw createHttpError('This pool is no longer accepting participants', 400)
    }
    const alreadyIn = pool.participants.some((p: { participantId: string }) => p.participantId === userId)
    if (alreadyIn) throw createHttpError('You have already joined this pool', 400)

    await prisma.poolParticipant.create({
        data: {
            poolId,
            participantId: userId,
            note: data.note,
        },
    })

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