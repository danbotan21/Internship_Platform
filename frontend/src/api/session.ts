import type { AuthResult } from '../types/auth'

export interface StoredSession {
  userId: string
  email: string
  fullName: string
  role: AuthResult['role']
  accessToken: string
  refreshToken: string
}

const STORAGE_KEY = 'internflow.session'

function read(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredSession) : null
  } catch {
    return null
  }
}

function persist(session: StoredSession | null) {
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

/**
 * The signed-in session, held outside React so the API layer can reach the
 * access token without a hook. useAuth subscribes to it for rendering.
 */
let current: StoredSession | null = read()

type Listener = (session: StoredSession | null) => void
const listeners = new Set<Listener>()

export const getSession = () => current

export function setSession(session: StoredSession | null) {
  current = session
  persist(session)
  for (const listener of listeners) listener(session)
}

export function subscribeToSession(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const sessionFromAuthResult = (result: AuthResult): StoredSession => ({
  userId: result.userId,
  email: result.email,
  fullName: result.fullName,
  role: result.role,
  accessToken: result.accessToken,
  refreshToken: result.refreshToken,
})
