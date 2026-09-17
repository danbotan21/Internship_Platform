import { useState, useCallback, useMemo } from 'react'
import type { UserRole, UserRoleCapabilities } from '../types/documentation'

const ROLE_STORAGE_KEY = 'internflow_user_role'

export function useUserRole() {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null
    return saved === 'Mentor' || saved === 'Admin' ? saved : 'Student'
  })

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole)
    localStorage.setItem(ROLE_STORAGE_KEY, newRole)
  }, [])

  const capabilities: UserRoleCapabilities = useMemo(() => {
    switch (role) {
      case 'Admin':
        return {
          canApprove: true,
          canReject: true,
          canDelete: true,
          canUploadTemplates: true,
          canSignAsStudent: true,
          canSignAsMentor: true,
          canGenerateCertificate: true,
        }
      case 'Mentor':
        return {
          canApprove: true,
          canReject: true,
          canDelete: false,
          canUploadTemplates: false,
          canSignAsStudent: false,
          canSignAsMentor: true,
          canGenerateCertificate: true,
        }
      case 'Student':
      default:
        return {
          canApprove: true, // enabled for MVP testing
          canReject: true,  // enabled for MVP testing
          canDelete: true,
          canUploadTemplates: false,
          canSignAsStudent: true,
          canSignAsMentor: false,
          canGenerateCertificate: true,
        }
    }
  }, [role])

  return {
    role,
    setRole,
    capabilities,
    isStudent: role === 'Student',
    isMentor: role === 'Mentor',
    isAdmin: role === 'Admin',
  }
}
