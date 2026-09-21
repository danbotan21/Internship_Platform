import { getJson } from './http'
import type { AdminDashboard } from '../types/adminDashboard'

export function fetchAdminDashboard(signal?: AbortSignal): Promise<AdminDashboard> {
  return getJson<AdminDashboard>('/api/admin/dashboard', signal)
}
