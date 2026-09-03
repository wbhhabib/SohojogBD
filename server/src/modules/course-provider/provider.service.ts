import { CourseProviderStatus, Role } from '../../types/prisma-enums'
import { prisma } from '../../config/database'
import { hashPassword } from '../../utils/bcrypt'
import { getPagination, getPaginationMeta } from '../../utils/pagination'
import { CreateProviderInput, UpdateProviderStatusInput, CreateBranchInput } from './provider.schema'

const createHttpError = (message: string, statusCode: number) => {
    const err = new Error(message) as Error & { statusCode: number }
    err.statusCode = statusCode
    return err
}

const PROVIDER_SELECT = {
    id: true,
    institutionName: true,
    institutionType: true,
    logo: true,
    website: true,
    facebookPage: true,
    headquartersAddress: true,
    headquartersDivision: true,
    headquartersDistrict: true,
    headquartersUpazila: true,
    registrationNumber: true,
    legalDocumentUrl: true,
    contactPersonName: true,
    designation: true,
    officialEmail: true,
    mobileNumber: true,
    nidNumber: true,
    status: true,
    adminNote: true,
    createdAt: true,
    ownerId: true,
    branches: {
        select: {
            id: true, name: true, address: true, division: true, district: true,
            upazila: true, isMain: true, isBlocked: true, createdAt: true,
            loginUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'asc' as const },
    },
} as const

const BRANCH_SELECT = {
    id: true,
    name: true,
    address: true,
    division: true,
    district: true,
    upazila: true,
    isMain: true,
    isBlocked: true,
    createdAt: true,
    providerId: true,
    provider: { select: { id: true, institutionName: true, logo: true, status: true } },
    loginUserId: true,
} as const

// ── Registration ─────────────────────────────────────────────────────────

export const registerProvider = async (ownerId: string, data: CreateProviderInput) => {
    const provider = await prisma.courseProvider.create({
        data: {
            institutionName: data.institutionName,
            institutionType: data.institutionType,
            logo: data.logo || null,
            website: data.website || null,
            facebookPage: data.facebookPage || null,
            headquartersAddress: data.headquartersAddress,
            headquartersDivision: data.headquartersDivision,
            headquartersDistrict: data.headquartersDistrict,
            headquartersUpazila: data.headquartersUpazila,
            registrationNumber: data.registrationNumber,
            legalDocumentUrl: data.legalDocumentUrl,
            contactPersonName: data.contactPersonName,
            designation: data.designation,
            officialEmail: data.officialEmail,
            mobileNumber: data.mobileNumber,
            nidNumber: data.nidNumber,
            status: CourseProviderStatus.PENDING,
            ownerId,
        },
        select: PROVIDER_SELECT,
    })
    return provider
}

export const getMyProviders = async (ownerId: string) => {
    const providers = await prisma.courseProvider.findMany({
        where: { ownerId },
        select: PROVIDER_SELECT,
        orderBy: { createdAt: 'desc' },
    })
    return providers
}

export const userOwnsProviderDocument = async (userId: string, filename: string): Promise<boolean> => {
    const needle = `/${filename}`
    const provider = await prisma.courseProvider.findFirst({
        where: {
            ownerId: userId,
            OR: [
                { legalDocumentUrl: { contains: needle } },
                { logo: { contains: needle } },
            ],
        },
        select: { id: true },
    })
    return !!provider
}

// ── Admin review ────────────────────────────────────────────────────────

export const getAdminProviders = async (query: { page?: unknown; limit?: unknown; status?: unknown }) => {
    const { skip, take, page, limit } = getPagination(query)
    const where: { status?: CourseProviderStatus } = {}
    if (query.status && typeof query.status === 'string' && query.status !== 'All') {
        where.status = query.status as CourseProviderStatus
    }

    const [providers, total] = await Promise.all([
        prisma.courseProvider.findMany({ where, select: PROVIDER_SELECT, skip, take, orderBy: { createdAt: 'desc' } }),
        prisma.courseProvider.count({ where }),
    ])
    return { providers, meta: getPaginationMeta(total, page, limit) }
}

export const getAdminProviderById = async (id: string) => {
    const provider = await prisma.courseProvider.findUnique({ where: { id }, select: PROVIDER_SELECT })
    if (!provider) throw createHttpError('Course provider not found', 404)
    return provider
}

// Approving a provider auto-creates its "Main Branch" (headquarters), whose
// login is the provider owner's own account. Only happens once — re-approving
// (e.g. after SUSPENDED → APPROVED) won't create a second Main Branch.
export const updateProviderStatus = async (id: string, adminId: string, data: UpdateProviderStatusInput) => {
    const existing = await prisma.courseProvider.findUnique({ where: { id }, include: { branches: true } })
    if (!existing) throw createHttpError('Course provider not found', 404)

    const wasAlreadyApprovedOnce = existing.branches.some((b) => b.isMain)

    const provider = await prisma.courseProvider.update({
        where: { id },
        data: { status: data.status, adminNote: data.adminNote ?? existing.adminNote },
        select: PROVIDER_SELECT,
    })

    if (data.status === CourseProviderStatus.APPROVED && !wasAlreadyApprovedOnce) {
        await prisma.courseProviderBranch.create({
            data: {
                name: `${existing.institutionName} — Main Branch`,
                address: existing.headquartersAddress,
                division: existing.headquartersDivision,
                district: existing.headquartersDistrict,
                upazila: existing.headquartersUpazila,
                isMain: true,
                providerId: id,
                loginUserId: existing.ownerId,
            },
        })
    }

    await prisma.notification.create({
        data: {
            type: 'SYSTEM',
            userId: existing.ownerId,
            title: 'Course provider verification update',
            message: providerStatusMessage(existing.institutionName, data.status),
        },
    })

    return provider
}

const providerStatusMessage = (name: string, status: string) => {
    switch (status) {
        case 'UNDER_REVIEW':
            return `"${name}" is now under review by our team.`
        case 'APPROVED':
            return `Congratulations! "${name}" has been verified. A Main Branch has been created — you can now post courses and add more branches.`
        case 'REJECTED':
            return `"${name}" was not approved. Please check the admin note and resubmit if needed.`
        case 'SUSPENDED':
            return `"${name}" has been suspended.`
        default:
            return `The verification status of "${name}" was updated.`
    }
}

// ── Branch access resolution (shared with the courses module) ────────────

// A signed-in user is either: (a) a branch login — scoped to exactly that
// one branch, or (b) a provider owner — scoped to every branch across every
// provider they own. Anyone else has no course-posting access at all.
export const getAccessibleBranchIds = async (userId: string): Promise<{ branchIds: string[]; isOwner: boolean }> => {
    const asBranchLogin = await prisma.courseProviderBranch.findUnique({ where: { loginUserId: userId } })
    if (asBranchLogin) return { branchIds: [asBranchLogin.id], isOwner: false }

    const ownedBranches = await prisma.courseProviderBranch.findMany({
        where: { provider: { ownerId: userId } },
        select: { id: true },
    })
    return { branchIds: ownedBranches.map((b: { id: string }) => b.id), isOwner: ownedBranches.length > 0 }
}

// ── Branch management ──────────────────────────────────────────────────

export const getMyBranches = async (userId: string) => {
    const { branchIds } = await getAccessibleBranchIds(userId)
    if (branchIds.length === 0) return []

    const branches = await prisma.courseProviderBranch.findMany({
        where: { id: { in: branchIds } },
        select: BRANCH_SELECT,
        orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }],
    })
    return branches
}

const assertOwnsProvider = async (providerId: string, userId: string, userRole: string) => {
    const provider = await prisma.courseProvider.findUnique({ where: { id: providerId } })
    if (!provider) throw createHttpError('Course provider not found', 404)
    if (userRole !== Role.ADMIN && provider.ownerId !== userId) {
        throw createHttpError('Only the provider owner can manage branches', 403)
    }
    return provider
}

export const createBranch = async (providerId: string, userId: string, userRole: string, data: CreateBranchInput) => {
    const provider = await assertOwnsProvider(providerId, userId, userRole)
    if (provider.status !== CourseProviderStatus.APPROVED) {
        throw createHttpError('Your provider must be approved before adding branches', 403)
    }

    const existingUser = await prisma.user.findUnique({ where: { email: data.loginEmail } })
    if (existingUser) throw createHttpError('This email is already in use', 400)

    const hashedPassword = await hashPassword(data.loginPassword)

    const branchLogin = await prisma.user.create({
        data: {
            name: data.name,
            email: data.loginEmail,
            password: hashedPassword,
            isVerified: true,
        },
    })

    const branch = await prisma.courseProviderBranch.create({
        data: {
            name: data.name,
            address: data.address,
            division: data.division,
            district: data.district,
            upazila: data.upazila,
            providerId,
            loginUserId: branchLogin.id,
        },
        select: BRANCH_SELECT,
    })

    return branch
}

const assertCanManageBranch = async (branchId: string, userId: string, userRole: string) => {
    const branch = await prisma.courseProviderBranch.findUnique({
        where: { id: branchId },
        include: { provider: true },
    })
    if (!branch) throw createHttpError('Branch not found', 404)
    if (userRole !== Role.ADMIN && branch.provider.ownerId !== userId) {
        throw createHttpError('Only the provider owner can manage this branch', 403)
    }
    return branch
}

export const setBranchBlocked = async (branchId: string, userId: string, userRole: string, blocked: boolean) => {
    const branch = await assertCanManageBranch(branchId, userId, userRole)
    if (branch.isMain && blocked) {
        throw createHttpError('The Main Branch cannot be blocked', 400)
    }
    await prisma.courseProviderBranch.update({ where: { id: branchId }, data: { isBlocked: blocked } })
    return { message: blocked ? 'Branch blocked' : 'Branch unblocked' }
}

export const deleteBranch = async (branchId: string, userId: string, userRole: string) => {
    const branch = await assertCanManageBranch(branchId, userId, userRole)
    if (branch.isMain) {
        throw createHttpError('The Main Branch cannot be deleted', 400)
    }
    // Deleting the branch cascades to its courses (see schema onDelete: Cascade)
    // and to its login user, so do this deliberately, not silently.
    await prisma.courseProviderBranch.delete({ where: { id: branchId } })
    await prisma.user.delete({ where: { id: branch.loginUserId } })
    return { message: 'Branch deleted' }
}