import { prisma } from '../../config/database'
import { getPagination, getPaginationMeta } from '../../utils/pagination'
import {
    ACTION_REQUIRED_FIELDS,
    ActionType,
    CheckableField,
} from './verification.config'
import { SubmitVerificationInput, ReviewVerificationInput } from './verification.schema'

const createHttpError = (message: string, statusCode: number) => {
    const err = new Error(message) as Error & { statusCode: number }
    err.statusCode = statusCode
    return err
}

const SELECT_ALL_CHECKABLE = {
    name: true,
    phone: true,
    address: true,
    dateOfBirth: true,
    identityType: true,
    identityNumber: true,
    identityDocPicture: true,
    emergencyContactName: true,
    emergencyContactPhone: true,
    sex: true,
    occupation: true,
    educationLevel: true,
    institution: true,
    bloodGroup: true,
    skill: true,
    division: true,
    district: true,
    upazila: true,
    isStudent: true,
    studentIdCard: true,
    verificationStatus: true,
} as const

interface CompletenessResult {
    ready: boolean
    missingFields: CheckableField[]
}

// একটা user নির্দিষ্ট action করার জন্য দরকারি সব field ভরা আছে কিনা চেক করে
export const checkCompleteness = async (
    userId: string,
    actionType: ActionType,
): Promise<CompletenessResult> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: SELECT_ALL_CHECKABLE,
    })

    if (!user) throw createHttpError('User not found', 404)

    const requiredFields = ACTION_REQUIRED_FIELDS[actionType]
    const missingFields = requiredFields.filter((field) => {
        const value = (user as Record<string, unknown>)[field]
        return value === null || value === undefined || value === ''
    })

    return { ready: missingFields.length === 0, missingFields }
}

// SOS response — VerificationStatus আর বয়স দুটোই independently satisfy হতে হবে
export const canRespondToSOS = async (
    userId: string,
): Promise<{ allowed: boolean; reason?: string }> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { dateOfBirth: true, verificationStatus: true },
    })

    if (!user) return { allowed: false, reason: 'USER_NOT_FOUND' }
    if (user.verificationStatus !== 'VERIFIED') return { allowed: false, reason: 'NOT_VERIFIED' }
    if (!user.dateOfBirth) return { allowed: false, reason: 'DOB_MISSING' }

    const age = Math.floor(
        (Date.now() - user.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    )
    if (age < 18) return { allowed: false, reason: 'UNDER_18' }

    return { allowed: true }
}

// pool/contact info-এর মতো sensitive জিনিস দেখানোর আগে admin-approved
// VERIFIED status চেক করতে — GrowTogether wholesale pool-এ ব্যবহৃত
export const isUserVerified = async (userId: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { verificationStatus: true },
    })
    return user?.verificationStatus === 'VERIFIED'
}

// ── User: নিজের ভেরিফিকেশন তথ্য জমা দেওয়া ──────────────────────────
export const submitVerification = async (userId: string, input: SubmitVerificationInput) => {
    // identity-সংক্রান্ত কিছু জমা দিলে সেটা admin review-র জন্য PENDING-এ যাবে।
    // শুধু contextual field (sex, skill ইত্যাদি) আপডেট করলে status বদলাবে না।
    const submittingIdentity = Boolean(
        input.identityType || input.identityNumber || input.identityDocPicture,
    )

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            ...input,
            ...(submittingIdentity ? { verificationStatus: 'PENDING', verificationNote: null } : {}),
        },
        select: { ...SELECT_ALL_CHECKABLE, id: true, name: true },
    })

    return user
}

export const getMyVerification = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { ...SELECT_ALL_CHECKABLE, verificationNote: true },
    })
    if (!user) throw createHttpError('User not found', 404)
    return user
}

// ── Admin: verification queue ──────────────────────────────────────
export const getPendingVerifications = async (query: { page?: string; limit?: string }) => {
    const { page, limit, skip } = getPagination(query)

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where: { verificationStatus: 'PENDING' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                identityType: true,
                identityNumber: true,
                identityDocPicture: true,
                studentIdCard: true,
                trainingCertificate: true,
                createdAt: true,
            },
            skip,
            take: limit,
            orderBy: { updatedAt: 'asc' },
        }),
        prisma.user.count({ where: { verificationStatus: 'PENDING' } }),
    ])

    return { users, meta: getPaginationMeta(total, page, limit) }
}

export const reviewVerification = async (
    targetUserId: string,
    input: ReviewVerificationInput,
) => {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } })
    if (!user) throw createHttpError('User not found', 404)

    const updated = await prisma.user.update({
        where: { id: targetUserId },
        data: {
            verificationStatus: input.status,
            verificationNote: input.note ?? null,
        },
        select: { id: true, name: true, verificationStatus: true, verificationNote: true },
    })

    // ইউজারকে জানানো — approve/reject হলে যেন নিজে থেকে গিয়ে চেক করা না লাগে
    await prisma.notification.create({
        data: {
            type: 'SYSTEM',
            title: updated.verificationStatus === 'VERIFIED' ? 'Verification approved' : 'Verification update',
            message:
                updated.verificationStatus === 'VERIFIED'
                    ? 'Your profile has been verified. You can now use all verification-gated features.'
                    : updated.verificationStatus === 'REJECTED'
                        ? `Your verification was rejected.${input.note ? ` Reason: ${input.note}` : ' Please resubmit your information.'}`
                        : 'Your verification status has been updated.',
            userId: targetUserId,
        },
    })

    return updated
}

// ── Secure document ownership check (getVerificationDocument-এর জন্য) ──
export const userOwnsVerificationDocument = async (
    userId: string,
    filename: string,
): Promise<boolean> => {
    const needle = filename
    const match = await prisma.user.findFirst({
        where: {
            id: userId,
            OR: [
                { identityDocPicture: needle },
                { trainingCertificate: needle },
                { studentIdCard: needle },
            ],
        },
        select: { id: true },
    })
    return !!match
}