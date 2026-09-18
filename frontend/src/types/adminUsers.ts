import type { PagedResult } from './common'

// Mirrors the DTOs in InternshipPlatform.BusinessLayer/Admin/Users.
// Enums arrive as strings because the API registers JsonStringEnumConverter.

export type UserStatus = 'Active' | 'Deactivated'

export type DirectoryRole = 'User' | 'Admin' | 'Owner' | 'Recruiter' | 'Mentor'

export type CompanyRole = 'Owner' | 'Recruiter' | 'Mentor'

export type UserDirectoryScope = 'All' | 'CompanyMembers' | 'Admins'

export type UserDirectorySort = 'NameAsc' | 'NameDesc'

export type UserListItem = {
  id: string
  fullName: string
  email: string
  status: UserStatus
  role: DirectoryRole
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
  role?: DirectoryRole
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
  role: DirectoryRole
  university: string | null
  programme: string | null
  academicGroup: string | null
  emailVerified: boolean
  createdAt: string
  lastActiveAt: string | null
  company: CompanyPlacement | null
}
