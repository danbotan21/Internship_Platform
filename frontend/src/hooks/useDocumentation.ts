import { useState, useEffect, useCallback, useMemo } from 'react'
import type {
  VaultDocument,
  VaultStats,
  MandatoryChecklistItem,
  ActivityLogItem,
  DocumentCategory,
  DocumentStatus,
} from '../types/documentation'
import {
  documentationService,
  INITIAL_CHECKLISTS,
  INITIAL_ACTIVITY_LOGS,
} from '../services/documentationService'

export function useDocumentation(userRole = 'Student') {
  const [documents, setDocuments] = useState<VaultDocument[]>([])
  const [stats, setStats] = useState<VaultStats>({
    pendingSignOffsCount: 4,
    dueThisWeekCount: 2,
    completedAgreementsPercentage: 86,
    completedAgreementsTrend: '+6% vs last month',
    expiringDocumentsCount: 2,
    expiringDocumentsAlert: 'Within 14 days',
    verificationScore: 92,
    verificationScoreSubtitle: 'All required docs signed',
    storageUsedBytes: 3900000,
    storageTotalBytes: 50000000,
  })
  const [checklists, setChecklists] = useState<MandatoryChecklistItem[]>(INITIAL_CHECKLISTS)
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(INITIAL_ACTIVITY_LOGS)

  // Filters state
  const [activeTab, setActiveTab] = useState<'All Docs' | DocumentCategory>('All Docs')
  const [categoryFilters, setCategoryFilters] = useState<Record<DocumentCategory, boolean>>({
    Reports: true,
    Certificates: true,
    Evaluations: true,
    Agreements: true,
    Templates: false,
    Other: false,
  })
  const [statusFilters, setStatusFilters] = useState<Record<DocumentStatus, boolean>>({
    Approved: true,
    Pending: true,
    Rejected: false,
    Expiring: false,
    Complete: false,
  })
  const [mandatoryOnly, setMandatoryOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Selection & modal state
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([])
  const [selectedDoc, setSelectedDoc] = useState<VaultDocument | null>(null)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [docToReject, setDocToReject] = useState<VaultDocument | null>(null)
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false)
  const [isComplianceSigned, setIsComplianceSigned] = useState<boolean>(() =>
    documentationService.getComplianceGateStatus()
  )
  const [isLoading, setIsLoading] = useState(true)

  const refreshData = useCallback(async () => {
    setIsLoading(true)
    try {
      const docs = await documentationService.getDocuments({
        userRole,
      })
      setDocuments(docs)
      const newStats = await documentationService.getStats()
      setStats(newStats)
    } finally {
      setIsLoading(false)
    }
  }, [userRole])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Filtered documents calculation
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // 1. Tab filter
      if (activeTab !== 'All Docs') {
        if (doc.category.toLowerCase() !== activeTab.toLowerCase()) return false
      }

      // 2. Category checkboxes filter
      // If at least one category checkbox is true, require doc.category to be selected
      const activeCats = Object.entries(categoryFilters).filter(([, v]) => v).map(([k]) => k.toLowerCase())
      if (activeCats.length > 0 && !activeCats.includes(doc.category.toLowerCase())) {
        return false
      }

      // 3. Status checkboxes filter
      const activeStatuses = Object.entries(statusFilters).filter(([, v]) => v).map(([k]) => k.toLowerCase())
      if (activeStatuses.length > 0 && !activeStatuses.includes(doc.status.toLowerCase())) {
        return false
      }

      // 4. Mandatory toggle
      if (mandatoryOnly && !doc.isMandatory) {
        return false
      }

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = doc.title.toLowerCase().includes(q)
        const matchesFile = doc.fileName.toLowerCase().includes(q)
        const matchesCategory = doc.category.toLowerCase().includes(q)
        if (!matchesTitle && !matchesFile && !matchesCategory) return false
      }

      return true
    })
  }, [documents, activeTab, categoryFilters, statusFilters, mandatoryOnly, searchQuery])

  // Handlers
  const handleToggleCategory = useCallback((cat: DocumentCategory) => {
    setCategoryFilters((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }, [])

  const handleToggleStatus = useCallback((status: DocumentStatus) => {
    setStatusFilters((prev) => ({ ...prev, [status]: !prev[status] }))
  }, [])

  const handleToggleMandatory = useCallback(() => {
    setMandatoryOnly((prev) => !prev)
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedDocIds.length === filteredDocuments.length) {
      setSelectedDocIds([])
    } else {
      setSelectedDocIds(filteredDocuments.map((d) => d.id))
    }
  }, [selectedDocIds.length, filteredDocuments])

  const handleToggleSelectRow = useCallback((id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }, [])

  const handleOpenPreview = useCallback((doc: VaultDocument) => {
    setSelectedDoc(doc)
  }, [])

  const handleClosePreview = useCallback(() => {
    setSelectedDoc(null)
  }, [])

  const handleUploadFile = useCallback(
    async (file: File, category: DocumentCategory = 'Other') => {
      const created = await documentationService.uploadDocument(file, {
        category,
        uploadedBy: 'Ana Popescu',
        isMandatory: category === 'Agreements',
      })

      setDocuments((prev) => [created, ...prev])
      setActivityLogs((prev) => [
        {
          id: crypto.randomUUID(),
          title: 'New Document Uploaded',
          fileName: created.fileName,
          timeAgo: 'Just now',
          badgeColor: 'text-orange-500',
        },
        ...prev,
      ])
      await refreshData()
      return created
    },
    [refreshData]
  )

  const handleApprove = useCallback(
    async (id: string) => {
      const updated = await documentationService.updateStatus(
        id,
        'Approved',
        undefined,
        userRole === 'Mentor' ? 'Dr. Michael Chen (Mentor)' : 'Ana Popescu'
      )
      if (updated) {
        setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)))
        if (selectedDoc?.id === id) setSelectedDoc(updated)
        setActivityLogs((prev) => [
          {
            id: crypto.randomUUID(),
            title: 'File Approved by Mentor',
            fileName: updated.fileName,
            timeAgo: 'Just now',
            badgeColor: 'text-emerald-600',
          },
          ...prev,
        ])
      }
    },
    [userRole, selectedDoc?.id]
  )

  const handleOpenRejectModal = useCallback((doc: VaultDocument) => {
    setDocToReject(doc)
    setIsRejectModalOpen(true)
  }, [])

  const handleConfirmReject = useCallback(
    async (reason: string) => {
      if (!docToReject) return
      const updated = await documentationService.updateStatus(
        docToReject.id,
        'Rejected',
        reason,
        userRole === 'Mentor' ? 'Dr. Michael Chen (Mentor)' : 'Ana Popescu'
      )
      if (updated) {
        setDocuments((prev) => prev.map((d) => (d.id === docToReject.id ? updated : d)))
        if (selectedDoc?.id === docToReject.id) setSelectedDoc(updated)
        setActivityLogs((prev) => [
          {
            id: crypto.randomUUID(),
            title: 'File Rejected with Reason',
            fileName: updated.fileName,
            timeAgo: 'Just now',
            badgeColor: 'text-red-500',
          },
          ...prev,
        ])
      }
      setIsRejectModalOpen(false)
      setDocToReject(null)
    },
    [docToReject, userRole, selectedDoc?.id]
  )

  const handleSignDocument = useCallback(
    async (id: string) => {
      const updated = await documentationService.signDocument(
        id,
        userRole === 'Mentor' ? 'Mentor' : 'Student',
        'Ana Popescu'
      )
      if (updated) {
        setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)))
        if (selectedDoc?.id === id) setSelectedDoc(updated)
        setActivityLogs((prev) => [
          {
            id: crypto.randomUUID(),
            title: 'Signature Confirmed',
            fileName: updated.fileName,
            timeAgo: 'Just now',
            badgeColor: 'text-emerald-600',
          },
          ...prev,
        ])
      }
    },
    [userRole, selectedDoc?.id]
  )

  const handleDeleteDocument = useCallback(
    async (id: string) => {
      await documentationService.deleteDocument(id)
      setDocuments((prev) => prev.filter((d) => d.id !== id))
      if (selectedDoc?.id === id) setSelectedDoc(null)
      setSelectedDocIds((prev) => prev.filter((i) => i !== id))
    },
    [selectedDoc?.id]
  )

  const handleBulkDelete = useCallback(async () => {
    if (selectedDocIds.length === 0) return
    await documentationService.batchAction(selectedDocIds, 'Delete')
    setDocuments((prev) => prev.filter((d) => !selectedDocIds.includes(d.id)))
    setSelectedDocIds([])
  }, [selectedDocIds])

  const handleBulkApprove = useCallback(async () => {
    if (selectedDocIds.length === 0) return
    await documentationService.batchAction(selectedDocIds, 'Approve')
    await refreshData()
    setSelectedDocIds([])
  }, [selectedDocIds, refreshData])

  const handleSignCompliance = useCallback(() => {
    documentationService.setComplianceSigned(true)
    setIsComplianceSigned(true)
    setActivityLogs((prev) => [
      {
        id: crypto.randomUUID(),
        title: 'Health & Safety Sign-Off Confirmed',
        fileName: 'Health_Safety_Compliance_Form.pdf',
        timeAgo: 'Just now',
        badgeColor: 'text-emerald-600',
      },
      ...prev,
    ])
  }, [])

  const toggleChecklistItem = useCallback((id: string) => {
    setChecklists((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    )
  }, [])

  return {
    documents: filteredDocuments,
    allDocumentsCount: documents.length,
    stats,
    checklists,
    activityLogs,
    activeTab,
    setActiveTab,
    categoryFilters,
    statusFilters,
    mandatoryOnly,
    searchQuery,
    setSearchQuery,
    selectedDocIds,
    selectedDoc,
    isRejectModalOpen,
    docToReject,
    isCertificateModalOpen,
    isComplianceSigned,
    isLoading,
    handleToggleCategory,
    handleToggleStatus,
    handleToggleMandatory,
    handleSelectAll,
    handleToggleSelectRow,
    handleOpenPreview,
    handleClosePreview,
    handleUploadFile,
    handleApprove,
    handleOpenRejectModal,
    handleConfirmReject,
    handleSignDocument,
    handleDeleteDocument,
    handleBulkDelete,
    handleBulkApprove,
    handleSignCompliance,
    setIsRejectModalOpen,
    setIsCertificateModalOpen,
    toggleChecklistItem,
  }
}
