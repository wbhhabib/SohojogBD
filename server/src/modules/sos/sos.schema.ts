import { z } from 'zod'

export const createSOSSchema = z.object({
    message: z.string().min(5).max(500),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().max(300).optional(),
    radiusKm: z.number().min(1).max(50).optional(),
})

export const respondToSOSSchema = z.object({
    status: z.enum(['ACKNOWLEDGED', 'ON_THE_WAY', 'ARRIVED']).default('ACKNOWLEDGED'),
})

export const updateSOSStatusSchema = z.object({
    status: z.enum(['RESOLVED', 'CANCELLED']),
})

export const responderSettingsSchema = z.object({
    respLat: z.number().min(-90).max(90).nullable().optional(),
    respLng: z.number().min(-180).max(180).nullable().optional(),
    respRadiusKm: z.number().min(1).max(50).optional(),
    pushEnabled: z.boolean().optional(),
})

export type CreateSOSInput = z.infer<typeof createSOSSchema>
export type RespondToSOSInput = z.infer<typeof respondToSOSSchema>
export type UpdateSOSStatusInput = z.infer<typeof updateSOSStatusSchema>
export type ResponderSettingsInput = z.infer<typeof responderSettingsSchema>