import { PlantListingStatus, PlantClaimStatus, Role } from '../../types/prisma-enums'
import { prisma } from '../../config/database'
import { generateUniqueSlug } from '../../utils/slug'
import { getPagination, getPaginationMeta } from '../../utils/pagination'
import {
    CreatePlantListingInput,
    UpdatePlantListingInput,
    CreatePlantClaimInput,
} from './plant.schema'

const createHttpError = (message: string, statusCode: number) => {
    const err = new Error(message) as Error & { statusCode: number }
    err.statusCode = statusCode
    return err
}

const LISTING_SELECT = {
    id: true,
    title: true,
    slug: true,
    description: true,
    plantType: true,
    quantity: true,
    images: true,
    location: true,
    contactPhone: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    ownerId: true,
    owner: {
        select: { id: true, name: true, avatar: true, email: true },
    },
    _count: { select: { claims: true } },
} as const

interface ListingWhereInput {
    status?: PlantListingStatus
    plantType?: string
    ownerId?: string
    OR?: Array<{
        title?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
        location?: { contains: string; mode: 'insensitive' }
    }>
}

export const getAllListings = async (query: {
    page?: unknown
    limit?: unknown
    plantType?: unknown
    search?: unknown
    location?: unknown
}) => {
    const { skip, take, page, limit } = getPagination(query)

    const where: ListingWhereInput = { status: PlantListingStatus.AVAILABLE }

    if (query.plantType && typeof query.plantType === 'string') {
        where.plantType = query.plantType
    }

    if (query.search && typeof query.search === 'string') {
        where.OR = [
            { title: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
            { location: { contains: query.search, mode: 'insensitive' } },
        ]
    }

    const [listings, total] = await Promise.all([
        prisma.plantListing.findMany({
            where,
            select: LISTING_SELECT,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.plantListing.count({ where }),
    ])

    return { listings, meta: getPaginationMeta(total, page, limit) }
}

export const getListingBySlug = async (slug: string) => {
    const listing = await prisma.plantListing.findUnique({
        where: { slug },
        select: LISTING_SELECT,
    })

    if (!listing) throw createHttpError('Plant listing not found', 404)

    return listing
}

export const getMyListings = async (
    ownerId: string,
    query: { page?: unknown; limit?: unknown }
) => {
    const { skip, take, page, limit } = getPagination(query)

    const [listings, total] = await Promise.all([
        prisma.plantListing.findMany({
            where: { ownerId },
            select: LISTING_SELECT,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.plantListing.count({ where: { ownerId } }),
    ])

    return { listings, meta: getPaginationMeta(total, page, limit) }
}

export const getMyListingById = async (id: string, ownerId: string) => {
    const listing = await prisma.plantListing.findUnique({
        where: { id },
        select: {
            ...LISTING_SELECT,
            claims: {
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    message: true,
                    status: true,
                    createdAt: true,
                    claimant: { select: { id: true, name: true, avatar: true, phone: true } },
                },
            },
        },
    })

    if (!listing) throw createHttpError('Plant listing not found', 404)
    if (listing.ownerId !== ownerId) throw createHttpError('Access denied', 403)

    return listing
}

export const createListing = async (ownerId: string, data: CreatePlantListingInput) => {
    const existingSlugs = await prisma.plantListing
        .findMany({ select: { slug: true } })
        .then((rows: Array<{ slug: string }>) => rows.map((row) => row.slug))

    const slug = generateUniqueSlug(data.title, existingSlugs)

    const listing = await prisma.plantListing.create({
        data: {
            title: data.title,
            description: data.description,
            plantType: data.plantType,
            quantity: data.quantity,
            location: data.location,
            contactPhone: data.contactPhone,
            images: Array.isArray(data.images) ? data.images : [],
            slug,
            status: PlantListingStatus.AVAILABLE,
            ownerId,
        },
        select: LISTING_SELECT,
    })

    return listing
}

export const updateListing = async (
    id: string,
    ownerId: string,
    data: UpdatePlantListingInput
) => {
    const existing = await prisma.plantListing.findUnique({ where: { id } })

    if (!existing) throw createHttpError('Plant listing not found', 404)
    if (existing.ownerId !== ownerId) throw createHttpError('Access denied', 403)

    if (existing.status === PlantListingStatus.COMPLETED) {
        throw createHttpError('Cannot edit a completed listing', 403)
    }

    const listing = await prisma.plantListing.update({
        where: { id },
        data: {
            ...data,
            ...(data.status && { status: data.status as PlantListingStatus }),
        },
        select: LISTING_SELECT,
    })

    return listing
}

export const deleteListing = async (id: string, userId: string, userRole: string) => {
    const existing = await prisma.plantListing.findUnique({ where: { id } })

    if (!existing) throw createHttpError('Plant listing not found', 404)

    if (userRole !== Role.ADMIN && existing.ownerId !== userId) {
        throw createHttpError('Access denied', 403)
    }

    await prisma.plantListing.delete({ where: { id } })
    return { message: 'Plant listing deleted successfully' }
}

export const addListingImages = async (
    id: string,
    ownerId: string,
    imageUrls: string[]
) => {
    const existing = await prisma.plantListing.findUnique({ where: { id } })

    if (!existing) throw createHttpError('Plant listing not found', 404)
    if (existing.ownerId !== ownerId) throw createHttpError('Access denied', 403)

    const listing = await prisma.plantListing.update({
        where: { id },
        data: { images: { push: imageUrls } },
        select: LISTING_SELECT,
    })

    return listing
}

// ── Claims ──────────────────────────────────────────────────────────────────

export const createClaim = async (
    listingId: string,
    claimantId: string,
    data: CreatePlantClaimInput
) => {
    const listing = await prisma.plantListing.findUnique({ where: { id: listingId } })

    if (!listing) throw createHttpError('Plant listing not found', 404)
    if (listing.ownerId === claimantId) {
        throw createHttpError('You cannot claim your own listing', 400)
    }
    if (listing.status !== PlantListingStatus.AVAILABLE) {
        throw createHttpError('This listing is no longer available', 400)
    }

    const existingClaim = await prisma.plantClaim.findFirst({
        where: { listingId, claimantId, status: PlantClaimStatus.PENDING },
    })
    if (existingClaim) {
        throw createHttpError('You already have a pending request for this listing', 400)
    }

    const claim = await prisma.plantClaim.create({
        data: {
            listingId,
            claimantId,
            message: data.message,
            status: PlantClaimStatus.PENDING,
        },
    })

    await prisma.notification.create({
        data: {
            type: 'SYSTEM',
            title: 'New plant request',
            message: `Someone requested "${listing.title}"`,
            userId: listing.ownerId,
        },
    })

    return claim
}

export const getMyClaims = async (
    claimantId: string,
    query: { page?: unknown; limit?: unknown }
) => {
    const { skip, take, page, limit } = getPagination(query)

    const [claims, total] = await Promise.all([
        prisma.plantClaim.findMany({
            where: { claimantId },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                message: true,
                status: true,
                createdAt: true,
                listing: {
                    select: { id: true, title: true, slug: true, images: true, status: true, location: true },
                },
            },
        }),
        prisma.plantClaim.count({ where: { claimantId } }),
    ])

    return { claims, meta: getPaginationMeta(total, page, limit) }
}

export const respondToClaim = async (
    claimId: string,
    ownerId: string,
    status: 'ACCEPTED' | 'REJECTED'
) => {
    const claim = await prisma.plantClaim.findUnique({
        where: { id: claimId },
        include: { listing: true },
    })

    if (!claim) throw createHttpError('Request not found', 404)
    if (claim.listing.ownerId !== ownerId) throw createHttpError('Access denied', 403)
    if (claim.status !== PlantClaimStatus.PENDING) {
        throw createHttpError('This request has already been handled', 400)
    }

    const updatedClaim = await prisma.plantClaim.update({
        where: { id: claimId },
        data: { status: status as PlantClaimStatus },
    })

    if (status === 'ACCEPTED') {
        await prisma.plantListing.update({
            where: { id: claim.listingId },
            data: { status: PlantListingStatus.CLAIMED },
        })
        await prisma.plantClaim.updateMany({
            where: {
                listingId: claim.listingId,
                id: { not: claimId },
                status: PlantClaimStatus.PENDING,
            },
            data: { status: PlantClaimStatus.REJECTED },
        })
        await prisma.notification.create({
            data: {
                type: 'SYSTEM',
                title: 'Your plant request was accepted!',
                message: `"${claim.listing.title}" is reserved for you. Coordinate pickup with the owner.`,
                userId: claim.claimantId,
            },
        })
    } else {
        await prisma.notification.create({
            data: {
                type: 'SYSTEM',
                title: 'Plant request update',
                message: `Your request for "${claim.listing.title}" was declined.`,
                userId: claim.claimantId,
            },
        })
    }

    return updatedClaim
}

export const cancelClaim = async (claimId: string, claimantId: string) => {
    const claim = await prisma.plantClaim.findUnique({ where: { id: claimId } })

    if (!claim) throw createHttpError('Request not found', 404)
    if (claim.claimantId !== claimantId) throw createHttpError('Access denied', 403)
    if (claim.status !== PlantClaimStatus.PENDING) {
        throw createHttpError('Only pending requests can be cancelled', 400)
    }

    await prisma.plantClaim.update({
        where: { id: claimId },
        data: { status: PlantClaimStatus.CANCELLED },
    })

    return { message: 'Request cancelled' }
}

export const markCompleted = async (id: string, ownerId: string) => {
    const existing = await prisma.plantListing.findUnique({ where: { id } })

    if (!existing) throw createHttpError('Plant listing not found', 404)
    if (existing.ownerId !== ownerId) throw createHttpError('Access denied', 403)

    const listing = await prisma.plantListing.update({
        where: { id },
        data: { status: PlantListingStatus.COMPLETED },
        select: LISTING_SELECT,
    })

    return listing
}