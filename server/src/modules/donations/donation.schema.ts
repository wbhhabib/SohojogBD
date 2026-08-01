import { z } from 'zod'

export const createDonationSchema = z.object({
  campaignId: z.string().cuid(),
  amount: z.number().int().min(10),
  message: z.string().max(200).optional(),
  isAnonymous: z.boolean().default(false),
})

export type CreateDonationInput = z.infer<typeof createDonationSchema>