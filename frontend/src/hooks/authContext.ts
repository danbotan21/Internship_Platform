import { createContext, useContext } from 'react'
import type { AuthResult, LoginPayload, RegisterPayload } from '../types/auth'

export interface StoredSession {
  userId: string
  email: string
  fullName: string
  role: AuthResult['role']
  accessToken: string
  refreshToken: string
}

export interface AuthContextValue {
  session: StoredSession | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
