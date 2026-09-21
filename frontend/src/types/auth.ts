export type UserRole = 'Student' | 'Mentor' | 'Company' | 'Admin'

export interface AuthResult {
  userId: string
  email: string
  fullName: string
  role: UserRole
  accessToken: string
  refreshToken: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
}
