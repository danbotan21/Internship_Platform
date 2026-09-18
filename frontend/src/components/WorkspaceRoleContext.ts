import { createContext, useContext } from 'react'
import type { Role } from '../types/contribution'

export type WorkspaceRoleContextValue = {
  role: Role
  setRole: (role: Role) => void
}

export const WorkspaceRoleContext = createContext<WorkspaceRoleContextValue | null>(
  null,
)

export function useWorkspaceRole() {
  const context = useContext(WorkspaceRoleContext)
  if (!context) {
    throw new Error('useWorkspaceRole must be used inside WorkspaceRoleProvider')
  }
  return context
}
