const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5080'
const userIdStorageKey = 'internflow-user-id'
const userRoleStorageKey = 'internflow-user-role'

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
  if (typeof window === 'undefined') return '00000000-0000-0000-0000-000000000001'

  const existingUserId = window.localStorage.getItem(userIdStorageKey)
  if (existingUserId) return existingUserId

  const userId = crypto.randomUUID()
  window.localStorage.setItem(userIdStorageKey, userId)
  return userId
}

export function getUserRole() {
  if (typeof window === 'undefined') return 'Mentor'
  return window.localStorage.getItem(userRoleStorageKey) ?? 'Mentor'
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': getUserId(),
      'X-User-Role': getUserRole(),
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
