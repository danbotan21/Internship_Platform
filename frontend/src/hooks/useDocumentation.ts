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

const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function useDocumentation(userRole = 'Student', userName?: string) {
  const currentActorName = userName || (userRole === 'Mentor' ? 'Mentor' : 'Student')
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
    Rejected: true,
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
      setDocuments(Array.isArray(docs) ? docs : [])
      const newStats = await documentationService.getStats()
      setStats(newStats || {})
    } finally {
      setIsLoading(false)
    }
  }, [userRole])

  useEffect(() => {
    // eslint-disable-next-line
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
        uploadedBy: currentActorName,
        isMandatory: category === 'Agreements',
      })

      setDocuments((prev) => [created, ...prev])
      setActivityLogs((prev) => [
        {
          id: generateId(),
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
    [refreshData, currentActorName]
  )

  const handleApprove = useCallback(
    async (id: string) => {
      // Find the document currently being acted upon to use as a fallback
      const currentDoc = documents.find((d) => d.id === id) || undefined;
      const updated = await documentationService.updateStatus(
        id,
        'Approved',
        undefined,
        currentActorName,
        currentDoc
      )
      if (updated) {
        setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)))
        setSelectedDoc((prev) => (prev?.id === id ? updated : prev))
        setActivityLogs((prev) => [
          {
            id: generateId(),
            title: 'Document Approved',
            fileName: updated.fileName,
            timeAgo: 'Just now',
            badgeColor: 'text-emerald-600',
          },
          ...prev,
        ])
        await refreshData()
      }
    },
    [currentActorName, documents, refreshData]
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
        currentActorName,
        docToReject
      )
      if (updated) {
        setDocuments((prev) => prev.map((d) => (d.id === docToReject.id ? updated : d)))
        setSelectedDoc((prev) => (prev?.id === docToReject.id ? updated : prev))
        setActivityLogs((prev) => [
          {
            id: generateId(),
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
    [docToReject, currentActorName]
  )

  const handleSignDocument = useCallback(
    async (id: string) => {
      const currentDoc = documents.find((d) => d.id === id) || undefined;
      const updated = await documentationService.signDocument(
        id,
        userRole === 'Mentor' ? 'Mentor' : 'Student',
        currentActorName,
        currentDoc
      )
      if (updated) {
        setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)))
        setSelectedDoc((prev) => (prev?.id === id ? updated : prev))
        setActivityLogs((prev) => [
          {
            id: generateId(),
            title: 'Signature Confirmed',
            fileName: updated.fileName,
            timeAgo: 'Just now',
            badgeColor: 'text-emerald-600',
          },
          ...prev,
        ])
      }
    },
    [userRole, currentActorName, documents]
  )

  const handleDeleteDocument = useCallback(
    async (id: string) => {
      await documentationService.deleteDocument(id)
      setDocuments((prev) => prev.filter((d) => d.id !== id))
      setSelectedDoc((prev) => (prev?.id === id ? null : prev))
      setSelectedDocIds((prev) => prev.filter((i) => i !== id))
    },
    []
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
        id: generateId(),
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
