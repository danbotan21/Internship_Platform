import type { PagedResult } from './common'

// Mirrors the DTOs in InternshipPlatform.BusinessLayer/Admin/Verification.

export type VerificationStatus = 'Pending' | 'Approved' | 'Rejected'

export type VerificationQueueSort = 'OldestFirst' | 'NewestFirst'

export type VerificationListItem = {
  id: string
  legalName: string
  registrationNumber: string
  status: VerificationStatus
  requesterName: string
  emailDomainMatchesWebsite: boolean
  submittedAt: string
}

export type VerificationCounts = {
  pending: number
  approved: number
  rejected: number
}

export type VerificationQueueResult = {
  requests: PagedResult<VerificationListItem>
  counts: VerificationCounts
}

export type VerificationQueueQuery = {
  status?: VerificationStatus
  search?: string
  sort?: VerificationQueueSort
  page?: number
  pageSize?: number
}

export type VerificationRequester = {
  userId: string
  name: string
  email: string
  position: string
  phone: string | null
  accountCreatedAt: string
}

export type VerificationChecks = {
  emailDomainMatchesWebsite: boolean
  registrationNumberFormatValid: boolean
}

export type VerificationDetail = {
  id: string
  status: VerificationStatus
  legalName: string
  registrationNumber: string
  website: string
  headquarters: string
  industry: string
  companySize: string
  requester: VerificationRequester
  checks: VerificationChecks
  earlierRequestsForRegistration: number
  submittedAt: string
  decidedAt: string | null
  decidedByName: string | null
  rejectionReason: string | null
  companyId: string | null
}
