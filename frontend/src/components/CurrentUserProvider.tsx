import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { demoUsersApi } from '../api/demoUsers'
import { setCurrentUserId } from '../api/http'
import type { InternshipMember } from '../types/user'
import { CurrentUserContext } from './CurrentUserContext'

// TEMPORARY: until the Authentication Epic is merged, the signed-in user is a
// demo member chosen in the header ("Preview as").
const storageKey = 'internflow.preview-user'
const defaultUserId = '11111111-1111-1111-1111-111111111111'

function readStoredUserId() {
  try {
    return window.localStorage.getItem(storageKey) ?? defaultUserId
  } catch {
    return defaultUserId
  }
}

export default function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<InternshipMember[]>([])
  const [userId, setUserId] = useState(readStoredUserId)
  const [error, setError] = useState('')

  useEffect(() => {
    demoUsersApi
      .list()
      .then(setUsers)
      .catch((reason: unknown) =>
        setError(reason instanceof Error ? reason.message : 'The API is unavailable.'),
      )
  }, [])

  const user = users.find((item) => item.userId === userId) ?? users[0]

  const value = useMemo(() => {
    if (!user) return null
    // Set synchronously so the first requests of the pages carry the identity.
    setCurrentUserId(user.userId)
    return {
      user,
      role: user.role,
      users,
      switchUser: (nextId: string) => {
        setCurrentUserId(nextId)
        setUserId(nextId)
        try {
          window.localStorage.setItem(storageKey, nextId)
        } catch {
          // Preview preference only; ignore unavailable storage.
        }
      },
    }
  }, [user, users])

  if (!value) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[#f5f7f6] p-6 text-sm text-[#5d6b64]'>
        {error ? `Could not load the workspace: ${error}` : 'Loading workspace…'}
      </div>
    )
  }

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}
