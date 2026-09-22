import { apiFetch } from './client'
import type { AuthResult, LoginPayload, RegisterPayload } from '../types/auth'

export function login(payload: LoginPayload): Promise<AuthResult> {
  return apiFetch<AuthResult>('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) })
}

export function register(payload: RegisterPayload): Promise<AuthResult> {
  return apiFetch<AuthResult>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) })
}

export function logout(refreshToken: string): Promise<void> {
  return apiFetch<void>('/api/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) })
}
