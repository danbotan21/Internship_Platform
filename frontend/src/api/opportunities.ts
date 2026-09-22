import type {
  Opportunity,
  OpportunityQueryParams,
  OpportunityListResult,
  CreateOpportunityPayload,
  StudentApplicationListItem,
  ApplicationDetail,
  ReviewApplicationPayload,
} from '../types/opportunities'
import { normalizeOpportunity } from '../types/opportunities'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5080'

function getAuthHeaders(includeContentType = true): HeadersInit {
  const headers: Record<string, string> = {}
  if (includeContentType) {
    headers['Content-Type'] = 'application/json'
  }

  try {
    const raw = localStorage.getItem('internflow.session')
    if (raw) {
      const session = JSON.parse(raw)
      if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`
      }
    }
  } catch {
    // Ignore storage parse error
  }

  return headers
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    const errorMsg =
      errorBody?.message ||
      (Array.isArray(errorBody?.errors) ? errorBody.errors.join(', ') : null) ||
      `HTTP Error ${response.status}: ${response.statusText}`
    throw new Error(errorMsg)
  }

  const json = await response.json()
  // If backend wraps in ApiResponse { success, data, message, errors }
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T
  }
  return json as T
}

// ─── Student / Public Opportunities ──────────────────────────────────────────

/**
 * GET /api/opportunities with optional filters
 */
export async function getOpportunities(
  params?: OpportunityQueryParams
): Promise<OpportunityListResult> {
  const query = new URLSearchParams()
  if (params?.search) query.append('search', params.search)
  if (params?.status) query.append('status', params.status)
  if (params?.field && params.field !== 'All') query.append('field', params.field)
  if (params?.type && params.type !== 'All') query.append('type', params.type)
  if (params?.locationType && params.locationType !== 'All')
    query.append('locationType', params.locationType)
  if (params?.durationCategory && params.durationCategory !== 'All')
    query.append('durationCategory', params.durationCategory)
  if (params?.page) query.append('page', String(params.page))
  if (params?.limit) query.append('limit', String(params.limit))

  const queryString = query.toString()
  const url = `${API_BASE_URL}/api/opportunities${queryString ? `?${queryString}` : ''}`

  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  const data = await handleApiResponse<{ items: any[]; pagination: any }>(res)

  return {
    items: (data.items || []).map(normalizeOpportunity),
    pagination: data.pagination || {
      totalItems: data.items?.length || 0,
      totalPages: 1,
      currentPage: 1,
      limit: 10,
    },
  }
}

/**
 * GET /api/opportunities/:id
 */
export async function getOpportunityById(id: string): Promise<Opportunity> {
  const res = await fetch(`${API_BASE_URL}/api/opportunities/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const data = await handleApiResponse<any>(res)
  return normalizeOpportunity(data)
}

/**
 * POST /api/opportunities/:id/save
 */
export async function saveOpportunity(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/api/opportunities/${id}/save`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  return handleApiResponse<boolean>(res)
}

/**
 * DELETE /api/opportunities/:id/save
 */
export async function unsaveOpportunity(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/api/opportunities/${id}/save`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return handleApiResponse<boolean>(res)
}

/**
 * POST /api/opportunities/:id/apply (multipart/form-data)
 */
export async function applyToOpportunity(
  opportunityId: string,
  formData: FormData
): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/api/opportunities/${opportunityId}/apply`, {
    method: 'POST',
    headers: getAuthHeaders(false), // don't set Content-Type so browser sets boundary
    body: formData,
  })
  return handleApiResponse<boolean>(res)
}

// ─── Student Workspace (Applications) ────────────────────────────────────────

/**
 * GET /api/student/applications
 */
export async function getMyApplications(): Promise<StudentApplicationListItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/student/applications`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return handleApiResponse<StudentApplicationListItem[]>(res)
}

/**
 * GET /api/student/applications/:id
 */
export async function getMyApplicationById(id: string): Promise<ApplicationDetail> {
  const res = await fetch(`${API_BASE_URL}/api/student/applications/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return handleApiResponse<ApplicationDetail>(res)
}

// ─── Mentor Workspace ────────────────────────────────────────────────────────

/**
 * GET /api/mentor/opportunities
 */
export async function getMentorOpportunities(): Promise<Opportunity[]> {
  const res = await fetch(`${API_BASE_URL}/api/mentor/opportunities`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const rawList = await handleApiResponse<any[]>(res)
  return (rawList || []).map(normalizeOpportunity)
}

/**
 * POST /api/mentor/opportunities
 */
export async function createOpportunity(
  payload: CreateOpportunityPayload
): Promise<Opportunity> {
  const res = await fetch(`${API_BASE_URL}/api/mentor/opportunities`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await handleApiResponse<any>(res)
  return normalizeOpportunity(data)
}

/**
 * PUT /api/mentor/opportunities/:id
 */
export async function updateOpportunity(
  id: string,
  payload: CreateOpportunityPayload
): Promise<Opportunity> {
  const res = await fetch(`${API_BASE_URL}/api/mentor/opportunities/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await handleApiResponse<any>(res)
  return normalizeOpportunity(data)
}

/**
 * PATCH /api/mentor/opportunities/:id/status
 */
export async function patchOpportunityStatus(
  id: string,
  status: string
): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/api/mentor/opportunities/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  })
  return handleApiResponse<boolean>(res)
}

/**
 * GET /api/mentor/opportunities/:id/applications
 */
export async function getApplicationsByOpportunity(
  opportunityId: string
): Promise<ApplicationDetail[]> {
  const res = await fetch(
    `${API_BASE_URL}/api/mentor/opportunities/${opportunityId}/applications`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  )
  return handleApiResponse<ApplicationDetail[]>(res)
}

/**
 * GET /api/mentor/applications/:applicationId/review
 */
export async function getApplicationForReview(
  applicationId: string
): Promise<ApplicationDetail> {
  const res = await fetch(
    `${API_BASE_URL}/api/mentor/applications/${applicationId}/review`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  )
  return handleApiResponse<ApplicationDetail>(res)
}

/**
 * POST /api/mentor/applications/:applicationId/review
 */
export async function reviewApplication(
  applicationId: string,
  payload: ReviewApplicationPayload
): Promise<boolean> {
  const res = await fetch(
    `${API_BASE_URL}/api/mentor/applications/${applicationId}/review`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }
  )
  return handleApiResponse<boolean>(res)
}

/**
 * GET /api/mentor/company-info
 */
export async function getCompanyInfo(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/mentor/company-info`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return handleApiResponse<string>(res)
}

/**
 * Download document via fetch blob
 */
export async function downloadDocument(documentId: string, fileName?: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/documents/${documentId}/download`, {
    method: 'GET',
    headers: getAuthHeaders(false),
  })

  if (!res.ok) {
    throw new Error(`Failed to download document (${res.status})`)
  }

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName || `document-${documentId}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}
