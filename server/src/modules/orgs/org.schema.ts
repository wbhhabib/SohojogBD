import { z } from 'zod'

export const ORG_CATEGORIES = [
    'Education',
    'Health',
    'Disaster Relief',
    'Environment',
    'Animal Welfare',
    'Community',
    'Poverty',
    'Youth Development',
    'Other',
] as const

export const createOrgSchema = z.object({
    name: z.string().min(3).max(150),
    description: z.string().min(20).max(1000),
    category: z.preprocess(
        (val) => (val === '' ? undefined : val),
        z.enum(ORG_CATEGORIES, { errorMap: () => ({ message: 'Please select a valid category' }) })
    ),
    location: z.string().min(2).max(150),
    contactPhone: z.string().max(30).optional(),
    contactEmail: z.string().email().optional(),
    logo: z.string().url().optional(),
    coverImage: z.string().url().optional(),
})

export const updateOrgSchema = z.object({
    name: z.string().min(3).max(150).optional(),
    description: z.string().min(20).max(1000).optional(),
    category: z.enum(ORG_CATEGORIES).optional(),
    location: z.string().min(2).max(150).optional(),
    contactPhone: z.string().max(30).optional(),
    contactEmail: z.string().email().optional(),
    logo: z.string().url().optional(),
    coverImage: z.string().url().optional(),
})

export const createVolunteerRequestSchema = z.object({
    message: z.string().max(500).optional(),
})

export const updateVolunteerRequestSchema = z.object({
    status: z.enum(['ACCEPTED', 'REJECTED']),
})

export const createOrgUpdateSchema = z.object({
    title: z.string().min(3).max(150),
    content: z.string().min(10).max(2000),
    images: z.array(z.string().url()).max(5).default([]),
})

export type CreateOrgInput = z.infer<typeof createOrgSchema>
export type UpdateOrgInput = z.infer<typeof updateOrgSchema>
export type CreateVolunteerRequestInput = z.infer<typeof createVolunteerRequestSchema>
export type UpdateVolunteerRequestInput = z.infer<typeof updateVolunteerRequestSchema>
export type CreateOrgUpdateInput = z.infer<typeof createOrgUpdateSchema>