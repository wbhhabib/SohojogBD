import { z } from 'zod'

// User progressive-ভাবে info জমা দেবে — তাই সবকিছু optional।
// যেটুকু পাঠাবে সেটুকুই merge হবে, বাকি field আগেরটাই থেকে যাবে।
export const submitVerificationSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    phone: z
        .string()
        .regex(/^01[3-9]\d{8}$/, 'Invalid BD phone number')
        .optional(),
    address: z.string().max(200).optional(),
    dateOfBirth: z.coerce.date().optional(),
    identityType: z.enum(['NID', 'BIRTH_CERTIFICATE']).optional(),
    identityNumber: z.string().min(3).max(30).optional(),
    identityDocPicture: z.string().optional(), // uploadVerificationDocument থেকে পাওয়া filename
    emergencyContactName: z.string().min(2).max(50).optional(),
    emergencyContactRelation: z.string().min(2).max(30).optional(),
    emergencyContactPhone: z
        .string()
        .regex(/^01[3-9]\d{8}$/, 'Invalid BD phone number')
        .optional(),
    sex: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    occupation: z.string().max(50).optional(),
    educationLevel: z.string().max(50).optional(),
    institution: z.string().max(100).optional(),
    bloodGroup: z.string().max(5).optional(),
    skill: z.string().max(100).optional(),
    division: z.string().max(50).optional(),
    district: z.string().max(50).optional(),
    upazila: z.string().max(50).optional(),
    hasTraining: z.boolean().optional(),
    trainingCertificate: z.string().optional(),
    isStudent: z.boolean().optional(),
    studentIdCard: z.string().optional(),
})

export type SubmitVerificationInput = z.infer<typeof submitVerificationSchema>

export const reviewVerificationSchema = z.object({
    status: z.enum(['VERIFIED', 'REJECTED']),
    note: z.string().max(300).optional(),
})

export type ReviewVerificationInput = z.infer<typeof reviewVerificationSchema>