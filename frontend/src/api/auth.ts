import type { AuthResult, LoginPayload, RegisterPayload } from '../types/auth'
import { API_BASE_URL } from './client'

async function handleAuthResponse(response: Response): Promise<AuthResult> {
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message ?? 'Something went wrong. Please try again.')
  }
  return response.json()
}

function post(path: string, body: unknown) {
  return fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function login(payload: LoginPayload): Promise<AuthResult> {
  return post('/api/auth/login', payload).then(handleAuthResponse)
}

export function register(payload: RegisterPayload): Promise<AuthResult> {
  return post('/api/auth/register', payload).then(handleAuthResponse)
}

export function logout(refreshToken: string): Promise<void> {
  return post('/api/auth/logout', { refreshToken }).then(() => undefined)
}
