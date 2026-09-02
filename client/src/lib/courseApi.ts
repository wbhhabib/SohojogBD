// ─────────────────────────────────────────────────────────────────────────
// GrowTogether — Free Courses / Skill Development data layer
//
// Talks to the real backend at /grow-together/courses (see
// server/src/modules/growtogether/course.*). Same conventions as
// growTogetherApi.ts (Wholesale Pooling): simple { success, data } shape,
// pure helper functions, api.ts under the hood.
// ─────────────────────────────────────────────────────────────────────────

import { api } from '@/lib/api'
import type { ApiResponse as BaseApiResponse } from '@/lib/api'

export type CourseCategory =
    | 'Sewing & Tailoring'
    | 'Computer & ICT Basics'
    | 'Freelancing & Digital Marketing'
    | 'Graphic Design'
    | 'Electrical & House Wiring'
    | 'Refrigeration & AC'
    | 'Driving'
    | 'Agriculture & Livestock'
    | 'Handicrafts'
    | 'Beauty & Caregiving'
    | 'Language Training'
    | 'Other'

export const COURSE_CATEGORIES: CourseCategory[] = [
    'Sewing & Tailoring',
    'Computer & ICT Basics',
    'Freelancing & Digital Marketing',
    'Graphic Design',
    'Electrical & House Wiring',
    'Refrigeration & AC',
    'Driving',
    'Agriculture & Livestock',
    'Handicrafts',
    'Beauty & Caregiving',
    'Language Training',
    'Other',
]

export const CATEGORY_EMOJI: Record<CourseCategory, string> = {
    'Sewing & Tailoring': '🧵',
    'Computer & ICT Basics': '💻',
    'Freelancing & Digital Marketing': '📈',
    'Graphic Design': '🎨',
    'Electrical & House Wiring': '🔌',
    'Refrigeration & AC': '❄️',
    'Driving': '🚗',
    'Agriculture & Livestock': '🐄',
    'Handicrafts': '🧶',
    'Beauty & Caregiving': '💆',
    'Language Training': '🗣️',
    'Other': '📚',
}

export type CourseMode = 'ONLINE' | 'OFFLINE' | 'HYBRID'
export const COURSE_MODES: CourseMode[] = ['ONLINE', 'OFFLINE', 'HYBRID']
export const MODE_LABEL: Record<CourseMode, string> = {
    ONLINE: 'Online',
    OFFLINE: 'In-person',
    HYBRID: 'Hybrid',
}

export type CourseStatus = 'OPEN' | 'CLOSED'

export interface CourseOrg {
    id: string
    name: string
    slug: string
    logo?: string | null
    contactPhone: string
    contactEmail?: string | null
    status: string
}

export interface Course {
    id: string
    slug: string
    title: string
    description: string
    skillCategory: CourseCategory
    mode: CourseMode
    duration: string
    eligibility?: string | null
    venue?: string | null
    division?: string | null
    district?: string | null
    upazila?: string | null
    startDate?: string | null
    isOngoing: boolean
    applicationDeadline?: string | null
    seatsAvailable?: number | null
    contactPhone?: string | null
    contactEmail?: string | null
    applyLink?: string | null
    images: string[]
    status: CourseStatus
    createdAt: string
    organizationId: string
    organization: CourseOrg
}

export interface ApiResponse<T> {
    success: boolean
    message?: string
    data: T
}

export interface PostableOrg {
    id: string
    name: string
    logo?: string | null
}

// ── helpers ────────────────────────────────────────────────────────────

function toSimple<T>(res: BaseApiResponse<T>): ApiResponse<T> {
    return { success: res.success, message: res.message, data: res.data }
}

function qs(params: Record<string, string | number | undefined>): string {
    const usp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '' && v !== 'All') usp.set(k, String(v))
    }
    const s = usp.toString()
    return s ? `?${s}` : ''
}

export function daysLeft(deadline: string): number {
    const diff = new Date(deadline).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

// ── public API ─────────────────────────────────────────────────────────

export interface CourseFilters {
    search?: string
    skillCategory?: CourseCategory | 'All'
    mode?: CourseMode | 'All'
    division?: string
    page?: number
    limit?: number
}

export async function getCourses(filters: CourseFilters = {}): Promise<ApiResponse<{ courses: Course[]; total: number }>> {
    const query = qs({
        search: filters.search,
        skillCategory: filters.skillCategory,
        mode: filters.mode,
        division: filters.division,
        page: filters.page,
        limit: filters.limit ?? 9,
    })
    const res = await api.get<Course[]>(`/grow-together/courses${query}`)
    return {
        success: res.success,
        message: res.message,
        data: { courses: res.data ?? [], total: res.meta?.total ?? (res.data?.length ?? 0) },
    }
}

export async function getCourseBySlug(slug: string): Promise<ApiResponse<Course | null>> {
    const res = await api.get<Course>(`/grow-together/courses/${slug}`)
    if (!res.success) return { success: false, message: res.message, data: null }
    return toSimple(res)
}

export async function getMyOrgCourses(): Promise<ApiResponse<Course[]>> {
    const res = await api.get<Course[]>('/grow-together/courses/my')
    return { success: res.success, message: res.message, data: res.data ?? [] }
}

export async function getMyPostableOrgs(): Promise<ApiResponse<PostableOrg[]>> {
    const res = await api.get<PostableOrg[]>('/grow-together/courses/my-orgs')
    return { success: res.success, message: res.message, data: res.data ?? [] }
}

export interface CreateCoursePayload {
    organizationId: string
    title: string
    description: string
    skillCategory: CourseCategory
    mode: CourseMode
    duration: string
    eligibility?: string
    venue?: string
    division?: string
    district?: string
    upazila?: string
    startDate?: string
    isOngoing: boolean
    applicationDeadline?: string
    seatsAvailable?: number
    contactPhone?: string
    contactEmail?: string
    applyLink?: string
}

export async function createCourse(payload: CreateCoursePayload): Promise<ApiResponse<Course>> {
    const res = await api.post<Course>('/grow-together/courses', payload)
    return toSimple(res) as ApiResponse<Course>
}

export async function closeCourse(courseId: string): Promise<ApiResponse<null>> {
    const res = await api.post<null>(`/grow-together/courses/${courseId}/close`)
    return { success: res.success, message: res.message, data: null }
}