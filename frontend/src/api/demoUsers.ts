import type { InternshipMember } from '../types/user'
import { requestJson } from './http'

// TEMPORARY: demo members for the "Preview as" switcher, until the
// Authentication Epic provides real sign-in.
export const demoUsersApi = {
  list: () => requestJson<InternshipMember[]>('/api/demo/users'),
}
