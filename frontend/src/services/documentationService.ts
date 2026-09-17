import type {
  VaultDocument,
  VaultStats,
  MandatoryChecklistItem,
  ActivityLogItem,
  DocumentCategory,
  DocumentStatus,
} from '../types/documentation'

const STORAGE_KEY_DOCS = 'internflow_vault_documents'
const STORAGE_KEY_COMPLIANCE = 'internflow_compliance_signed'

const INITIAL_DOCUMENTS: VaultDocument[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Spring Milestone 2 Report',
    fileName: 'Spring_Milestone_2_Report.pdf',
    category: 'Reports',
    fileUrl: '/uploads/Spring_Milestone_2_Report.pdf',
    fileType: 'pdf',
    size: 1468006, // 1.4 MB
    version: 3,
    status: 'Approved',
    signingStatus: 'Complete',
    totalSignatures: 3,
    completedSignatures: 3,
    visibilityRole: 'Public',
    isMandatory: true,
    approvedAt: '2025-10-24T14:00:00Z',
    approvedBy: 'Dr. Michael Chen (Mentor)',
    uploadedBy: 'Ana Popescu',
    createdAt: '2025-10-24T10:30:00Z',
    updatedAt: '2025-10-24T14:00:00Z',
    audits: [
      {
        id: 'a-101',
        documentId: '11111111-1111-1111-1111-111111111111',
        action: 'Approved',
        performedBy: 'Dr. Michael Chen (Mentor)',
        details: 'Approved final milestone report following technical presentation.',
        timestamp: '2025-10-24T14:00:00Z',
      },
      {
        id: 'a-102',
        documentId: '11111111-1111-1111-1111-111111111111',
        action: 'VersionBumped',
        performedBy: 'Ana Popescu',
        details: 'Submitted revision v3 with addressed code review annotations.',
        timestamp: '2025-10-24T11:15:00Z',
      },
      {
        id: 'a-103',
        documentId: '11111111-1111-1111-1111-111111111111',
        action: 'Uploaded',
        performedBy: 'Ana Popescu',
        details: 'Initial report uploaded for milestone evaluation.',
        timestamp: '2025-10-24T10:30:00Z',
      },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'Institutional Sign Off Agreement',
    fileName: 'Institutional_Sign_Off_Agreement.docx',
    category: 'Agreements',
    fileUrl: '/uploads/Institutional_Sign_Off_Agreement.docx',
    fileType: 'docx',
    size: 430080, // 420 KB
    version: 1,
    status: 'Pending',
    signingStatus: 'SignedByMentor',
    totalSignatures: 3,
    completedSignatures: 2,
    visibilityRole: 'Public',
    isMandatory: true,
    uploadedBy: 'Ana Popescu',
    createdAt: '2025-10-19T11:15:00Z',
    updatedAt: '2025-10-19T11:15:00Z',
    audits: [
      {
        id: 'a-201',
        documentId: '22222222-2222-2222-2222-222222222222',
        action: 'Signed',
        performedBy: 'Dr. Michael Chen (Mentor)',
        details: 'Signed institutional tripartite agreement on behalf of host company.',
        timestamp: '2025-10-20T09:12:00Z',
      },
      {
        id: 'a-202',
        documentId: '22222222-2222-2222-2222-222222222222',
        action: 'Uploaded',
        performedBy: 'Ana Popescu',
        details: 'Uploaded signed intern student copy.',
        timestamp: '2025-10-19T11:15:00Z',
      },
    ],
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    title: 'Completed Practicum Evaluation',
    fileName: 'Completed_Practicum_Evaluation.xlsx',
    category: 'Reports',
    fileUrl: '/uploads/Completed_Practicum_Evaluation.xlsx',
    fileType: 'xlsx',
    size: 2202009, // 2.1 MB
    version: 2,
    status: 'Approved',
    signingStatus: 'Complete',
    totalSignatures: 3,
    completedSignatures: 3,
    visibilityRole: 'MentorOnly',
    isMandatory: false,
    approvedAt: '2025-10-14T16:20:00Z',
    approvedBy: 'Elena Vasilescu (Coordinator)',
    uploadedBy: 'Ana Popescu',
    createdAt: '2025-10-14T09:45:00Z',
    updatedAt: '2025-10-14T16:20:00Z',
    audits: [
      {
        id: 'a-301',
        documentId: '33333333-3333-3333-3333-333333333333',
        action: 'Approved',
        performedBy: 'Elena Vasilescu (Coordinator)',
        details: 'Practicum rubrics verified and stamped.',
        timestamp: '2025-10-14T16:20:00Z',
      },
      {
        id: 'a-302',
        documentId: '33333333-3333-3333-3333-333333333333',
        action: 'Uploaded',
        performedBy: 'Ana Popescu',
        details: 'Evaluations spreadsheet uploaded with semester score cards.',
        timestamp: '2025-10-14T09:45:00Z',
      },
    ],
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    title: 'Health & Safety Compliance Form',
    fileName: 'Health_Safety_Compliance_Form.pdf',
    category: 'Agreements',
    fileUrl: '/uploads/Health_Safety_Compliance_Form.pdf',
    fileType: 'pdf',
    size: 317440, // 310 KB
    version: 1,
    status: 'Pending',
    signingStatus: 'SignedByStudent',
    totalSignatures: 3,
    completedSignatures: 2,
    visibilityRole: 'Public',
    isMandatory: true,
    expiresAt: '2025-11-15T00:00:00Z',
    uploadedBy: 'Ana Popescu',
    createdAt: '2025-10-03T08:30:00Z',
    updatedAt: '2025-10-03T08:30:00Z',
    audits: [
      {
        id: 'a-401',
        documentId: '44444444-4444-4444-4444-444444444444',
        action: 'Signed',
        performedBy: 'Ana Popescu (Student)',
        details: 'Digital compliance terms accepted and verified.',
        timestamp: '2025-10-03T09:00:00Z',
      },
      {
        id: 'a-402',
        documentId: '44444444-4444-4444-4444-444444444444',
        action: 'Uploaded',
        performedBy: 'Ana Popescu',
        details: 'Uploaded institutional Health & Safety compliance agreement.',
        timestamp: '2025-10-03T08:30:00Z',
      },
    ],
  },
]

export const INITIAL_CHECKLISTS: MandatoryChecklistItem[] = [
  { id: 'chk-1', title: 'Practice Log Agreement', completed: true },
  { id: 'chk-2', title: 'Weekly Reports (W1–W4)', completed: true },
  { id: 'chk-3', title: 'Midterm Evaluation Signoff', completed: false },
  { id: 'chk-4', title: 'Final Portfolio Certificate', completed: false },
]

export const INITIAL_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'act-1',
    title: 'File Approved by Mentor',
    fileName: 'Spring_Milestone_2_Report.pdf',
    timeAgo: '2 hours ago',
    badgeColor: 'text-emerald-600',
  },
  {
    id: 'act-2',
    title: 'New Document Uploaded',
    fileName: 'Institutional_Sign_Off_Agreement.docx',
    timeAgo: 'Yesterday',
    badgeColor: 'text-orange-500',
  },
  {
    id: 'act-3',
    title: 'Signature Requested',
    fileName: 'Health_Safety_Compliance_Form.pdf',
    timeAgo: '2 days ago',
    badgeColor: 'text-amber-500',
  },
]

class DocumentationService {
  private getLocalDocs(): VaultDocument[] {
    const raw = localStorage.getItem(STORAGE_KEY_DOCS)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(INITIAL_DOCUMENTS))
      return INITIAL_DOCUMENTS
    }
    try {
      return JSON.parse(raw)
    } catch {
      return INITIAL_DOCUMENTS
    }
  }

  private saveLocalDocs(docs: VaultDocument[]): void {
    localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(docs))
  }

  async getDocuments(params?: {
    category?: string
    status?: string
    search?: string
    mandatoryOnly?: boolean
    userRole?: string
  }): Promise<VaultDocument[]> {
    try {
      const query = new URLSearchParams()
      if (params?.category && params.category !== 'All Docs') query.append('category', params.category)
      if (params?.status) query.append('status', params.status)
      if (params?.search) query.append('search', params.search)
      if (params?.mandatoryOnly) query.append('mandatoryOnly', 'true')
      if (params?.userRole) query.append('userRole', params.userRole)

      const res = await fetch(`http://localhost:5000/api/documents?${query.toString()}`)
      if (res.ok) {
        return await res.json()
      }
    } catch {
      // Backend not running locally in dev mode; fallback to storage
    }

    // Local filter fallback
    let docs = this.getLocalDocs()

    if (params?.category && params.category !== 'All Docs') {
      docs = docs.filter(
        (d) => d.category.toLowerCase() === params.category!.toLowerCase()
      )
    }

    if (params?.status) {
      const statuses = params.status.split(',').map((s) => s.trim().toLowerCase())
      docs = docs.filter((d) => statuses.includes(d.status.toLowerCase()))
    }

    if (params?.mandatoryOnly) {
      docs = docs.filter((d) => d.isMandatory)
    }

    if (params?.search) {
      const q = params.search.toLowerCase()
      docs = docs.filter(
        (d) => d.title.toLowerCase().includes(q) || d.fileName.toLowerCase().includes(q)
      )
    }

    return docs
  }

  async uploadDocument(
    file: File,
    metadata: {
      title?: string
      category: DocumentCategory
      visibilityRole?: 'Public' | 'StudentOnly' | 'MentorOnly' | 'AdminOnly'
      isMandatory?: boolean
      uploadedBy?: string
    }
  ): Promise<VaultDocument> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (metadata.title) formData.append('title', metadata.title)
      formData.append('category', metadata.category)
      if (metadata.visibilityRole) formData.append('visibilityRole', metadata.visibilityRole)
      if (metadata.isMandatory) formData.append('isMandatory', 'true')
      if (metadata.uploadedBy) formData.append('uploadedBy', metadata.uploadedBy)

      const res = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        return await res.json()
      }
    } catch {
      // fallback
    }

    const docs = this.getLocalDocs()
    const ext = file.name.split('.').pop() || 'pdf'
    const newDoc: VaultDocument = {
      id: crypto.randomUUID(),
      title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
      fileName: file.name,
      category: metadata.category,
      fileUrl: URL.createObjectURL(file),
      fileType: ext.toLowerCase(),
      size: file.size,
      version: 1,
      status: 'Pending',
      signingStatus: 'Submitted',
      totalSignatures: 3,
      completedSignatures: 1,
      visibilityRole: metadata.visibilityRole || 'Public',
      isMandatory: !!metadata.isMandatory,
      uploadedBy: metadata.uploadedBy || 'Ana Popescu',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      audits: [
        {
          id: crypto.randomUUID(),
          documentId: '',
          action: 'Uploaded',
          performedBy: metadata.uploadedBy || 'Ana Popescu',
          details: `Uploaded ${file.name} to documentation vault.`,
          timestamp: new Date().toISOString(),
        },
      ],
    }

    docs.unshift(newDoc)
    this.saveLocalDocs(docs)
    return newDoc
  }

  async updateStatus(
    id: string,
    status: DocumentStatus,
    reason?: string,
    performedBy = 'Ana Popescu'
  ): Promise<VaultDocument | null> {
    try {
      const res = await fetch(`http://localhost:5000/api/documents/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason, performedBy }),
      })
      if (res.ok) {
        return await res.json()
      }
    } catch {
      // fallback
    }

    const docs = this.getLocalDocs()
    const doc = docs.find((d) => d.id === id)
    if (!doc) return null

    doc.status = status
    doc.updatedAt = new Date().toISOString()
    if (status === 'Approved') {
      doc.approvedAt = new Date().toISOString()
      doc.approvedBy = performedBy
      doc.rejectionReason = undefined
      doc.completedSignatures = doc.totalSignatures
      doc.signingStatus = 'Complete'
    } else if (status === 'Rejected') {
      doc.rejectionReason = reason || 'Document rejected.'
      doc.approvedAt = undefined
      doc.approvedBy = undefined
    }

    doc.audits.unshift({
      id: crypto.randomUUID(),
      documentId: doc.id,
      action: status === 'Approved' ? 'Approved' : 'Rejected',
      performedBy,
      details: status === 'Approved' ? `Approved by ${performedBy}` : `Rejected: ${doc.rejectionReason}`,
      timestamp: new Date().toISOString(),
    })

    this.saveLocalDocs(docs)
    return doc
  }

  async signDocument(
    id: string,
    role = 'Student',
    signedBy = 'Ana Popescu'
  ): Promise<VaultDocument | null> {
    try {
      const res = await fetch(`http://localhost:5000/api/documents/${id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, signedBy }),
      })
      if (res.ok) {
        return await res.json()
      }
    } catch {
      // fallback
    }

    const docs = this.getLocalDocs()
    const doc = docs.find((d) => d.id === id)
    if (!doc) return null

    if (doc.completedSignatures < doc.totalSignatures) {
      doc.completedSignatures++
    }

    if (doc.completedSignatures >= doc.totalSignatures) {
      doc.signingStatus = 'Complete'
      doc.status = 'Approved'
      doc.approvedAt = new Date().toISOString()
      doc.approvedBy = signedBy
    } else {
      doc.signingStatus = `SignedBy${role}` as any
    }

    doc.updatedAt = new Date().toISOString()
    doc.audits.unshift({
      id: crypto.randomUUID(),
      documentId: doc.id,
      action: 'Signed',
      performedBy: signedBy,
      details: `Digitally signed by ${role} (${signedBy}). Progress: ${doc.completedSignatures}/${doc.totalSignatures} signatures.`,
      timestamp: new Date().toISOString(),
    })

    this.saveLocalDocs(docs)
    return doc
  }

  async deleteDocument(id: string, performedBy = 'Ana Popescu'): Promise<boolean> {
    try {
      const res = await fetch(`http://localhost:5000/api/documents/${id}?performedBy=${performedBy}`, {
        method: 'DELETE',
      })
      if (res.ok) return true
    } catch {
      // fallback
    }

    const docs = this.getLocalDocs()
    const filtered = docs.filter((d) => d.id !== id)
    this.saveLocalDocs(filtered)
    return true
  }

  async getStats(): Promise<VaultStats> {
    try {
      const res = await fetch('http://localhost:5000/api/documents/stats')
      if (res.ok) {
        return await res.json()
      }
    } catch {
      // fallback
    }

    const docs = this.getLocalDocs()
    const pendingCount = docs.filter((d) => d.status === 'Pending' || d.signingStatus !== 'Complete').length
    const totalStorage = docs.reduce((acc, d) => acc + d.size, 0)

    return {
      pendingSignOffsCount: pendingCount || 4,
      dueThisWeekCount: 2,
      completedAgreementsPercentage: 86,
      completedAgreementsTrend: '+6% vs last month',
      expiringDocumentsCount: 2,
      expiringDocumentsAlert: 'Within 14 days',
      verificationScore: 92,
      verificationScoreSubtitle: 'All required docs signed',
      storageUsedBytes: totalStorage || 3900000,
      storageTotalBytes: 50000000,
    }
  }

  getComplianceGateStatus(): boolean {
    const raw = localStorage.getItem(STORAGE_KEY_COMPLIANCE)
    if (raw === null) {
      // Default to false so the user can test US 730 Access Gate & US 586 digital sign-off!
      return false
    }
    return raw === 'true'
  }

  setComplianceSigned(signed: boolean): void {
    localStorage.setItem(STORAGE_KEY_COMPLIANCE, signed ? 'true' : 'false')
  }

  async batchAction(
    ids: string[],
    action: 'Delete' | 'Approve',
    performedBy = 'Ana Popescu'
  ): Promise<number> {
    try {
      const res = await fetch('http://localhost:5000/api/documents/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds: ids, action, performedBy }),
      })
      if (res.ok) {
        const data = await res.json()
        return data.affectedCount
      }
    } catch {
      // fallback
    }

    const docs = this.getLocalDocs()
    if (action === 'Delete') {
      const filtered = docs.filter((d) => !ids.includes(d.id))
      this.saveLocalDocs(filtered)
      return ids.length
    } else if (action === 'Approve') {
      for (const d of docs) {
        if (ids.includes(d.id)) {
          d.status = 'Approved'
          d.approvedAt = new Date().toISOString()
          d.approvedBy = performedBy
          d.completedSignatures = d.totalSignatures
          d.signingStatus = 'Complete'
        }
      }
      this.saveLocalDocs(docs)
      return ids.length
    }
    return 0
  }

  resetToDefault(): void {
    localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(INITIAL_DOCUMENTS))
    localStorage.removeItem(STORAGE_KEY_COMPLIANCE)
  }
}

export const documentationService = new DocumentationService()
