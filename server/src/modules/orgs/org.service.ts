import { VolunteerRequestStatus, Role, OrgVerificationStatus } from '../../types/prisma-enums'
import { prisma } from '../../config/database'
import { generateUniqueSlug } from '../../utils/slug'
import { getPagination, getPaginationMeta } from '../../utils/pagination'
import {
    CreateOrgInput,
    UpdateOrgInput,
    UpdateVerificationStatusInput,
    CreateVolunteerRequestInput,
    CreateOrgUpdateInput,
} from './org.schema'

const createHttpError = (message: string, statusCode: number) => {
    const err = new Error(message) as Error & { statusCode: number }
    err.statusCode = statusCode
    return err
}

// ── Select shapes ───────────────────────────────────────────────────────────
// PUBLIC_SELECT is what anonymous/public viewers get: never expose NID
// numbers/documents, authorization letters, admin notes, or anything from
// verificationLogs. ADMIN_SELECT adds the verification-only material back
// for admins/owners.

const PUBLIC_SELECT = {
    id: true,
    name: true,
    slug: true,
    description: true,
    category: true,
    orgType: true,
    orgTypeOther: true,
    establishedYear: true,
    logo: true,
    coverImage: true,
    contactPhone: true,
    contactEmail: true,
    website: true,
    facebookPage: true,
    otherSocialLinks: true,
    division: true,
    district: true,
    upazila: true,
    fullAddress: true,
    postalCode: true,
    latitude: true,
    longitude: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    ownerId: true,
    owner: { select: { id: true, name: true, avatar: true } },
    areasOfWork: { select: { id: true, area: true, areaOther: true, description: true } },
    registration: {
        select: {
            registrationAuthority: true,
            authorityOther: true,
            registrationDate: true,
            expiryDate: true,
            // registrationNumber and certificateUrl are intentionally omitted
            // from the public profile.
        },
    },
    institution: {
        select: {
            institutionName: true,
            institutionType: true,
            department: true,
            clubName: true,
            affiliated: true,
            // advisor contact + authorizationDocUrl stay private.
        },
    },
    _count: { select: { requests: true, updates: true } },
} as const

const OWNER_OR_ADMIN_SELECT = {
    ...PUBLIC_SELECT,
    adminNote: true,
    rejectReason: true,
    declarationAccepted: true,
    registration: true,
    teamEvidence: true,
    institution: true,
    representative: true,
} as const

interface OrgWhereInput {
    category?: string
    status?: string
    ownerId?: string
    OR?: Array<{
        name?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
        fullAddress?: { contains: string; mode: 'insensitive' }
        district?: { contains: string; mode: 'insensitive' }
    }>
}

// ── Public: Organizations ───────────────────────────────────────────────────

export const getAllOrgs = async (query: {
    page?: unknown
    limit?: unknown
    category?: unknown
    search?: unknown
}) => {
    const { skip, take, page, limit } = getPagination(query)

    // Public listing only ever shows fully verified orgs.
    const where: OrgWhereInput = { status: OrgVerificationStatus.APPROVED }

    if (query.category && typeof query.category === 'string') {
        where.category = query.category
    }

    if (query.search && typeof query.search === 'string') {
        where.OR = [
            { name: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
            { fullAddress: { contains: query.search, mode: 'insensitive' } },
            { district: { contains: query.search, mode: 'insensitive' } },
        ]
    }

    const [orgs, total] = await Promise.all([
        prisma.organization.findMany({
            where,
            select: PUBLIC_SELECT,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.organization.count({ where }),
    ])

    return { orgs, meta: getPaginationMeta(total, page, limit) }
}

export const getOrgBySlug = async (slug: string, requesterId?: string, requesterRole?: string) => {
    const org = await prisma.organization.findUnique({
        where: { slug },
        select: OWNER_OR_ADMIN_SELECT,
    })

    if (!org) throw createHttpError('Organization not found', 404)

    const isOwner = requesterId && org.ownerId === requesterId
    const isAdmin = requesterRole === Role.ADMIN

    // Anyone else only sees APPROVED orgs, and only the public-safe fields.
    if (!isOwner && !isAdmin) {
        if (org.status !== OrgVerificationStatus.APPROVED) {
            throw createHttpError('Organization not found', 404)
        }
        const { adminNote, rejectReason, declarationAccepted, representative, registration, teamEvidence, institution, ...rest } = org
        return {
            ...rest,
            registration: registration
                ? {
                    registrationAuthority: registration.registrationAuthority,
                    authorityOther: registration.authorityOther,
                    registrationDate: registration.registrationDate,
                    expiryDate: registration.expiryDate,
                }
                : null,
            institution: institution
                ? {
                    institutionName: institution.institutionName,
                    institutionType: institution.institutionType,
                    department: institution.department,
                    clubName: institution.clubName,
                    affiliated: institution.affiliated,
                }
                : null,
        }
    }

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
            select: OWNER_OR_ADMIN_SELECT,
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
            slug,
            description: data.description,
            category: data.category,
            orgType: data.orgType,
            orgTypeOther: data.orgTypeOther,
            establishedYear: data.establishedYear,
            logo: data.logo,
            contactPhone: data.contactPhone,
            contactEmail: data.contactEmail,
            website: data.website,
            facebookPage: data.facebookPage,
            otherSocialLinks: data.otherSocialLinks,

            division: data.location.division,
            district: data.location.district,
            upazila: data.location.upazila,
            fullAddress: data.location.fullAddress,
            postalCode: data.location.postalCode,
            latitude: data.location.latitude,
            longitude: data.location.longitude,

            declarationAccepted: data.declarationAccepted,
            status: OrgVerificationStatus.PENDING,

            ownerId,

            areasOfWork: {
                create: data.areasOfWork.map((a) => ({
                    area: a.area,
                    areaOther: a.areaOther,
                    description: a.description,
                })),
            },

            representative: {
                create: {
                    fullName: data.representative.fullName,
                    designation: data.representative.designation,
                    designationOther: data.representative.designationOther,
                    mobile: data.representative.mobile,
                    email: data.representative.email,
                    nidNumber: data.representative.nidNumber,
                    nidDocUrl: data.representative.nidDocUrl,
                    authorizationDocUrl: data.representative.authorizationDocUrl,
                },
            },

            ...(data.category === 'REGISTERED' && data.registration
                ? {
                    registration: {
                        create: {
                            registrationAuthority: data.registration.registrationAuthority,
                            authorityOther: data.registration.authorityOther,
                            registrationNumber: data.registration.registrationNumber,
                            registrationDate: data.registration.registrationDate,
                            expiryDate: data.registration.expiryDate,
                            certificateUrl: data.registration.certificateUrl,
                        },
                    },
                }
                : {}),

            ...(data.category === 'TEAM' && data.teamEvidence
                ? {
                    teamEvidence: {
                        create: {
                            pastActivities: data.teamEvidence.pastActivities,
                            activityCount: data.teamEvidence.activityCount,
                            volunteerCountApprox: data.teamEvidence.volunteerCountApprox,
                            recentActivity: data.teamEvidence.recentActivity,
                            photos: data.teamEvidence.photos,
                            activityReportUrl: data.teamEvidence.activityReportUrl,
                            facebookPageUrl: data.teamEvidence.facebookPageUrl,
                            previousCampaignLinks: data.teamEvidence.previousCampaignLinks,
                            supportingDocUrl: data.teamEvidence.supportingDocUrl,
                        },
                    },
                }
                : {}),

            ...(data.institution
                ? {
                    institution: {
                        create: {
                            institutionName: data.institution.institutionName,
                            institutionType: data.institution.institutionType,
                            department: data.institution.department,
                            clubName: data.institution.clubName,
                            advisorName: data.institution.advisorName,
                            advisorContact: data.institution.advisorContact,
                            affiliated: data.institution.affiliated,
                            authorizationDocUrl: data.institution.authorizationDocUrl,
                        },
                    },
                }
                : {}),
        },
        select: OWNER_OR_ADMIN_SELECT,
    })

    return org
}

export const updateOrg = async (id: string, ownerId: string, data: UpdateOrgInput) => {
    const existing = await prisma.organization.findUnique({ where: { id } })

    if (!existing) throw createHttpError('Organization not found', 404)
    if (existing.ownerId !== ownerId) throw createHttpError('Access denied', 403)

    // Once approved, core verification-relevant fields shouldn't silently
    // change without re-review. Keep it simple: any edit on an approved org
    // sends it back to Under Review.
    const statusUpdate =
        existing.status === OrgVerificationStatus.APPROVED
            ? { status: OrgVerificationStatus.UNDER_REVIEW }
            : {}

    const { areasOfWork, registration, teamEvidence, institution, representative, location, ...flat } = data

    const org = await prisma.organization.update({
        where: { id },
        data: {
            ...flat,
            ...(location
                ? {
                    division: location.division,
                    district: location.district,
                    upazila: location.upazila,
                    fullAddress: location.fullAddress,
                    postalCode: location.postalCode,
                    latitude: location.latitude,
                    longitude: location.longitude,
                }
                : {}),
            ...statusUpdate,
            ...(areasOfWork
                ? {
                    areasOfWork: {
                        deleteMany: {},
                        create: areasOfWork.map((a) => ({
                            area: a.area,
                            areaOther: a.areaOther,
                            description: a.description,
                        })),
                    },
                }
                : {}),
            ...(representative ? { representative: { update: representative } } : {}),
            ...(registration ? { registration: { upsert: { create: registration, update: registration } } } : {}),
            ...(teamEvidence ? { teamEvidence: { upsert: { create: teamEvidence, update: teamEvidence } } } : {}),
            ...(institution ? { institution: { upsert: { create: institution, update: institution } } } : {}),
        },
        select: OWNER_OR_ADMIN_SELECT,
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

// ── Admin: verification dashboard ───────────────────────────────────────────

export const getAdminOrgs = async (query: {
    page?: unknown
    limit?: unknown
    category?: unknown
    status?: unknown
    search?: unknown
}) => {
    const { skip, take, page, limit } = getPagination(query)

    const where: OrgWhereInput = {}
    if (query.category && typeof query.category === 'string') where.category = query.category
    if (query.status && typeof query.status === 'string') where.status = query.status
    if (query.search && typeof query.search === 'string') {
        where.OR = [
            { name: { contains: query.search, mode: 'insensitive' } },
            { district: { contains: query.search, mode: 'insensitive' } },
        ]
    }

    const [orgs, total] = await Promise.all([
        prisma.organization.findMany({
            where,
            select: OWNER_OR_ADMIN_SELECT,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.organization.count({ where }),
    ])

    return { orgs, meta: getPaginationMeta(total, page, limit) }
}

export const getAdminOrgById = async (id: string) => {
    const org = await prisma.organization.findUnique({
        where: { id },
        select: {
            ...OWNER_OR_ADMIN_SELECT,
            verificationLogs: {
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    oldStatus: true,
                    newStatus: true,
                    reason: true,
                    createdAt: true,
                    admin: { select: { id: true, name: true } },
                },
            },
        },
    })

    if (!org) throw createHttpError('Organization not found', 404)
    return org
}

export const updateVerificationStatus = async (
    id: string,
    adminId: string,
    data: UpdateVerificationStatusInput
) => {
    const existing = await prisma.organization.findUnique({ where: { id } })
    if (!existing) throw createHttpError('Organization not found', 404)

    const [org] = await prisma.$transaction([
        prisma.organization.update({
            where: { id },
            data: {
                status: data.status,
                rejectReason: data.status === 'REJECTED' ? data.reason : existing.rejectReason,
                adminNote: data.adminNote ?? existing.adminNote,
            },
            select: OWNER_OR_ADMIN_SELECT,
        }),
        prisma.orgVerificationLog.create({
            data: {
                organizationId: id,
                adminId,
                oldStatus: existing.status,
                newStatus: data.status,
                reason: data.reason,
            },
        }),
        prisma.notification.create({
            data: {
                type: 'SYSTEM',
                userId: existing.ownerId,
                title: 'Organization verification update',
                message: verificationStatusMessage(existing.name, data.status, data.reason),
            },
        }),
    ])

    return org
}

const verificationStatusMessage = (orgName: string, status: string, reason?: string) => {
    switch (status) {
        case 'UNDER_REVIEW':
            return `"${orgName}" is now under review by our team.`
        case 'MORE_INFO_REQUIRED':
            return `We need more information for "${orgName}": ${reason ?? ''}`.trim()
        case 'APPROVED':
            return `Congratulations! "${orgName}" has been verified.`
        case 'REJECTED':
            return `"${orgName}" was not approved: ${reason ?? ''}`.trim()
        case 'SUSPENDED':
            return `"${orgName}" has been suspended: ${reason ?? ''}`.trim()
        case 'EXPIRED':
            return `Verification for "${orgName}" has expired. Please renew your documents.`
        default:
            return `The verification status of "${orgName}" was updated.`
    }
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
