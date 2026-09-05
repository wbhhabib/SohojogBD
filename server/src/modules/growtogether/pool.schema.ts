import { z } from 'zod'

export const POOL_CATEGORIES = [
    'Kirana / Grocery',
    'Garments & Fabric',
    'Electronics & Gadgets',
    'Cosmetics & Beauty',
    'Stationery & Office',
    'Hardware & Tools',
    'Food & Snacks',
    'Agriculture Inputs',
    'Footwear',
    'Other',
] as const

export const createPoolSchema = z.object({
    title: z.string().min(5).max(150),
    description: z.string().min(20).max(2000),
    category: z.enum(POOL_CATEGORIES, {
        errorMap: () => ({ message: 'Please select a valid category' }),
    }),
    unit: z.string().min(1).max(20),
    division: z.string().min(1).max(100),
    district: z.string().min(1).max(100),
    upazila: z.string().min(1).max(100),
    location: z.string().min(2).max(150),
    contactPhone: z.string().min(5).max(30),
    groupLink: z.string().url().max(300),
    facebookLink: z.string().url().max(300).optional().or(z.literal('')),
    images: z.array(z.string().url()).max(5).default([]),
})

export const joinPoolSchema = z.object({
    note: z.string().max(300).optional(),
})

export type CreatePoolInput = z.infer<typeof createPoolSchema>
export type JoinPoolInput = z.infer<typeof joinPoolSchema>