import { createContext, useContext } from 'react'
import type { InternshipMember, Role } from '../types/user'

export type CurrentUserContextValue = {
  user: InternshipMember
  role: Role
  users: InternshipMember[]
  switchUser: (userId: string) => void
}

export const CurrentUserContext = createContext<CurrentUserContextValue | null>(null)

export function useCurrentUser() {
  const context = useContext(CurrentUserContext)
  if (!context) {
    throw new Error('useCurrentUser must be used inside CurrentUserProvider')
  }
  return context
}
