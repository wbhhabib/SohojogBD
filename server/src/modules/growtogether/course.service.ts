import { CourseStatus, CourseMode, Role } from '../../types/prisma-enums'
import { prisma } from '../../config/database'
import { generateUniqueSlug } from '../../utils/slug'
import { getPagination, getPaginationMeta } from '../../utils/pagination'
import { getAccessibleBranchIds } from '../course-provider/provider.service'
import { CreateCourseInput } from './course.schema'

const createHttpError = (message: string, statusCode: number) => {
    const err = new Error(message) as Error & { statusCode: number }
    err.statusCode = statusCode
    return err
}

const COURSE_SELECT = {
    id: true,
    title: true,
    slug: true,
    description: true,
    skillCategory: true,
    mode: true,
    duration: true,
    eligibility: true,
    venue: true,
    division: true,
    district: true,
    upazila: true,
    isOngoing: true,
    applicationDeadline: true,
    seatsAvailable: true,
    contactPhone: true,
    contactEmail: true,
    applyLink: true,
    images: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    branchId: true,
    branch: {
        select: {
            id: true, name: true, division: true, district: true, upazila: true,
            provider: { select: { id: true, institutionName: true, logo: true, status: true } },
        },
    },
} as const

interface CourseWhereInput {
    skillCategory?: string
    mode?: CourseMode
    division?: string
    district?: string
    upazila?: string
    status?: CourseStatus
    branchId?: string | { in: string[] }
    OR?: Array<{
        title?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
        skillCategory?: { contains: string; mode: 'insensitive' }
    }>
}

export const getAllCourses = async (query: {
    page?: unknown
    limit?: unknown
    search?: unknown
    skillCategory?: unknown
    mode?: unknown
    division?: unknown
    district?: unknown
    upazila?: unknown
}) => {
    const { skip, take, page, limit } = getPagination(query)

    // Public directory only shows courses that are still accepting people.
    const where: CourseWhereInput = { status: CourseStatus.OPEN }

    if (query.skillCategory && typeof query.skillCategory === 'string' && query.skillCategory !== 'All') {
        where.skillCategory = query.skillCategory
    }
    if (query.mode && typeof query.mode === 'string' && query.mode !== 'All') {
        where.mode = query.mode as CourseMode
    }
    if (query.division && typeof query.division === 'string' && query.division !== 'All') {
        where.division = query.division
    }
    if (query.district && typeof query.district === 'string') {
        where.district = query.district
    }
    if (query.upazila && typeof query.upazila === 'string') {
        where.upazila = query.upazila
    }
    if (query.search && typeof query.search === 'string') {
        where.OR = [
            { title: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
            { skillCategory: { contains: query.search, mode: 'insensitive' } },
        ]
    }

    const [courses, total] = await Promise.all([
        prisma.course.findMany({
            where,
            select: COURSE_SELECT,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.course.count({ where }),
    ])

    return { courses, meta: getPaginationMeta(total, page, limit) }
}

export const getCourseBySlug = async (slug: string) => {
    const course = await prisma.course.findUnique({ where: { slug }, select: COURSE_SELECT })
    if (!course) throw createHttpError('Course not found', 404)
    return course
}

// All courses across every branch the signed-in user can access — their own
// branch if they're a branch login, or every branch of every provider they
// own if they're a provider owner.
export const getMyCourses = async (userId: string) => {
    const { branchIds } = await getAccessibleBranchIds(userId)
    if (branchIds.length === 0) return []

    const courses = await prisma.course.findMany({
        where: { branchId: { in: branchIds } },
        select: COURSE_SELECT,
        orderBy: { createdAt: 'desc' },
    })
    return courses
}

// The branch(es) this user is allowed to post a course under — a branch
// login only ever sees their own branch; a provider owner sees every
// (non-blocked) branch across every provider they own.
export const getMyPostableBranches = async (userId: string) => {
    const { branchIds } = await getAccessibleBranchIds(userId)
    if (branchIds.length === 0) return []

    const branches = await prisma.courseProviderBranch.findMany({
        where: { id: { in: branchIds }, isBlocked: false },
        select: {
            id: true, name: true, division: true, district: true, upazila: true,
            provider: { select: { id: true, institutionName: true, logo: true } },
        },
        orderBy: { name: 'asc' },
    })
    return branches
}

export const createCourse = async (userId: string, data: CreateCourseInput) => {
    const { branchIds } = await getAccessibleBranchIds(userId)
    if (!branchIds.includes(data.branchId)) {
        throw createHttpError('You do not have permission to post a course under this branch', 403)
    }

    const branch = await prisma.courseProviderBranch.findUnique({ where: { id: data.branchId } })
    if (!branch) throw createHttpError('Branch not found', 404)
    if (branch.isBlocked) throw createHttpError('This branch is currently blocked', 403)

    const existingSlugs = await prisma.course
        .findMany({ select: { slug: true } })
        .then((rows: Array<{ slug: string }>) => rows.map((row) => row.slug))

    const slug = generateUniqueSlug(data.title, existingSlugs)

    const course = await prisma.course.create({
        data: {
            title: data.title,
            description: data.description,
            skillCategory: data.skillCategory,
            mode: data.mode,
            duration: data.duration,
            eligibility: data.eligibility,
            venue: data.venue,
            division: data.division,
            district: data.district,
            upazila: data.upazila,
            isOngoing: data.isOngoing,
            applicationDeadline: data.applicationDeadline,
            seatsAvailable: data.seatsAvailable,
            contactPhone: data.contactPhone || null,
            contactEmail: data.contactEmail || null,
            applyLink: data.applyLink || null,
            images: [],
            slug,
            status: CourseStatus.OPEN,
            branchId: data.branchId,
        },
        select: COURSE_SELECT,
    })

    return course
}

const assertCanManage = async (courseId: string, userId: string, userRole: string) => {
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) throw createHttpError('Course not found', 404)

    if (userRole === Role.ADMIN) return course

    const { branchIds } = await getAccessibleBranchIds(userId)
    if (!branchIds.includes(course.branchId)) {
        throw createHttpError('Access denied', 403)
    }
    return course
}

export const closeCourse = async (courseId: string, userId: string, userRole: string) => {
    await assertCanManage(courseId, userId, userRole)
    await prisma.course.update({ where: { id: courseId }, data: { status: CourseStatus.CLOSED } })
    return { message: 'Course closed' }
}

export const reopenCourse = async (courseId: string, userId: string, userRole: string) => {
    await assertCanManage(courseId, userId, userRole)
    await prisma.course.update({ where: { id: courseId }, data: { status: CourseStatus.OPEN } })
    return { message: 'Course reopened' }
}