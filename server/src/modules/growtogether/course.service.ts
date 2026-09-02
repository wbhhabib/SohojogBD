import { CourseStatus, CourseMode, Role } from '../../types/prisma-enums'
import { prisma } from '../../config/database'
import { generateUniqueSlug } from '../../utils/slug'
import { getPagination, getPaginationMeta } from '../../utils/pagination'
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
    division: true,
    district: true,
    upazila: true,
    startDate: true,
    isOngoing: true,
    seatsAvailable: true,
    contactPhone: true,
    contactEmail: true,
    applyLink: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    organizationId: true,
    organization: {
        select: { id: true, name: true, slug: true, logo: true, category: true, status: true },
    },
} as const

interface CourseWhereInput {
    skillCategory?: string
    mode?: CourseMode
    division?: string
    district?: string
    upazila?: string
    organizationId?: string
    status?: CourseStatus
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

export const getOrgCourses = async (organizationId: string) => {
    const courses = await prisma.course.findMany({
        where: { organizationId },
        select: COURSE_SELECT,
        orderBy: { createdAt: 'desc' },
    })
    return courses
}

export const createCourse = async (userId: string, data: CreateCourseInput) => {
    const org = await prisma.organization.findUnique({ where: { id: data.organizationId } })
    if (!org) throw createHttpError('Organization not found', 404)
    if (org.ownerId !== userId) {
        throw createHttpError('Only the organization owner can post a course for it', 403)
    }

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
            division: data.division,
            district: data.district,
            upazila: data.upazila,
            startDate: data.startDate,
            isOngoing: data.isOngoing,
            seatsAvailable: data.seatsAvailable,
            contactPhone: data.contactPhone,
            contactEmail: data.contactEmail || null,
            applyLink: data.applyLink || null,
            slug,
            status: CourseStatus.OPEN,
            organizationId: data.organizationId,
        },
        select: COURSE_SELECT,
    })

    return course
}

const assertCanManage = async (courseId: string, userId: string, userRole: string) => {
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { organization: true },
    })
    if (!course) throw createHttpError('Course not found', 404)
    if (userRole !== Role.ADMIN && course.organization.ownerId !== userId) {
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