import React, { createContext, useContext, useState } from 'react'

type Role = 'Intern' | 'Mentor'

interface UserRoleContextType {
  role: Role
  setRole: (role: Role) => void
}

const UserRoleContext = createContext<UserRoleContextType>({
  role: 'Intern',
  setRole: () => {},
})

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [role, setRole] = useState<Role>('Intern')

  return (
    <UserRoleContext.Provider value={{ role, setRole }}>
      {children}
    </UserRoleContext.Provider>
  )
}

export const useUserRole = () => useContext(UserRoleContext)
