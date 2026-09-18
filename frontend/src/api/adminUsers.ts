import { getJson, toQueryString } from './http'
import type { UserDetail, UserDirectoryQuery, UserDirectoryResult } from '../types/adminUsers'

export function fetchUserDirectory(
  query: UserDirectoryQuery,
  signal?: AbortSignal,
): Promise<UserDirectoryResult> {
  return getJson<UserDirectoryResult>(`/api/admin/users${toQueryString(query)}`, signal)
}

export function fetchUserDetail(userId: string, signal?: AbortSignal): Promise<UserDetail> {
  return getJson<UserDetail>(`/api/admin/users/${encodeURIComponent(userId)}`, signal)
}
