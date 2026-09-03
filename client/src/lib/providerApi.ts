// ─────────────────────────────────────────────────────────────────────────
// Course Provider registration — data layer
//
// Talks to server/src/modules/course-provider/. A CourseProvider is the
// head-office entity (an institute/NGO/company that offers courses); once
// approved, a "Main Branch" is auto-created for it, and the owner can add
// more district/upazila branches from the branch-management dashboard.
// ─────────────────────────────────────────────────────────────────────────

import { api } from '@/lib/api'
import type { ApiResponse } from '@/lib/api'
import { getAccessToken } from '@/lib/auth-store'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1'

export type InstitutionType =
    | 'GOVERNMENT_PROJECT'
    | 'NGO'
    | 'PRIVATE_COMPANY'
    | 'UNIVERSITY_CLUB'
    | 'INTERNATIONAL_ORG'

export const INSTITUTION_TYPES: InstitutionType[] = [
    'GOVERNMENT_PROJECT',
    'NGO',
    'PRIVATE_COMPANY',
    'UNIVERSITY_CLUB',
    'INTERNATIONAL_ORG',
]

export const INSTITUTION_TYPE_LABEL: Record<InstitutionType, string> = {
    GOVERNMENT_PROJECT: 'Government Project (TTC, যুব উন্নয়ন, SEIP)',
    NGO: 'NGO',
    PRIVATE_COMPANY: 'Private Company',
    UNIVERSITY_CLUB: 'University Club',
    INTERNATIONAL_ORG: 'International Organization',
}

// Legal-document help text varies by institution type — shown above the
// upload field so the person knows what to attach.
export const LEGAL_DOC_HINT: Record<InstitutionType, string> = {
    GOVERNMENT_PROJECT: 'Gazette notification or government authorization letter',
    NGO: 'NGO Affairs Bureau (NGOAB) or Department of Social Services (DSS) registration certificate',
    PRIVATE_COMPANY: 'Trade License, or NSDA/BTEB approval certificate',
    UNIVERSITY_CLUB: 'Gazette notification or university authorization letter',
    INTERNATIONAL_ORG: 'Registration/authorization document from the relevant authority',
}

export type CourseProviderStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export interface CourseProviderBranchSummary {
    id: string
    name: string
    address: string
    division: string
    district: string
    upazila: string
    isMain: boolean
    isBlocked: boolean
    createdAt: string
    loginUser: { id: string; name: string; email: string }
}

export interface CourseProvider {
    id: string
    institutionName: string
    institutionType: InstitutionType
    logo?: string | null
    website?: string | null
    facebookPage?: string | null
    headquartersAddress: string
    headquartersDivision: string
    headquartersDistrict: string
    headquartersUpazila: string
    registrationNumber: string
    legalDocumentUrl: string
    contactPersonName: string
    designation: string
    officialEmail: string
    mobileNumber: string
    nidNumber: string
    status: CourseProviderStatus
    adminNote?: string | null
    createdAt: string
    ownerId: string
    branches: CourseProviderBranchSummary[]
}

export interface CreateProviderPayload {
    institutionName: string
    institutionType: InstitutionType
    logo?: string
    website?: string
    facebookPage?: string
    headquartersAddress: string
    headquartersDivision: string
    headquartersDistrict: string
    headquartersUpazila: string
    registrationNumber: string
    legalDocumentUrl: string
    contactPersonName: string
    designation: string
    officialEmail: string
    mobileNumber: string
    nidNumber: string
}

export async function registerProvider(payload: CreateProviderPayload): Promise<ApiResponse<CourseProvider>> {
    return api.post<CourseProvider>('/grow-together/providers', payload)
}

export async function getMyProviders(): Promise<ApiResponse<CourseProvider[]>> {
    return api.get<CourseProvider[]>('/grow-together/providers/my')
}

export async function uploadProviderDocument(file: File): Promise<ApiResponse<{ url: string }>> {
    const fd = new FormData()
    fd.append('document', file)
    return api.post<{ url: string }>('/grow-together/providers/documents', fd)
}

// ── Branch management (provider owner only) ──────────────────────────────

export interface CreateBranchPayload {
    name: string
    address: string
    division: string
    district: string
    upazila: string
    loginEmail: string
    loginPassword: string
}

export async function createBranch(providerId: string, payload: CreateBranchPayload): Promise<ApiResponse<CourseProviderBranchSummary>> {
    return api.post<CourseProviderBranchSummary>(`/grow-together/providers/${providerId}/branches`, payload)
}

export async function blockBranch(branchId: string): Promise<ApiResponse<null>> {
    return api.patch<null>(`/grow-together/providers/branches/${branchId}/block`)
}

export async function unblockBranch(branchId: string): Promise<ApiResponse<null>> {
    return api.patch<null>(`/grow-together/providers/branches/${branchId}/unblock`)
}

export async function deleteBranch(branchId: string): Promise<ApiResponse<null>> {
    return api.delete<null>(`/grow-together/providers/branches/${branchId}`)
}

// ── Admin verification dashboard ──────────────────────────────────────

export async function getAdminProviders(query = ''): Promise<ApiResponse<CourseProvider[]>> {
    return api.get<CourseProvider[]>(`/grow-together/providers/admin/all${query ? `?${query}` : ''}`)
}

export async function getAdminProviderById(id: string): Promise<ApiResponse<CourseProvider>> {
    return api.get<CourseProvider>(`/grow-together/providers/admin/${id}`)
}

export interface UpdateProviderStatusPayload {
    status: CourseProviderStatus
    adminNote?: string
}

export async function updateProviderStatus(id: string, payload: UpdateProviderStatusPayload): Promise<ApiResponse<CourseProvider>> {
    return api.patch<CourseProvider>(`/grow-together/providers/admin/${id}/status`, payload)
}

// Legal documents are access-controlled (owner or admin only), so fetch them
// with the auth token and open as a blob — a plain <a href> would 401.
export async function openProviderDocument(url: string): Promise<void> {
    const token = getAccessToken()
    const path = url.replace(/^\/api\/v1/, '')
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) {
        alert('Could not open this document.')
        return
    }
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    window.open(objectUrl, '_blank')
}