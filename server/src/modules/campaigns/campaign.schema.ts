import { z } from 'zod'

export const CATEGORIES = [
  'Education',
  'Medical',
  'Disaster Relief',
  'Environment',
  'Animal Welfare',
  'Community',
  'Poverty',
  'Arts',
  'Sports',
  'Technology',
  'Other',
] as const

export const createCampaignSchema = z.object({
  title: z.string().min(5).max(150),
  description: z.string().min(20).max(1000),
  story: z.string().min(50),
  goalAmount: z.coerce.number().int().min(1000),
  category: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.enum(CATEGORIES, { errorMap: () => ({ message: 'Please select a valid category' }) })
  ),
  beneficiaryName: z.string().min(2).max(100),
  beneficiaryInfo: z.string().min(10).max(1000),








  deadline: z
    .string()
    .datetime({ offset: true })
    .refine((d) => new Date(d) > new Date(), {
      message: 'Deadline must be in the future',
    }),




  images: z.array(z.string().url()).max(5).default([]),
})

export const updateCampaignSchema = z.object({
  title: z.string().min(5).max(150).optional(),
  description: z.string().min(20).max(1000).optional(),
  story: z.string().min(50).optional(),
  goalAmount: z.coerce.number().int().min(1000).optional(),
  category: z.enum(CATEGORIES).optional(),
  beneficiaryName: z.string().min(2).max(100).optional(),
  beneficiaryInfo: z.string().min(10).max(1000).optional(),
  deadline: z
    .string()
    .datetime({ offset: true })
    .refine((d) => new Date(d) > new Date(), {
      message: 'Deadline must be in the future',
    })
    .optional(),
  images: z.array(z.string().url()).max(5).optional(),

  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED']).optional(),
})

export const adminUpdateSchema = z.object({
  title: z.string().min(5).max(150).optional(),
  description: z.string().min(20).max(1000).optional(),
  story: z.string().min(50).optional(),
  goalAmount: z.coerce.number().int().min(1000).optional(),
  category: z.enum(CATEGORIES).optional(),
  beneficiaryName: z.string().min(2).max(100).optional(),
  beneficiaryInfo: z.string().min(10).max(1000).optional(),
  deadline: z.string().datetime({ offset: true }).optional(),
  images: z.array(z.string().url()).max(5).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'SUSPENDED']).optional(),
})

export const addCampaignUpdateSchema = z.object({
  title: z.string().min(3).max(150),
  content: z.string().min(10),
})

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>
export type AdminUpdateInput = z.infer<typeof adminUpdateSchema>
export type AddCampaignUpdateInput = z.infer<typeof addCampaignUpdateSchema>