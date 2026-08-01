



export const Role = {
  DONOR:   'DONOR',
  CREATOR: 'CREATOR',
  ADMIN:   'ADMIN',
} as const
export type Role = (typeof Role)[keyof typeof Role]

export const CampaignStatus = {
  DRAFT:     'DRAFT',
  ACTIVE:    'ACTIVE',
  PAUSED:    'PAUSED',
  COMPLETED: 'COMPLETED',
  SUSPENDED: 'SUSPENDED',
} as const
export type CampaignStatus = (typeof CampaignStatus)[keyof typeof CampaignStatus]

export const DonationStatus = {
  PENDING:   'PENDING',
  COMPLETED: 'COMPLETED',
  REFUNDED:  'REFUNDED',
} as const
export type DonationStatus = (typeof DonationStatus)[keyof typeof DonationStatus]

export const PaymentStatus = {
  PENDING:   'PENDING',
  VALID:     'VALID',
  FAILED:    'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED:  'REFUNDED',
} as const
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]

export const NotifType = {
  DONATION:  'DONATION',
  MILESTONE: 'MILESTONE',
  COMMENT:   'COMMENT',
  SYSTEM:    'SYSTEM',
} as const
export type NotifType = (typeof NotifType)[keyof typeof NotifType]

export const ReportStatus = {
  PENDING:   'PENDING',
  REVIEWED:  'REVIEWED',
  DISMISSED: 'DISMISSED',
} as const
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus]

export const ReportReason = {
  FAKE_CAMPAIGN: 'FAKE_CAMPAIGN',
  SPAM:          'SPAM',
  MISLEADING:    'MISLEADING',
  INAPPROPRIATE: 'INAPPROPRIATE',
} as const
export type ReportReason = (typeof ReportReason)[keyof typeof ReportReason]