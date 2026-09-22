// All authenticated modules share token refresh and error handling.
import { apiRequest } from './client'
export { ApiError } from './client'

let currentUserId: string | null = null

export function setCurrentUserId(userId: string | null) {
  currentUserId = userId
}

function withIdentity(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers)
  if (currentUserId) headers.set('X-Demo-User-Id', currentUserId)
  return { ...init, headers }
}

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await apiRequest(url, withIdentity(init))
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export async function requestBlob(url: string): Promise<Blob> {
  const response = await apiRequest(url, withIdentity())
  return response.blob()
}

export function jsonRequest(method: 'POST' | 'PUT', body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  return requestJson<T>(path, {
    headers: { Accept: 'application/json' },
    signal,
  })
}

/** POST helper for API endpoints that return no response body. */
export async function postJson(path: string, body?: unknown): Promise<void> {
  await requestJson<void>(path, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

export function toQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }

  const query = search.toString()
  return query ? `?${query}` : ''
}
