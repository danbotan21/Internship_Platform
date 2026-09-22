import type { PagedResult } from './common'
import type { CompanyRole } from './adminUsers'

// Mirrors the DTOs in InternshipPlatform.BusinessLayer/Admin/Companies.

export type CompanyStatus = 'Active' | 'Suspended'

export type CompanyListSort = 'NameAsc' | 'NameDesc'

export type CompanyListItem = {
  id: string
  legalName: string
  registrationNumber: string
  status: CompanyStatus
  ownerName: string | null
  memberCount: number
}

export type CompanyCounts = {
  active: number
  suspended: number
}

export type CompanyListResult = {
  companies: PagedResult<CompanyListItem>
  counts: CompanyCounts
}

export type CompanyListQuery = {
  status?: CompanyStatus
  search?: string
  sort?: CompanyListSort
  page?: number
  pageSize?: number
}

export type CompanyMember = {
  userId: string
  fullName: string
  email: string
  role: CompanyRole
  joinedAt: string
}

export type CompanyDetail = {
  id: string
  legalName: string
  registrationNumber: string
  website: string
  headquarters: string
  industry: string
  companySize: string
  status: CompanyStatus
  verifiedAt: string
  verifiedByName: string | null
  verificationRequestId: string | null
  suspendedAt: string | null
  members: CompanyMember[]
}
