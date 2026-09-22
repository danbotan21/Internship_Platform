/* eslint-disable react-refresh/only-export-components */
import { useCallback, useMemo, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import * as authApi from '../api/auth'
import { getSession, sessionFromAuthResult, setSession, subscribeToSession } from '../api/session'
import type { AuthResult, LoginPayload, RegisterPayload } from '../types/auth'
// The context itself lives in authContext so both import paths resolve to one
// provider; the session store in ../api/session is the single source of truth.
import { AuthContext } from './authContext'
import type { AuthContextValue } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  // The session lives in the API layer, which also refreshes it behind a 401.
  const session = useSyncExternalStore(subscribeToSession, getSession, getSession)

  const applyAuthResult = useCallback((result: AuthResult) => {
    setSession(sessionFromAuthResult(result))
  }, [])

  const login = useCallback(
    async (payload: LoginPayload) => {
      applyAuthResult(await authApi.login(payload))
    },
    [applyAuthResult],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      applyAuthResult(await authApi.register(payload))
    },
    [applyAuthResult],
  )

  const logout = useCallback(async () => {
    const refreshToken = getSession()?.refreshToken
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => undefined)
    }
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ session, isAuthenticated: session !== null, login, register, logout }),
    [session, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { useAuth } from './authContext'
