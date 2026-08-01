import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  avatar: z.string().url().optional(),
  phone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, 'Invalid BD phone number')
    .optional(),
  address: z.string().max(200).optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>