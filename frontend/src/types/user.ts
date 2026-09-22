export type Role = 'student' | 'mentor'

// A person of the internship, as returned by the backend directory.
export type InternshipMember = {
  userId: string
  fullName: string
  email: string
  role: Role
  gitHubUsername?: string | null
  mentorId?: string | null
}
