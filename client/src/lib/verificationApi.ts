// client/src/lib/verificationApi.ts
import { api } from './api'
import { getAccessToken } from './auth-store'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1'

export type VerificationStatus = 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
export type IdentityType = 'NID' | 'BIRTH_CERTIFICATE'

export type ActionType =
    | 'CAMPAIGN_CREATE'
    | 'VOLUNTEER_REQUEST'
    | 'WHOLESALE_JOIN'
    | 'COURSE_APPLY'
    | 'PLANT_CLAIM'
    | 'SOS_RESPOND'

export interface VerificationProfile {
    phone: string | null
    address: string | null
    dateOfBirth: string | null
    identityType: IdentityType | null
    identityNumber: string | null
    identityDocPicture: string | null
    emergencyContactName: string | null
    emergencyContactRelation: string | null
    emergencyContactPhone: string | null
    sex: string | null
    occupation: string | null
    educationLevel: string | null
    institution: string | null
    bloodGroup: string | null
    skill: string | null
    division: string | null
    district: string | null
    upazila: string | null
    hasTraining: boolean | null
    trainingCertificate: string | null
    isStudent: boolean | null
    studentIdCard: string | null
    verificationStatus: VerificationStatus
    verificationNote?: string | null
}

export interface CompletenessResult {
    ready: boolean
    missingFields: string[]
}

export const verificationApi = {
    // নিজের বর্তমান verification profile আনা
    getMe() {
        return api.get<VerificationProfile>('/verification/me')
    },
    // নির্দিষ্ট action-এর জন্য দরকারি field গুলো ভরা আছে কিনা চেক করা
    checkReadiness(actionType: ActionType) {
        return api.get<CompletenessResult>(`/verification/check/${actionType}`)
    },
    // progressive submit — যেটুকু পাঠাবে সেটুকুই merge হয়ে সেভ হবে
    submit(payload: Partial<Record<string, unknown>>) {
        return api.post<VerificationProfile>('/verification/submit', payload)
    },
    // NID/certificate ছবি আপলোড, filename ফেরত আসবে
    uploadDocument(file: File) {
        const fd = new FormData()
        fd.append('document', file)
        return api.post<{ filename: string }>('/verification/documents', fd)
    },
}

// NID/certificate ছবি পাবলিক URL না — auth token সহ fetch করে blob হিসেবে
// খুলতে হবে। api.ts-এর openOrgDocument-এর সাথে হুবহু একই pattern।
export async function openVerificationDocument(filename: string): Promise<void> {
    const token = getAccessToken()
    const res = await fetch(`${BASE_URL}/verification/documents/${filename}`, {
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