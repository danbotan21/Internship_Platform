import type { AuthResult } from '../types/auth'
import { getSession, sessionFromAuthResult, setSession } from './session'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:5080'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function toError(response: Response) {
  const text = await response.text()
  let message = text
  try {
    const body = JSON.parse(text)
    message = typeof body === 'string' ? body : body?.message ?? body?.title ?? text
  } catch {
    // Some endpoints return plain-text validation errors.
  }
  return new ApiError(message || `The server responded with ${response.status}.`, response.status)
}

/**
 * Access tokens are short lived, so a 401 is retried once behind a refresh.
 * Parallel requests share the same refresh instead of racing each other.
 */
let refreshing: Promise<string | null> | null = null

function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getSession()?.refreshToken
  if (!refreshToken) return Promise.resolve(null)

  refreshing ??= (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!response.ok) {
        setSession(null)
        return null
      }
      const result = (await response.json()) as AuthResult
      setSession(sessionFromAuthResult(result))
      return result.accessToken
    } catch {
      return null
    } finally {
      refreshing = null
    }
  })()

  return refreshing
}

function withAuth(init: RequestInit, token: string | undefined): RequestInit {
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return { ...init, headers }
}

export async function apiRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const send = (token: string | undefined) =>
    fetch(`${API_BASE_URL}${path}`, withAuth(init, token)).catch((error: unknown) => {
      if (init.signal?.aborted) throw error
      throw new ApiError(`No response from ${API_BASE_URL}. Is the API running?`, 0)
    })

  const originalToken = getSession()?.accessToken
  let response = await send(originalToken)

  if (response.status === 401 && !init.signal?.aborted) {
    const currentToken = getSession()?.accessToken
    const token = currentToken && currentToken !== originalToken
      ? currentToken
      : await refreshAccessToken()
    if (token) response = await send(token)
  }

  if (!response.ok) throw await toError(response)
  return response
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await apiRequest(path, { signal })
  return response.json() as Promise<T>
}

export async function apiSend<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await apiRequest(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  // 204 responses carry no body.
  return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>)
}

/**
 * Plain one-shot fetch without the refresh retry, kept for the callers that
 * pass their own access token (auth endpoints, progress).
 */
export async function apiFetch<T>(path: string, options: RequestInit & { accessToken?: string } = {}): Promise<T> {
  const { accessToken, headers, ...rest } = options

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(body?.message ?? 'Something went wrong. Please try again.', response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}
