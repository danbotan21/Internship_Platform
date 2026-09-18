// Shared fetch wrapper: every feature API reuses the same error handling.

// TEMPORARY: identity of the demo user chosen in the "Preview as" switcher.
// Replaced by the Authentication Epic's bearer token.
let currentUserId: string | null = null

export function setCurrentUserId(userId: string | null) {
  currentUserId = userId
}

function withIdentity(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers)
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

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, withIdentity(init))
  if (!response.ok) throw new Error(await readError(response))
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export async function requestBlob(url: string): Promise<Blob> {
  const response = await fetch(url, withIdentity())
  if (!response.ok) throw new Error(await readError(response))
  return response.blob()
}

export function jsonRequest(
  method: 'POST' | 'PUT',
  body: unknown,
): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}
