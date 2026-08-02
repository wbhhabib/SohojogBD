import { z } from 'zod'

export const PLANT_TYPES = [
    'Flowering',
    'Fruit',
    'Vegetable',
    'Succulent',
    'Herb',
    'Tree Sapling',
    'Indoor',
    'Seeds',
    'Other',
] as const

export const createPlantListingSchema = z.object({
    title: z.string().min(5).max(150),
    description: z.string().min(20).max(1000),
    plantType: z.preprocess(
        (val) => (val === '' ? undefined : val),
        z.enum(PLANT_TYPES, { errorMap: () => ({ message: 'Please select a valid plant type' }) })
    ),
    quantity: z.coerce.number().int().min(1).max(1000).default(1),
    location: z.string().min(2).max(150),
    contactPhone: z.string().max(30).optional(),
    images: z.array(z.string().url()).max(5).default([]),
})

export const updatePlantListingSchema = z.object({
    title: z.string().min(5).max(150).optional(),
    description: z.string().min(20).max(1000).optional(),
    plantType: z.enum(PLANT_TYPES).optional(),
    quantity: z.coerce.number().int().min(1).max(1000).optional(),
    location: z.string().min(2).max(150).optional(),
    contactPhone: z.string().max(30).optional(),
    images: z.array(z.string().url()).max(5).optional(),
    status: z.enum(['AVAILABLE', 'CANCELLED']).optional(),
})

export const createPlantClaimSchema = z.object({
    message: z.string().max(500).optional(),
    quantity: z.coerce.number().int().min(1).max(1000).default(1),
})

export const updatePlantClaimSchema = z.object({
    status: z.enum(['ACCEPTED', 'REJECTED']),
})

export type CreatePlantListingInput = z.infer<typeof createPlantListingSchema>
export type UpdatePlantListingInput = z.infer<typeof updatePlantListingSchema>
export type CreatePlantClaimInput = z.infer<typeof createPlantClaimSchema>
export type UpdatePlantClaimInput = z.infer<typeof updatePlantClaimSchema>