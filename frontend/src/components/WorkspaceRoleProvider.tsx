import { useState, type ReactNode } from 'react'
import type { Role } from '../types/contribution'
import { WorkspaceRoleContext } from './WorkspaceRoleContext'

export default function WorkspaceRoleProvider({
  children,
}: {
  children: ReactNode
}) {
  const [role, setRole] = useState<Role>('student')

  return (
    <WorkspaceRoleContext.Provider value={{ role, setRole }}>
      {children}
    </WorkspaceRoleContext.Provider>
  )
}
