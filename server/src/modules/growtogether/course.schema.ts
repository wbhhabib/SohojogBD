import { z } from 'zod'

export const SKILL_CATEGORIES = [
    'Sewing & Tailoring',
    'Computer & IT Basics',
    'Freelancing & Digital Marketing',
    'Handicrafts',
    'Agriculture & Livestock',
    'Language Learning',
    'Cooking & Food Processing',
    'Beautician & Salon',
    'Electrical & Technical Trade',
    'Entrepreneurship & Business',
    'Other',
] as const

export const COURSE_MODES = ['ONLINE', 'OFFLINE', 'HYBRID'] as const

export const createCourseSchema = z
    .object({
        organizationId: z.string().min(1, 'organizationId is required'),
        title: z.string().min(5).max(150),
        description: z.string().min(20).max(2000),
        skillCategory: z.enum(SKILL_CATEGORIES, {
            errorMap: () => ({ message: 'Please select a valid skill category' }),
        }),
        mode: z.enum(COURSE_MODES, {
            errorMap: () => ({ message: 'Please select Online, Offline or Hybrid' }),
        }),
        duration: z.string().min(2).max(60),
        eligibility: z.string().max(300).optional(),
        division: z.string().max(80).optional(),
        district: z.string().max(80).optional(),
        upazila: z.string().max(80).optional(),
        startDate: z.coerce.date().optional(),
        isOngoing: z.coerce.boolean().default(false),
        seatsAvailable: z.coerce.number().int().min(1).optional(),
        contactPhone: z.string().min(6).max(30),
        contactEmail: z.string().email().optional().or(z.literal('')),
        applyLink: z.string().url().optional().or(z.literal('')),
    })
    .refine((data) => data.mode === 'ONLINE' || !!data.division, {
        message: 'Division is required for offline/hybrid courses',
        path: ['division'],
    })

export type CreateCourseInput = z.infer<typeof createCourseSchema>