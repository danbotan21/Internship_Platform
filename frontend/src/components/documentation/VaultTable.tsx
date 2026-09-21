import { Download, Trash2, Eye, CheckCircle2, AlertCircle } from 'lucide-react'
import type {
  VaultDocument,
  DocumentCategory,
} from '../../types/documentation'

interface VaultTableProps {
  documents: VaultDocument[]
  activeTab: 'All Docs' | DocumentCategory
  onTabChange: (tab: 'All Docs' | DocumentCategory) => void
  selectedDocIds: string[]
  onToggleSelectRow: (id: string) => void
  onSelectAll: () => void
  onRowClick: (doc: VaultDocument) => void
  onDeleteDoc: (id: string) => void
  onBulkDelete: () => void
  onBulkApprove: () => void
}

const TABS: ('All Docs' | DocumentCategory)[] = [
  'All Docs',
  'Reports',
  'Certificates',
  'Evaluations',
  'Templates',
  'Other',
]

export default function VaultTable({
  documents,
  activeTab,
  onTabChange,
  selectedDocIds,
  onToggleSelectRow,
  onSelectAll,
  onRowClick,
  onDeleteDoc,
  onBulkDelete,
  onBulkApprove,
}: VaultTableProps) {
  const isAllSelected =
    documents.length > 0 && selectedDocIds.length === documents.length

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1048576) {
      return (bytes / 1048576).toFixed(1) + ' MB'
    }
    return Math.round(bytes / 1024) + ' KB'
  }

  const formatDate = (isoString: string): string => {
    const d = new Date(isoString)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getFileBadge = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <span className="flex h-6 w-8 items-center justify-center rounded bg-[#E5484D] text-[10px] font-bold text-white uppercase tracking-tight">PDF</span>
      case 'docx':
      case 'doc':
        return <span className="flex h-6 w-8 items-center justify-center rounded bg-[#2B579A] text-[10px] font-bold text-white uppercase tracking-tight">DOC</span>
      case 'xlsx':
      case 'xls':
        return <span className="flex h-6 w-8 items-center justify-center rounded bg-[#217346] text-[10px] font-bold text-white uppercase tracking-tight">XLS</span>
      default:
        return <span className="flex h-6 w-8 items-center justify-center rounded bg-gray-500 text-[10px] font-bold text-white uppercase tracking-tight">FILE</span>
    }
  }

  const renderSignatureDots = (completed: number, total = 3) => {
    const dots = []
    for (let i = 0; i < total; i++) {
      const isFilled = i < completed
      dots.push(
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${
            isFilled ? 'bg-[#153327]' : 'border border-gray-300 bg-transparent'
          }`}
        />
      )
    }
    return <div className="flex items-center gap-1">{dots}</div>
  }

  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'complete':
        return (
          <span className="inline-flex items-center rounded-full bg-[#EAF7EE] px-2.5 py-0.5 text-xs font-medium text-[#1E7E34]">
            Approved
          </span>
        )
      case 'pending':
      case 'submitted':
        return (
          <span className="inline-flex items-center rounded-full bg-[#FEF5E7] px-2.5 py-0.5 text-xs font-medium text-[#D97706]">
            Pending
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center rounded-full bg-[#FDF0EE] px-2.5 py-0.5 text-xs font-medium text-[#E5484D]">
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
            {status}
          </span>
        )
    }
  }

  return (
    <div>
      {/* Category Tabs matching screenshot */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#153327] text-white shadow-xs'
                  : 'border border-gray-200/80 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* Bulk Action Toolbar */}
      {selectedDocIds.length > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-orange-50 px-4 py-2 border border-orange-200 text-xs font-medium text-gray-800">
          <span>
            <strong className="text-[#FF7A00]">{selectedDocIds.length}</strong> document(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBulkApprove}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <CheckCircle2 className="h-3 w-3" />
              Bulk Approve
            </button>
            <button
              type="button"
              onClick={onBulkDelete}
              className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-white hover:bg-red-700 transition-colors shadow-xs"
            >
              <Trash2 className="h-3 w-3" />
              Bulk Delete
            </button>
          </div>
        </div>
      )}

      {/* Directory Table Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Vault Directory</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead>
              <tr className="border-b border-gray-100 bg-white text-xs font-medium text-gray-400">
                <th className="w-10 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onSelectAll}
                    aria-label="Select all documents"
                    className="h-4 w-4 rounded-sm border-gray-300 text-[#FF7A00] focus:ring-[#FF7A00] accent-[#FF7A00]"
                  />
                </th>
                <th className="px-3 py-3 font-medium text-gray-500">Filename</th>
                <th className="px-3 py-3 font-medium text-gray-500">Upload Date</th>
                <th className="px-3 py-3 font-medium text-gray-500">Size</th>
                <th className="px-3 py-3 font-medium text-gray-500">Signatures</th>
                <th className="px-3 py-3 font-medium text-gray-500">Version</th>
                <th className="px-3 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <AlertCircle className="mx-auto mb-2 h-6 w-6 text-gray-300" />
                    No documents found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const isSelected = selectedDocIds.includes(doc.id)
                  return (
                    <tr
                      key={doc.id}
                      onClick={() => onRowClick(doc)}
                      className={`group cursor-pointer transition-colors hover:bg-gray-50/80 ${
                        isSelected ? 'bg-orange-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="w-10 px-4 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelectRow(doc.id)}
                          aria-label={`Select ${doc.fileName}`}
                          className="h-4 w-4 rounded-sm border-gray-300 text-[#FF7A00] focus:ring-[#FF7A00] accent-[#FF7A00]"
                        />
                      </td>

                      {/* Filename & Category Badge */}
                      <td className="px-3 py-3 font-medium text-gray-900">
                        <div className="flex items-center gap-2.5">
                          {getFileBadge(doc.fileType)}
                          <span
                            className="max-w-[180px] sm:max-w-[240px] truncate text-sm font-medium text-gray-800 hover:text-[#FF7A00]"
                            title={doc.fileName}
                          >
                            {doc.fileName}
                          </span>
                          <span className="shrink-0 rounded-full bg-[#EBF1FF] px-2 py-0.5 text-xs font-medium text-[#3366CC]">
                            {doc.category === 'Agreements'
                              ? 'Agreement'
                              : doc.category === 'Reports'
                              ? 'Report'
                              : doc.category}
                          </span>
                        </div>
                      </td>

                      {/* Upload Date */}
                      <td className="px-3 py-3 text-gray-600">
                        {formatDate(doc.createdAt)}
                      </td>

                      {/* Size */}
                      <td className="px-3 py-3 text-gray-600">
                        {formatFileSize(doc.size)}
                      </td>

                      {/* Signatures multi-party indicator */}
                      <td className="px-3 py-3" title={`${doc.completedSignatures} of ${doc.totalSignatures} signatures completed`}>
                        {renderSignatureDots(doc.completedSignatures, doc.totalSignatures)}
                      </td>

                      {/* Version badge */}
                      <td className="px-3 py-3 font-medium text-gray-700">
                        v{doc.version}
                      </td>

                      {/* Status Pill Badge */}
                      <td className="px-3 py-3">
                        {renderStatusBadge(doc.status)}
                      </td>

                      {/* Action Icons matching screenshot */}
                      <td
                        className="px-4 py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5 text-gray-400">
                          {/* Quick Preview Eye */}
                          <button
                            type="button"
                            onClick={() => onRowClick(doc)}
                            title="Quick Preview"
                            className="rounded p-1.5 transition-colors hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Download Button */}
                          <a
                            href={doc.fileUrl}
                            download={doc.fileName}
                            title="Download document"
                            className="rounded p-1.5 transition-colors hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Download className="h-4 w-4" />
                          </a>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => onDeleteDoc(doc.id)}
                            title="Delete document"
                            className="rounded p-1.5 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
