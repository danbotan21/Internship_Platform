import type { AuthResult } from '../types/auth'
import { getSession, sessionFromAuthResult, setSession } from './session'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5080'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function toError(response: Response) {
  const body = await response.json().catch(() => null)
  return new ApiError(body?.message ?? `The server responded with ${response.status}.`, response.status)
}

/**
 * Access tokens are short lived, so a 401 is retried once behind a refresh.
 * Parallel requests share the same refresh instead of racing each other.
 */
let refreshing: Promise<string | null> | null = null

function refreshAccessToken(): Promise<string | null> {
  refreshing ??= (async () => {
    const refreshToken = getSession()?.refreshToken
    if (!refreshToken) return null

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
  if (init.body !== undefined) headers.set('Content-Type', 'application/json')
  return { ...init, headers }
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const send = (token: string | undefined) =>
    fetch(`${API_BASE_URL}${path}`, withAuth(init, token)).catch((error: unknown) => {
      if (init.signal?.aborted) throw error
      throw new ApiError(`No response from ${API_BASE_URL}. Is the API running?`, 0)
    })

  let response = await send(getSession()?.accessToken)

  if (response.status === 401 && !init.signal?.aborted) {
    const token = await refreshAccessToken()
    if (token) response = await send(token)
  }

  if (!response.ok) throw await toError(response)
  return response
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await request(path, { signal })
  return response.json() as Promise<T>
}

export async function apiSend<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await request(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  // 204 responses carry no body.
  return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>)
}
