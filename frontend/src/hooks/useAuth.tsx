/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as authApi from '../api/auth'
import type { AuthResult, LoginPayload, RegisterPayload } from '../types/auth'

interface StoredSession {
  userId: string
  email: string
  fullName: string
  role: AuthResult['role']
  accessToken: string
  refreshToken: string
}

const STORAGE_KEY = 'internflow.session'

function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredSession) : null
  } catch {
    return null
  }
}

function writeStoredSession(session: StoredSession | null) {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    return
  }
}

interface AuthContextValue {
  session: StoredSession | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(readStoredSession)

  const applyAuthResult = useCallback((result: AuthResult) => {
    const next: StoredSession = {
      userId: result.userId,
      email: result.email,
      fullName: result.fullName,
      role: result.role,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }
    setSession(next)
    writeStoredSession(next)
  }, [])

  const login = useCallback(
    async (payload: LoginPayload) => {
      const result = await authApi.login(payload)
      applyAuthResult(result)
    },
    [applyAuthResult],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const result = await authApi.register(payload)
      applyAuthResult(result)
    },
    [applyAuthResult],
  )

  const logout = useCallback(async () => {
    if (session) {
      await authApi.logout(session.refreshToken).catch(() => undefined)
    }
    setSession(null)
    writeStoredSession(null)
  }, [session])

  const value = useMemo<AuthContextValue>(
    () => ({ session, isAuthenticated: session !== null, login, register, logout }),
    [session, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
