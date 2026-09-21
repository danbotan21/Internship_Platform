import { getJson, postJson, toQueryString } from './http'
import type { CompanyDetail, CompanyListQuery, CompanyListResult } from '../types/adminCompanies'

const BASE = '/api/admin/companies'

export function fetchCompanies(query: CompanyListQuery, signal?: AbortSignal): Promise<CompanyListResult> {
  return getJson<CompanyListResult>(`${BASE}${toQueryString(query)}`, signal)
}

export function fetchCompanyDetail(companyId: string, signal?: AbortSignal): Promise<CompanyDetail> {
  return getJson<CompanyDetail>(`${BASE}/${encodeURIComponent(companyId)}`, signal)
}

export function suspendCompany(companyId: string, reason: string): Promise<void> {
  return postJson(`${BASE}/${encodeURIComponent(companyId)}/suspend`, { reason })
}

export function restoreCompany(companyId: string, reason: string): Promise<void> {
  return postJson(`${BASE}/${encodeURIComponent(companyId)}/restore`, { reason })
}
