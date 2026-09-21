const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:5080'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Uses the ProblemDetails title from ASP.NET when there is one, so the UI can show it as is. */
async function toApiError(response: Response, fallback: string): Promise<ApiError> {
  try {
    const problem = (await response.json()) as { title?: string }
    return new ApiError(response.status, problem.title ?? fallback)
  } catch {
    return new ApiError(response.status, fallback)
  }
}

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) {
    throw await toApiError(response, `GET ${path} failed with ${response.status}`)
  }

  return (await response.json()) as T
}

/** POST that expects no response body (204 No Content). */
export async function postJson(path: string, body?: unknown): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    throw await toApiError(response, `POST ${path} failed with ${response.status}`)
  }
}

export function toQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  }

  const query = search.toString()
  return query ? `?${query}` : ''
}
