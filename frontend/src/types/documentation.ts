export type DocumentCategory =
  | 'Reports'
  | 'Certificates'
  | 'Evaluations'
  | 'Agreements'
  | 'Templates'
  | 'Other'

export type DocumentStatus =
  | 'Approved'
  | 'Pending'
  | 'Rejected'
  | 'Expiring'
  | 'Complete'

export type SigningStatus =
  | 'Draft'
  | 'Submitted'
  | 'SignedByStudent'
  | 'SignedByMentor'
  | 'SignedByUniversity'
  | 'Complete'

export type VisibilityRole = 'Public' | 'StudentOnly' | 'MentorOnly' | 'AdminOnly'

export interface DocumentAudit {
  id: string
  documentId: string
  action: 'Uploaded' | 'Approved' | 'Rejected' | 'Signed' | 'ComplianceSigned' | 'Downloaded' | 'VersionBumped' | string
  performedBy: string
  details?: string
  timestamp: string
}

export interface VaultDocument {
  id: string
  title: string
  fileName: string
  category: DocumentCategory
  fileUrl: string
  fileType: 'pdf' | 'docx' | 'xlsx' | string
  size: number // in bytes
  version: number
  status: DocumentStatus
  signingStatus: SigningStatus
  totalSignatures: number
  completedSignatures: number
  visibilityRole: VisibilityRole
  isMandatory: boolean
  rejectionReason?: string
  approvedAt?: string
  approvedBy?: string
  expiresAt?: string
  uploadedBy: string
  createdAt: string
  updatedAt: string
  audits: DocumentAudit[]
}

export interface VaultStats {
  pendingSignOffsCount: number
  dueThisWeekCount: number
  completedAgreementsPercentage: number
  completedAgreementsTrend: string
  expiringDocumentsCount: number
  expiringDocumentsAlert: string
  verificationScore: number
  verificationScoreSubtitle: string
  storageUsedBytes: number
  storageTotalBytes: number
}

export interface MandatoryChecklistItem {
  id: string
  title: string
  completed: boolean
  category?: string
  dueNote?: string
}

export interface ActivityLogItem {
  id: string
  title: string
  fileName: string
  timeAgo: string
  badgeColor?: string
}

export type UserRole = 'Student' | 'Mentor' | 'Admin'

export interface UserRoleCapabilities {
  canApprove: boolean
  canReject: boolean
  canDelete: boolean
  canUploadTemplates: boolean
  canSignAsStudent: boolean
  canSignAsMentor: boolean
  canGenerateCertificate: boolean
}
