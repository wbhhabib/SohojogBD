import { z } from 'zod'

export const SKILL_CATEGORIES = [
    'Sewing & Tailoring',
    'Computer & ICT Basics',
    'Freelancing & Digital Marketing',
    'Graphic Design',
    'Electrical & House Wiring',
    'Refrigeration & AC',
    'Driving',
    'Agriculture & Livestock',
    'Handicrafts',
    'Beauty & Caregiving',
    'Language Training',
    'Other',
] as const

export const COURSE_MODES = ['ONLINE', 'OFFLINE', 'HYBRID'] as const

export const createCourseSchema = z
    .object({
        branchId: z.string().min(1, 'branchId is required'),
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
        venue: z.string().max(150).optional(),
        division: z.string().max(80).optional(),
        district: z.string().max(80).optional(),
        upazila: z.string().max(80).optional(),
        isOngoing: z.coerce.boolean().default(false),
        applicationDeadline: z.coerce.date().optional(),
        seatsAvailable: z.coerce.number().int().min(1).optional(),
        contactPhone: z.string().max(30).optional(),
        contactEmail: z.string().email().optional().or(z.literal('')),
        applyLink: z.string().url().optional().or(z.literal('')),
    })
    .refine((data) => data.mode === 'ONLINE' || (!!data.division && !!data.district && !!data.upazila), {
        message: 'Division, district, and upazila are required for offline/hybrid courses',
        path: ['division'],
    })

export type CreateCourseInput = z.infer<typeof createCourseSchema>