import { Role, CampaignStatus, DonationStatus, PaymentStatus } from '../types/prisma-enums'

export const toRole = (role: Role): 'user' | 'admin' => {
  return role.toLowerCase() as 'user' | 'admin'
}

export const toCampaignStatus = (status: CampaignStatus): string => {
  return status.toLowerCase()
}

export const toDonationStatus = (status: DonationStatus): string => {
  return status.toLowerCase()
}

export const toPaymentStatus = (status: PaymentStatus): string => {
  return status.toLowerCase()
}