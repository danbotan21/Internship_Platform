import type { PagedResult } from './common'
import type { UserRole } from './auth'

// Mirrors the DTOs in InternshipPlatform.BusinessLayer/Admin/Users.
// Enums arrive as strings because the API registers JsonStringEnumConverter.

export type UserStatus = 'Active' | 'Deactivated'

/**
 * The platform role stored on the account and carried in the access token.
 * Re-exported from the auth types so there is one definition of it in the app.
 */
export type PlatformRole = UserRole

/** The role a person holds inside the company they belong to, if any. */
export type CompanyRole = 'Owner' | 'Recruiter' | 'Mentor'

export type UserDirectoryScope = 'All' | 'CompanyMembers' | 'Admins'

export type UserDirectorySort = 'NameAsc' | 'NameDesc'

export type UserListItem = {
  id: string
  fullName: string
  email: string
  status: UserStatus
  platformRole: PlatformRole
  companyRole: CompanyRole | null
  organisation: string | null
  lastActiveAt: string | null
}

export type UserDirectoryCounts = {
  all: number
  companyMembers: number
  admins: number
}

export type UserDirectoryResult = {
  users: PagedResult<UserListItem>
  counts: UserDirectoryCounts
}

export type UserDirectoryQuery = {
  scope?: UserDirectoryScope
  search?: string
  platformRole?: PlatformRole
  companyRole?: CompanyRole
  status?: UserStatus
  companyId?: string
  sort?: UserDirectorySort
  page?: number
  pageSize?: number
}

export type CompanyPlacement = {
  id: string
  legalName: string
  role: CompanyRole
}

export type UserDetail = {
  id: string
  fullName: string
  email: string
  status: UserStatus
  platformRole: PlatformRole
  university: string | null
  programme: string | null
  academicGroup: string | null
  emailVerified: boolean
  createdAt: string
  lastActiveAt: string | null
  deactivatedAt: string | null
  company: CompanyPlacement | null
}
