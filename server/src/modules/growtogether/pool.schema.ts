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
    targetQuantity: z.coerce.number().int().min(1),
    minJoinQuantity: z.coerce.number().int().min(1).default(1),
    pricePerUnit: z.coerce.number().int().min(1),
    marketPricePerUnit: z.coerce.number().int().min(1).optional(),
    division: z.string().min(1).max(100),
    district: z.string().min(1).max(100),
    upazila: z.string().min(1).max(100),
    location: z.string().min(2).max(150),
    contactPhone: z.string().min(5).max(30),
    groupLink: z.string().url().max(300).optional().or(z.literal('')),
    images: z.array(z.string().url()).max(5).default([]),
    deadline: z.coerce.date(),
})

export const joinPoolSchema = z.object({
    quantity: z.coerce.number().int().min(1),
    note: z.string().max(300).optional(),
})

export type CreatePoolInput = z.infer<typeof createPoolSchema>
export type JoinPoolInput = z.infer<typeof joinPoolSchema>