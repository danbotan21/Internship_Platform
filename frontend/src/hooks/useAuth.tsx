import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as authApi from '../api/auth'
import type { AuthResult, LoginPayload, RegisterPayload } from '../types/auth'
import { AuthContext } from './authContext'
import type { AuthContextValue, StoredSession } from './authContext'

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

export { useAuth } from './authContext'
