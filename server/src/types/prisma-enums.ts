export const Role = {
  DONOR: 'DONOR',
  CREATOR: 'CREATOR',
  ADMIN: 'ADMIN',
} as const
export type Role = (typeof Role)[keyof typeof Role]

export const CampaignStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  SUSPENDED: 'SUSPENDED',
} as const
export type CampaignStatus = (typeof CampaignStatus)[keyof typeof CampaignStatus]

export const DonationStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  REFUNDED: 'REFUNDED',
} as const
export type DonationStatus = (typeof DonationStatus)[keyof typeof DonationStatus]

export const PaymentStatus = {
  PENDING: 'PENDING',
  VALID: 'VALID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]

export const NotifType = {
  DONATION: 'DONATION',
  MILESTONE: 'MILESTONE',
  COMMENT: 'COMMENT',
  SYSTEM: 'SYSTEM',
} as const
export type NotifType = (typeof NotifType)[keyof typeof NotifType]

export const ReportStatus = {
  PENDING: 'PENDING',
  REVIEWED: 'REVIEWED',
  DISMISSED: 'DISMISSED',
} as const
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus]

export const ReportReason = {
  FAKE_CAMPAIGN: 'FAKE_CAMPAIGN',
  SPAM: 'SPAM',
  MISLEADING: 'MISLEADING',
  INAPPROPRIATE: 'INAPPROPRIATE',
} as const
export type ReportReason = (typeof ReportReason)[keyof typeof ReportReason]

export const PlantListingStatus = {
  AVAILABLE: 'AVAILABLE',
  CLAIMED: 'CLAIMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const
export type PlantListingStatus = (typeof PlantListingStatus)[keyof typeof PlantListingStatus]

export const PlantClaimStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const
export type PlantClaimStatus = (typeof PlantClaimStatus)[keyof typeof PlantClaimStatus]

export const VolunteerRequestStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const
export type VolunteerRequestStatus = (typeof VolunteerRequestStatus)[keyof typeof VolunteerRequestStatus]

// ── Organization verification system ────────────────────────────────────

export const OrgCategory = {
  REGISTERED: 'REGISTERED',
  TEAM: 'TEAM',
} as const
export type OrgCategory = (typeof OrgCategory)[keyof typeof OrgCategory]

export const OrgVerificationStatus = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  MORE_INFO_REQUIRED: 'MORE_INFO_REQUIRED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
  EXPIRED: 'EXPIRED',
} as const
export type OrgVerificationStatus = (typeof OrgVerificationStatus)[keyof typeof OrgVerificationStatus]

export const InstitutionAffiliation = {
  YES: 'YES',
  NO: 'NO',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
} as const
export type InstitutionAffiliation = (typeof InstitutionAffiliation)[keyof typeof InstitutionAffiliation]


export const PoolStatus = {
  OPEN: 'OPEN',
  TARGET_REACHED: 'TARGET_REACHED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
} as const
export type PoolStatus = (typeof PoolStatus)[keyof typeof PoolStatus]

export const CourseMode = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  HYBRID: 'HYBRID',
} as const
export type CourseMode = (typeof CourseMode)[keyof typeof CourseMode]

export const CourseStatus = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const
export type CourseStatus = (typeof CourseStatus)[keyof typeof CourseStatus]

export const CourseProviderInstitutionType = {
  GOVERNMENT_PROJECT: 'GOVERNMENT_PROJECT',
  NGO: 'NGO',
  PRIVATE_COMPANY: 'PRIVATE_COMPANY',
  UNIVERSITY_CLUB: 'UNIVERSITY_CLUB',
  INTERNATIONAL_ORG: 'INTERNATIONAL_ORG',
} as const
export type CourseProviderInstitutionType = (typeof CourseProviderInstitutionType)[keyof typeof CourseProviderInstitutionType]

export const CourseProviderStatus = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
} as const
export type CourseProviderStatus = (typeof CourseProviderStatus)[keyof typeof CourseProviderStatus]

export const SOSStatus = {
  OPEN: 'OPEN',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  RESOLVED: 'RESOLVED',
  CANCELLED: 'CANCELLED',
} as const
export type SOSStatus = (typeof SOSStatus)[keyof typeof SOSStatus]