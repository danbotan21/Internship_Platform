// Shared HTTP helpers used by Contribution Management, admin pages and other features.

import { refreshAccessToken } from './client'
import { getSession } from './session'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5080'

let currentUserId: string | null = null

export function setCurrentUserId(userId: string | null) {
  currentUserId = userId
}

function apiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path
  return `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

function withIdentity(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers)
  const session = getSession()

  if (session?.accessToken) headers.set('Authorization', `Bearer ${session.accessToken}`)
  if (session?.userId) headers.set('X-User-Id', session.userId)
  if (session?.role) headers.set('X-User-Role', session.role)
  if (currentUserId) headers.set('X-Demo-User-Id', currentUserId)

  return { ...init, headers }
}

async function readError(response: Response) {
  const body = (await response.json().catch(() => null)) as {
    message?: string
    title?: string
    errors?: Record<string, string[]>
  } | null
  const validation = body?.errors ? Object.values(body.errors).flat()[0] : null
  return body?.message || validation || body?.title || `Request failed (${response.status}).`
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await requestWithRefresh(url, init)
  if (!response.ok) throw new ApiError(response.status, await readError(response))
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export async function requestBlob(url: string): Promise<Blob> {
  const response = await requestWithRefresh(url)
  if (!response.ok) throw new ApiError(response.status, await readError(response))
  return response.blob()
}

async function requestWithRefresh(url: string, init?: RequestInit): Promise<Response> {
  let response = await fetch(apiUrl(url), withIdentity(init))
  if (response.status === 401 && !init?.signal?.aborted) {
    const token = await refreshAccessToken()
    if (token) response = await fetch(apiUrl(url), withIdentity(init))
  }
  return response
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
