const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5080'
const sessionStorageKey = 'internflow.session'

function getStoredSession() {
  if (typeof window === 'undefined') return null

  try {
    return JSON.parse(window.localStorage.getItem(sessionStorageKey) ?? 'null') as {
      accessToken?: string
      userId?: string
      role?: string
    } | null
  } catch {
    return null
  }
}

export type Resource = {
  id: string
  createdByUserId: string
  slug: string
  type: string
  format: string
  title: string
  description: string
  owner: string
  contentHtml: string
  category: string
  mentorName: string
  tags: string[]
  targetGroup: string | null
  isDraft: boolean
  updatedAt: string
  isFavorite: boolean
}

export type CreateResourceRequest = {
  title: string
  description: string
  contentHtml: string
  type: string
  format: string
  category: string
  owner: string
  mentorName: string
  tags: string[]
  targetGroup: string | null
  isDraft: boolean
}

export type UpdateResourceRequest = CreateResourceRequest

export function getUserId() {
  if (typeof window === 'undefined') return ''

  try {
    const session = JSON.parse(window.localStorage.getItem(sessionStorageKey) ?? 'null')
    return typeof session?.userId === 'string' ? session.userId : ''
  } catch {
    return ''
  }
}

export function getUserRole() {
  if (typeof window === 'undefined') return ''

  try {
    const session = JSON.parse(window.localStorage.getItem(sessionStorageKey) ?? 'null')
    return typeof session?.role === 'string' ? session.role : ''
  } catch {
    return ''
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const session = getStoredSession()

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...(session?.userId ? { 'X-User-Id': session.userId } : {}),
      ...(session?.role ? { 'X-User-Role': session.role } : {}),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function getResources(params?: { search?: string; category?: string; favorites?: boolean; mine?: boolean; drafts?: boolean }) {
  const query = new URLSearchParams()
  if (params?.search) query.set('search', params.search)
  if (params?.category) query.set('category', params.category)
  if (params?.favorites !== undefined) query.set('favorites', String(params.favorites))
  if (params?.mine !== undefined) query.set('mine', String(params.mine))
  if (params?.drafts !== undefined) query.set('drafts', String(params.drafts))

  const queryString = query.toString()
  return request<Resource[]>(`/api/resources${queryString ? `?${queryString}` : ''}`)
}

export function getResource(slug: string) {
  return request<Resource>(`/api/resources/${encodeURIComponent(slug)}`)
}

export function createResource(resource: CreateResourceRequest) {
  return request<Resource>('/api/resources', {
    method: 'POST',
    body: JSON.stringify(resource),
  })
}

export function updateResource(id: string, resource: UpdateResourceRequest) {
  return request<Resource>(`/api/resources/${id}`, {
    method: 'PUT',
    body: JSON.stringify(resource),
  })
}

export function addResourceFavorite(resourceId: string) {
  return request<void>(`/api/resources/${resourceId}/favorite`, { method: 'POST' })
}

export function removeResourceFavorite(resourceId: string) {
  return request<void>(`/api/resources/${resourceId}/favorite`, { method: 'DELETE' })
}

export function deleteResource(resourceId: string) {
  return request<void>(`/api/resources/${resourceId}`, { method: 'DELETE' })
}

export type Notification = {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export function getNotifications() {
  return request<Notification[]>('/api/notifications')
}

export function markNotificationAsRead(id: string) {
  return request<void>(`/api/notifications/${id}/read`, { method: 'POST' })
}
