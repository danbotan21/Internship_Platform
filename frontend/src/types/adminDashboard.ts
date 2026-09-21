// Mirrors the DTOs in InternshipPlatform.BusinessLayer/Admin/Dashboard.

export type PendingVerification = {
  id: string
  legalName: string
  requesterName: string
  submittedAt: string
}

export type AdminDashboard = {
  users: {
    active: number
    deactivated: number
    deactivatedLast7Days: number
  }
  companies: {
    total: number
    suspended: number
  }
  verification: {
    pending: number
    oldestPendingSubmittedAt: string | null
    oldestPending: PendingVerification[]
  }
}
