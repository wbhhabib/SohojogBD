import { z } from 'zod'

export const INSTITUTION_TYPES = [
    'GOVERNMENT_PROJECT',
    'NGO',
    'PRIVATE_COMPANY',
    'UNIVERSITY_CLUB',
    'INTERNATIONAL_ORG',
] as const

export const createProviderSchema = z.object({
    // Step 1 — general info
    institutionName: z.string().min(3).max(150),
    institutionType: z.enum(INSTITUTION_TYPES, {
        errorMap: () => ({ message: 'Please select a valid institution type' }),
    }),
    logo: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
    facebookPage: z.string().url().optional().or(z.literal('')),
    headquartersAddress: z.string().min(10).max(300),
    headquartersDivision: z.string().min(2).max(80),
    headquartersDistrict: z.string().min(2).max(80),
    headquartersUpazila: z.string().min(2).max(80),

    // Step 2 — legal & verification
    registrationNumber: z.string().min(2).max(100),
    legalDocumentUrl: z.string().min(1, 'Please upload the legal/registration document'),

    // Step 3 — focal person
    contactPersonName: z.string().min(2).max(100),
    designation: z.string().min(2).max(100),
    officialEmail: z.string().email(),
    mobileNumber: z.string().min(6).max(30),
    nidNumber: z.string().min(5).max(30),
})

export type CreateProviderInput = z.infer<typeof createProviderSchema>

export const updateProviderStatusSchema = z.object({
    status: z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED']),
    adminNote: z.string().max(500).optional(),
})

export type UpdateProviderStatusInput = z.infer<typeof updateProviderStatusSchema>

export const createBranchSchema = z.object({
    name: z.string().min(2).max(100),
    address: z.string().min(5).max(300),
    division: z.string().min(2).max(80),
    district: z.string().min(2).max(80),
    upazila: z.string().min(2).max(80),
    loginEmail: z.string().email(),
    loginPassword: z
        .string()
        .min(8)
        .regex(/[A-Z]/, 'Must have at least one uppercase letter')
        .regex(/[0-9]/, 'Must have at least one number'),
})

export type CreateBranchInput = z.infer<typeof createBranchSchema>