import type { AuthResult, LoginPayload, RegisterPayload } from '../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5080'

async function handleAuthResponse(response: Response): Promise<AuthResult> {
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message ?? 'Something went wrong. Please try again.')
  }
  return response.json()
}

export function login(payload: LoginPayload): Promise<AuthResult> {
  return fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handleAuthResponse)
}

export function register(payload: RegisterPayload): Promise<AuthResult> {
  return fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handleAuthResponse)
}

export function logout(refreshToken: string): Promise<void> {
  return fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }).then(() => undefined)
}
