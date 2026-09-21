import { getJson, postJson, toQueryString } from './http'
import type { PlatformRole, UserDetail, UserDirectoryQuery, UserDirectoryResult } from '../types/adminUsers'

const BASE = '/api/admin/users'

export function fetchUserDirectory(
  query: UserDirectoryQuery,
  signal?: AbortSignal,
): Promise<UserDirectoryResult> {
  return getJson<UserDirectoryResult>(`${BASE}${toQueryString(query)}`, signal)
}

export function fetchUserDetail(userId: string, signal?: AbortSignal): Promise<UserDetail> {
  return getJson<UserDetail>(`${BASE}/${encodeURIComponent(userId)}`, signal)
}

export function deactivateUser(userId: string, reason: string): Promise<void> {
  return postJson(`${BASE}/${encodeURIComponent(userId)}/deactivate`, { reason })
}

export function reactivateUser(userId: string, reason: string): Promise<void> {
  return postJson(`${BASE}/${encodeURIComponent(userId)}/reactivate`, { reason })
}

export function changePlatformRole(userId: string, role: PlatformRole, reason: string): Promise<void> {
  return postJson(`${BASE}/${encodeURIComponent(userId)}/platform-role`, { role, reason })
}
