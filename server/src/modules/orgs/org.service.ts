import { VolunteerRequestStatus, Role } from '../../types/prisma-enums'
import { prisma } from '../../config/database'
import { generateUniqueSlug } from '../../utils/slug'
import { getPagination, getPaginationMeta } from '../../utils/pagination'
import {
    CreateOrgInput,
    UpdateOrgInput,
    CreateVolunteerRequestInput,
    CreateOrgUpdateInput,
} from './org.schema'

const createHttpError = (message: string, statusCode: number) => {
    const err = new Error(message) as Error & { statusCode: number }
    err.statusCode = statusCode
    return err
}

const ORG_SELECT = {
    id: true,
    name: true,
    slug: true,
    description: true,
    category: true,
    logo: true,
    coverImage: true,
    location: true,
    contactPhone: true,
    contactEmail: true,
    createdAt: true,
    updatedAt: true,
    ownerId: true,
    owner: {
        select: { id: true, name: true, avatar: true, email: true },
    },
    _count: { select: { requests: true, updates: true } },
} as const

interface OrgWhereInput {
    category?: string
    ownerId?: string
    OR?: Array<{
        name?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
        location?: { contains: string; mode: 'insensitive' }
    }>
}

// ── Organizations ─────────────────────────────────────────────────────────

export const getAllOrgs = async (query: {
    page?: unknown
    limit?: unknown
    category?: unknown
    search?: unknown
}) => {
    const { skip, take, page, limit } = getPagination(query)

    const where: OrgWhereInput = {}

    if (query.category && typeof query.category === 'string') {
        where.category = query.category
    }

    if (query.search && typeof query.search === 'string') {
        where.OR = [
            { name: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
            { location: { contains: query.search, mode: 'insensitive' } },
        ]
    }

    const [orgs, total] = await Promise.all([
        prisma.organization.findMany({
            where,
            select: ORG_SELECT,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.organization.count({ where }),
    ])

    return { orgs, meta: getPaginationMeta(total, page, limit) }
}

export const getOrgBySlug = async (slug: string) => {
    const org = await prisma.organization.findUnique({
        where: { slug },
        select: ORG_SELECT,
    })

    if (!org) throw createHttpError('Organization not found', 404)

    return org
}

export const getMyOrgs = async (
    ownerId: string,
    query: { page?: unknown; limit?: unknown }
) => {
    const { skip, take, page, limit } = getPagination(query)

    const [orgs, total] = await Promise.all([
        prisma.organization.findMany({
            where: { ownerId },
            select: ORG_SELECT,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.organization.count({ where: { ownerId } }),
    ])

    return { orgs, meta: getPaginationMeta(total, page, limit) }
}

export const createOrg = async (ownerId: string, data: CreateOrgInput) => {
    const existingSlugs = await prisma.organization
        .findMany({ select: { slug: true } })
        .then((rows: Array<{ slug: string }>) => rows.map((row) => row.slug))

    const slug = generateUniqueSlug(data.name, existingSlugs)

    const org = await prisma.organization.create({
        data: {
            name: data.name,
            description: data.description,
            category: data.category,
            location: data.location,
            contactPhone: data.contactPhone,
            contactEmail: data.contactEmail,
            logo: data.logo,
            coverImage: data.coverImage,
            slug,
            ownerId,
        },
        select: ORG_SELECT,
    })

    return org
}

export const updateOrg = async (id: string, ownerId: string, data: UpdateOrgInput) => {
    const existing = await prisma.organization.findUnique({ where: { id } })

    if (!existing) throw createHttpError('Organization not found', 404)
    if (existing.ownerId !== ownerId) throw createHttpError('Access denied', 403)

    const org = await prisma.organization.update({
        where: { id },
        data,
        select: ORG_SELECT,
    })

    return org
}

export const deleteOrg = async (id: string, userId: string, userRole: string) => {
    const existing = await prisma.organization.findUnique({ where: { id } })

    if (!existing) throw createHttpError('Organization not found', 404)

    if (userRole !== Role.ADMIN && existing.ownerId !== userId) {
        throw createHttpError('Access denied', 403)
    }

    await prisma.organization.delete({ where: { id } })
    return { message: 'Organization deleted successfully' }
}

// ── Volunteer Requests ───────────────────────────────────────────────────

export const createVolunteerRequest = async (
    organizationId: string,
    volunteerId: string,
    data: CreateVolunteerRequestInput
) => {
    const org = await prisma.organization.findUnique({ where: { id: organizationId } })

    if (!org) throw createHttpError('Organization not found', 404)
    if (org.ownerId === volunteerId) {
        throw createHttpError('You cannot volunteer for your own organization', 400)
    }

    const existingRequest = await prisma.volunteerRequest.findFirst({
        where: {
            organizationId,
            volunteerId,
            status: { in: [VolunteerRequestStatus.PENDING, VolunteerRequestStatus.ACCEPTED] },
        },
    })
    if (existingRequest) {
        const reason =
            existingRequest.status === VolunteerRequestStatus.ACCEPTED
                ? 'You are already a volunteer with this organization'
                : 'You already have a pending request with this organization'
        throw createHttpError(reason, 400)
    }

    const request = await prisma.volunteerRequest.create({
        data: {
            organizationId,
            volunteerId,
            message: data.message,
            status: VolunteerRequestStatus.PENDING,
        },
    })

    await prisma.notification.create({
        data: {
            type: 'SYSTEM',
            title: 'New volunteer request',
            message: `Someone wants to volunteer with "${org.name}"`,
            userId: org.ownerId,
        },
    })

    return request
}

export const getOrgRequests = async (
    organizationId: string,
    ownerId: string,
    query: { page?: unknown; limit?: unknown }
) => {
    const org = await prisma.organization.findUnique({ where: { id: organizationId } })

    if (!org) throw createHttpError('Organization not found', 404)
    if (org.ownerId !== ownerId) throw createHttpError('Access denied', 403)

    const { skip, take, page, limit } = getPagination(query)

    const [requests, total] = await Promise.all([
        prisma.volunteerRequest.findMany({
            where: { organizationId },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                message: true,
                status: true,
                createdAt: true,
                volunteer: { select: { id: true, name: true, avatar: true, phone: true, email: true } },
            },
        }),
        prisma.volunteerRequest.count({ where: { organizationId } }),
    ])

    return { requests, meta: getPaginationMeta(total, page, limit) }
}

export const getMyVolunteerRequests = async (
    volunteerId: string,
    query: { page?: unknown; limit?: unknown }
) => {
    const { skip, take, page, limit } = getPagination(query)

    const [requests, total] = await Promise.all([
        prisma.volunteerRequest.findMany({
            where: { volunteerId },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                message: true,
                status: true,
                createdAt: true,
                organization: {
                    select: { id: true, name: true, slug: true, logo: true, category: true },
                },
            },
        }),
        prisma.volunteerRequest.count({ where: { volunteerId } }),
    ])

    return { requests, meta: getPaginationMeta(total, page, limit) }
}

export const respondToVolunteerRequest = async (
    requestId: string,
    ownerId: string,
    status: 'ACCEPTED' | 'REJECTED'
) => {
    const request = await prisma.volunteerRequest.findUnique({
        where: { id: requestId },
        include: { organization: true },
    })

    if (!request) throw createHttpError('Request not found', 404)
    if (request.organization.ownerId !== ownerId) throw createHttpError('Access denied', 403)
    if (request.status !== VolunteerRequestStatus.PENDING) {
        throw createHttpError('This request has already been handled', 400)
    }

    const updatedRequest = await prisma.volunteerRequest.update({
        where: { id: requestId },
        data: { status: status as VolunteerRequestStatus },
    })

    await prisma.notification.create({
        data: {
            type: 'SYSTEM',
            title: status === 'ACCEPTED' ? 'Volunteer request accepted!' : 'Volunteer request update',
            message:
                status === 'ACCEPTED'
                    ? `You're now a volunteer with "${request.organization.name}"`
                    : `Your request to volunteer with "${request.organization.name}" was declined.`,
            userId: request.volunteerId,
        },
    })

    return updatedRequest
}

export const cancelVolunteerRequest = async (requestId: string, volunteerId: string) => {
    const request = await prisma.volunteerRequest.findUnique({ where: { id: requestId } })

    if (!request) throw createHttpError('Request not found', 404)
    if (request.volunteerId !== volunteerId) throw createHttpError('Access denied', 403)
    if (request.status !== VolunteerRequestStatus.PENDING) {
        throw createHttpError('Only pending requests can be cancelled', 400)
    }

    await prisma.volunteerRequest.update({
        where: { id: requestId },
        data: { status: VolunteerRequestStatus.CANCELLED },
    })

    return { message: 'Request cancelled' }
}

// ── Org Updates (feed posts) ────────────────────────────────────────────

export const createOrgUpdate = async (
    organizationId: string,
    ownerId: string,
    data: CreateOrgUpdateInput
) => {
    const org = await prisma.organization.findUnique({ where: { id: organizationId } })

    if (!org) throw createHttpError('Organization not found', 404)
    if (org.ownerId !== ownerId) throw createHttpError('Access denied', 403)

    const update = await prisma.orgUpdate.create({
        data: {
            organizationId,
            title: data.title,
            content: data.content,
            images: data.images,
        },
    })

    return update
}

export const getOrgUpdates = async (
    organizationId: string,
    query: { page?: unknown; limit?: unknown }
) => {
    const { skip, take, page, limit } = getPagination(query)

    const [updates, total] = await Promise.all([
        prisma.orgUpdate.findMany({
            where: { organizationId },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.orgUpdate.count({ where: { organizationId } }),
    ])

    return { updates, meta: getPaginationMeta(total, page, limit) }
}

export const deleteOrgUpdate = async (updateId: string, ownerId: string) => {
    const update = await prisma.orgUpdate.findUnique({
        where: { id: updateId },
        include: { organization: true },
    })

    if (!update) throw createHttpError('Update not found', 404)
    if (update.organization.ownerId !== ownerId) throw createHttpError('Access denied', 403)

    await prisma.orgUpdate.delete({ where: { id: updateId } })
    return { message: 'Update deleted successfully' }
}