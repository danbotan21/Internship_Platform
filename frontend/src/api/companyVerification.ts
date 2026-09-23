import { getJson, postJson } from './http'
import type { MyVerificationState, SubmitVerificationRequest } from '../types/companyVerification'

const BASE = '/api/company-verification'

export function fetchMyVerification(signal?: AbortSignal): Promise<MyVerificationState> {
  return getJson<MyVerificationState>(`${BASE}/me`, signal)
}

export function submitVerification(request: SubmitVerificationRequest): Promise<void> {
  return postJson(BASE, request)
}
