import { getJson, postJson, toQueryString } from './http'
import type {
  VerificationDetail,
  VerificationQueueQuery,
  VerificationQueueResult,
} from '../types/adminVerification'

const BASE = '/api/admin/verification-requests'

export function fetchVerificationQueue(
  query: VerificationQueueQuery,
  signal?: AbortSignal,
): Promise<VerificationQueueResult> {
  return getJson<VerificationQueueResult>(`${BASE}${toQueryString(query)}`, signal)
}

export function fetchVerificationDetail(requestId: string, signal?: AbortSignal): Promise<VerificationDetail> {
  return getJson<VerificationDetail>(`${BASE}/${encodeURIComponent(requestId)}`, signal)
}

export function approveVerification(requestId: string): Promise<void> {
  return postJson(`${BASE}/${encodeURIComponent(requestId)}/approve`)
}

export function rejectVerification(requestId: string, reason: string): Promise<void> {
  return postJson(`${BASE}/${encodeURIComponent(requestId)}/reject`, { reason })
}
