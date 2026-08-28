import { z } from 'zod'

// ── Constants (kept here so the client can import/mirror them) ────────────

export const REGISTERED_ORG_TYPES = [
    'Registered Volunteer Organization',
    'NGO',
    'Foundation',
    'Social Welfare Organization',
    'Non-Profit Organization',
    'Other',
] as const

export const TEAM_ORG_TYPES = [
    'Local Volunteer Team',
    'Community Volunteer Group',
    'Youth Volunteer Team',
    'School Volunteer Group',
    'College Volunteer Group',
    'University Volunteer Group',
    'Student Volunteer Organization',
    'Area-Based Volunteer Group',
    'Other',
] as const

// Team org types that trigger the institution-affiliation section.
export const INSTITUTION_ORG_TYPES = [
    'School Volunteer Group',
    'College Volunteer Group',
    'University Volunteer Group',
] as const

export const AREAS_OF_WORK = [
    'Education',
    'Climate Change & Environment',
    'Youth Development',
    'Women & Girls Empowerment',
    'Healthcare',
    'Blood Donation',
    'Disaster Response & Relief',
    'Food Support',
    'Agriculture & Farmer Support',
    'Animal Welfare',
    'Child Welfare',
    'Disability Support',
    'Community Development',
    'Human Rights',
    'Good Governance & Civic Engagement',
    'Technology & Digital Inclusion',
    'Employment & Skill Development',
    'Poverty Alleviation',
    'Tree Plantation & Conservation',
    'Cleanliness & Waste Management',
    'Research & Knowledge',
    'Sports',
    'Culture & Arts',
    'Humanitarian Aid',
    'Safety & Public Awareness',
    'Mental Health & Well-being',
    'Rural Development',
    'Urban Development',
    'Awareness & Advocacy',
    'Sustainable Development',
    'Other',
] as const

export const REGISTRATION_AUTHORITIES = [
    'Department of Social Services (DSS)',
    'NGO Affairs Bureau (NGOAB)',
    'RJSC',
    'Other Government Authority',
] as const

export const REGISTERED_DESIGNATIONS = [
    'President',
    'General Secretary',
    'Executive Director',
    'Founder',
    'Director',
    'Volunteer Coordinator',
    'Authorized Representative',
    'Other',
] as const

export const TEAM_DESIGNATIONS = [
    'Team Leader',
    'Team Coordinator',
    'Founder',
    'Group Admin',
    'Volunteer Coordinator',
    'President',
    'General Secretary',
    'Other',
] as const

// ── Sub-object schemas ─────────────────────────────────────────────────────

export const areaOfWorkSchema = z
    .object({
        area: z.enum(AREAS_OF_WORK, { errorMap: () => ({ message: 'Please select a valid area of work' }) }),
        areaOther: z.string().max(100).optional(),
        description: z.string().min(20, 'Description must be at least 20 characters').max(300),
    })
    .refine((val) => val.area !== 'Other' || !!val.areaOther?.trim(), {
        message: 'Please specify the area of work',
        path: ['areaOther'],
    })

export const registrationSchema = z
    .object({
        registrationAuthority: z.enum(REGISTRATION_AUTHORITIES, {
            errorMap: () => ({ message: 'Please select a registration authority' }),
        }),
        authorityOther: z.string().max(150).optional(),
        registrationNumber: z.string().min(1, 'Registration number is required').max(100),
        registrationDate: z.coerce.date(),
        expiryDate: z.coerce.date().optional(),
        certificateUrl: z.string().min(1, 'Registration certificate is required'),
    })
    .refine((val) => val.registrationAuthority !== 'Other Government Authority' || !!val.authorityOther?.trim(), {
        message: 'Please specify the registration authority',
        path: ['authorityOther'],
    })

export const teamEvidenceSchema = z.object({
    pastActivities: z.string().max(1000).optional(),
    activityCount: z.coerce.number().int().min(0).optional(),
    volunteerCountApprox: z.coerce.number().int().min(0).optional(),
    recentActivity: z.string().max(500).optional(),
    photos: z.array(z.string()).max(10).default([]),
    activityReportUrl: z.string().optional(),
    facebookPageUrl: z.string().url().optional(),
    previousCampaignLinks: z.array(z.string().url()).max(10).default([]),
    supportingDocUrl: z.string().optional(),
})

export const institutionSchema = z.object({
    institutionName: z.string().min(2, 'Institution name is required').max(200),
    institutionType: z.string().min(2, 'Institution type is required').max(100),
    department: z.string().max(150).optional(),
    clubName: z.string().max(150).optional(),
    advisorName: z.string().max(150).optional(),
    advisorContact: z.string().max(30).optional(),
    affiliated: z.enum(['YES', 'NO', 'NOT_APPLICABLE']).default('NOT_APPLICABLE'),
    authorizationDocUrl: z.string().optional(),
})

export const representativeSchemaBase = z.object({
    fullName: z.string().min(2, 'Full name is required').max(150),
    designation: z.string().min(2, 'Designation is required').max(100),
    designationOther: z.string().max(100).optional(),
    mobile: z.string().min(6, 'Valid mobile number is required').max(20),
    email: z.string().email().optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
    nidNumber: z.string().min(5, 'NID number is required').max(30),
    nidDocUrl: z.string().min(1, 'NID copy is required'),
    authorizationDocUrl: z.string().optional(),
})

export const locationSchema = z.object({
    division: z.string().min(1, 'Division is required').max(100),
    district: z.string().min(1, 'District is required').max(100),
    upazila: z.string().min(1, 'Upazila/Thana is required').max(100),
    fullAddress: z.string().min(5, 'Full address / operating area is required').max(500),
    postalCode: z.string().max(20).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
})

// ── Top-level create schema ────────────────────────────────────────────────

const baseOrgSchema = z.object({
    category: z.enum(['REGISTERED', 'TEAM'], {
        errorMap: () => ({ message: 'Please choose an organization category' }),
    }),
    name: z.string().min(3, 'Name must be at least 3 characters').max(150),
    logo: z.string().optional(),
    description: z.string().min(20, 'Description must be at least 20 characters').max(1000),
    orgType: z.string().min(1, 'Please select an organization type'),
    orgTypeOther: z.string().max(150).optional(),
    establishedYear: z.coerce
        .number()
        .int()
        .min(1900)
        .max(new Date().getFullYear())
        .optional(),
    contactPhone: z.string().min(6, 'Contact number is required').max(30),
    contactEmail: z.string().email().optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
    website: z.string().url().optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
    facebookPage: z.string().url().optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
    otherSocialLinks: z.string().max(500).optional(),

    areasOfWork: z.array(areaOfWorkSchema).min(1, 'Select at least one area of work'),

    registration: registrationSchema.optional(),
    teamEvidence: teamEvidenceSchema.optional(),
    institution: institutionSchema.optional(),
    representative: representativeSchemaBase,
    location: locationSchema,

    declarationAccepted: z.literal(true, {
        errorMap: () => ({ message: 'You must accept the declaration to submit' }),
    }),
})

export const createOrgSchema = baseOrgSchema.superRefine((val, ctx) => {
    const validTypes = val.category === 'REGISTERED' ? REGISTERED_ORG_TYPES : TEAM_ORG_TYPES
    if (!(validTypes as readonly string[]).includes(val.orgType)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select a valid organization type for this category', path: ['orgType'] })
    }
    if (val.orgType === 'Other' && !val.orgTypeOther?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please specify the organization type', path: ['orgTypeOther'] })
    }

    if (val.category === 'REGISTERED') {
        if (!val.registration) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Registration details are required for a registered organization', path: ['registration'] })
        }
        const validDesignations = REGISTERED_DESIGNATIONS as readonly string[]
        if (!validDesignations.includes(val.representative.designation)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select a valid designation', path: ['representative', 'designation'] })
        }
        if (!val.representative.authorizationDocUrl?.trim()) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Authorization letter is required', path: ['representative', 'authorizationDocUrl'] })
        }
    } else {
        const validDesignations = TEAM_DESIGNATIONS as readonly string[]
        if (!validDesignations.includes(val.representative.designation)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select a valid designation', path: ['representative', 'designation'] })
        }
        // Team Leader / Coordinator Declaration doubles as the authorization doc for teams.
        if (!val.representative.authorizationDocUrl?.trim()) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Team Leader / Coordinator declaration is required', path: ['representative', 'authorizationDocUrl'] })
        }
    }

    if (val.representative.designation === 'Other' && !val.representative.designationOther?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please specify the designation', path: ['representative', 'designationOther'] })
    }

    const isInstitutionType = (INSTITUTION_ORG_TYPES as readonly string[]).includes(val.orgType)
    if (isInstitutionType) {
        if (!val.institution) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Institution details are required for this organization type', path: ['institution'] })
        } else if (val.institution.affiliated === 'YES' && !val.institution.authorizationDocUrl?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Institution authorization/approval document is required',
                path: ['institution', 'authorizationDocUrl'],
            })
        }
    }
})

// ── Update schema (owner edits before/while pending; admin-only fields excluded) ──

export const updateOrgSchema = baseOrgSchema.partial().extend({
    areasOfWork: z.array(areaOfWorkSchema).min(1).optional(),
})

// ── Admin verification action ──────────────────────────────────────────────

export const REGISTERED_STATUSES = [
    'PENDING',
    'UNDER_REVIEW',
    'MORE_INFO_REQUIRED',
    'APPROVED',
    'REJECTED',
    'EXPIRED',
] as const

export const TEAM_STATUSES = [
    'PENDING',
    'UNDER_REVIEW',
    'MORE_INFO_REQUIRED',
    'APPROVED',
    'REJECTED',
    'SUSPENDED',
] as const

export const updateVerificationStatusSchema = z
    .object({
        status: z.enum([
            'PENDING',
            'UNDER_REVIEW',
            'MORE_INFO_REQUIRED',
            'APPROVED',
            'REJECTED',
            'SUSPENDED',
            'EXPIRED',
        ]),
        reason: z.string().max(1000).optional(),
        adminNote: z.string().max(1000).optional(),
    })
    .refine((val) => !['MORE_INFO_REQUIRED', 'REJECTED', 'SUSPENDED'].includes(val.status) || !!val.reason?.trim(), {
        message: 'A reason is required for this status change',
        path: ['reason'],
    })

// ── Volunteer requests / org updates (unchanged from before) ──────────────

export const createVolunteerRequestSchema = z.object({
    message: z.string().max(500).optional(),
})

export const updateVolunteerRequestSchema = z.object({
    status: z.enum(['ACCEPTED', 'REJECTED']),
})

export const createOrgUpdateSchema = z.object({
    title: z.string().min(3).max(150),
    content: z.string().min(10).max(2000),
    images: z.array(z.string()).max(5).default([]),
})

// ── Types ────────────────────────────────────────────────────────────────

export type CreateOrgInput = z.infer<typeof createOrgSchema>
export type UpdateOrgInput = z.infer<typeof updateOrgSchema>
export type UpdateVerificationStatusInput = z.infer<typeof updateVerificationStatusSchema>
export type CreateVolunteerRequestInput = z.infer<typeof createVolunteerRequestSchema>
export type UpdateVolunteerRequestInput = z.infer<typeof updateVolunteerRequestSchema>
export type CreateOrgUpdateInput = z.infer<typeof createOrgUpdateSchema>
