import React, { useState, useEffect } from 'react'
import { Trash2, CheckCircle2, AlertCircle, Download } from 'lucide-react'
import type {
  VaultDocument,
  DocumentCategory,
} from '../../types/documentation'
import DocumentThumbnail from './DocumentThumbnail'
import { ErrorBoundary } from '../ErrorBoundary'

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
  const [visibleCount, setVisibleCount] = useState(10)

  useEffect(() => {
    setVisibleCount(10)
  }, [activeTab])

  const isAllSelected = documents.length > 0 && selectedDocIds.length === documents.length

  const formatDate = (isoString?: string): string => {
    if (!isoString) return 'Unknown'
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return 'Unknown'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleDownload = (e: React.MouseEvent, doc: VaultDocument) => {
    e.stopPropagation()
    if (doc?.fileUrl) {
      const a = document.createElement('a')
      a.href = doc.fileUrl
      a.download = doc.fileName || 'download'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Select All Toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-xs hover:bg-gray-50">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={onSelectAll}
              className="h-4 w-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            Select All
          </label>
        </div>
      </div>

      {/* Bulk Actions Menu */}
      {selectedDocIds.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-blue-50/50 p-3 border border-blue-100 shadow-xs animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium text-blue-900">
            {selectedDocIds.length} document{selectedDocIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onBulkApprove}
              className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#1E7E34] shadow-xs border border-green-200 hover:bg-green-50 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Approve Selected
            </button>
            <button
              onClick={onBulkDelete}
              className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-xs border border-red-200 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Google Drive Style Grid View */}
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-gray-300 bg-[#f8f9fa] py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <AlertCircle className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">No documents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or upload a new document.
          </p>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {documents.filter(Boolean).slice(0, visibleCount).map((doc) => {
            const isSelected = selectedDocIds.includes(doc?.id)
            const isPdf = doc?.fileType?.toLowerCase() === 'pdf'
            const isDocx = ['docx', 'doc'].includes(doc?.fileType?.toLowerCase() || '')
            const isExcel = ['xlsx', 'xls', 'csv'].includes(doc?.fileType?.toLowerCase() || '')

            return (
              <div
                key={doc?.id || Math.random().toString()}
                onClick={() => doc && onRowClick(doc)}
                className={`group relative flex flex-col rounded-[12px] bg-[#f0f4f9] hover:bg-[#e4e9f1] transition-colors cursor-pointer overflow-hidden ${isSelected ? 'ring-2 ring-blue-500 bg-[#e8f0fe]' : ''
                  }`}
              >
                {/* Top Header: Icon, Title */}
                <div className="flex items-center gap-2 p-3 pl-3 pr-2 z-10 bg-transparent relative">
                  {/* Icon or Checkbox */}
                  <div className="shrink-0 flex items-center justify-center w-5 h-5 relative" onClick={(e) => e.stopPropagation()}>
                    {/* Checkbox (Hover or Selected) */}
                    <div className={`absolute inset-0 flex items-center justify-center bg-[#f0f4f9] group-hover:bg-[#e4e9f1] ${isSelected ? 'opacity-100 bg-[#e8f0fe] group-hover:bg-[#e8f0fe] z-20' : 'opacity-0 group-hover:opacity-100 z-20'} transition-opacity`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectRow(doc.id)}
                        className="h-4 w-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm"
                      />
                    </div>
                    
                    {/* Icon (Hidden when hovered/selected) */}
                    <div className={`${isSelected ? 'opacity-0' : 'group-hover:opacity-0'} transition-opacity flex items-center justify-center w-full h-full`}>
                      {isPdf ? (
                        <div className="w-5 h-5 rounded bg-red-500 flex items-center justify-center text-[8px] font-bold text-white uppercase tracking-tighter shadow-xs">PDF</div>
                      ) : isDocx ? (
                        <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-[8px] font-bold text-white uppercase tracking-tighter shadow-xs">DOC</div>
                      ) : isExcel ? (
                        <div className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center text-[8px] font-bold text-white uppercase tracking-tighter shadow-xs">XLS</div>
                      ) : (
                        <div className="w-5 h-5 rounded bg-gray-500 flex items-center justify-center text-[8px] font-bold text-white uppercase tracking-tighter shadow-xs">FILE</div>
                      )}
                    </div>
                  </div>
                  {/* Title */}
                  <div className="flex-1 min-w-0 pr-6">
                    <h4 className="text-[13px] font-medium text-gray-800 truncate" title={doc?.fileName}>
                      {doc?.fileName || 'Unknown Document'}
                    </h4>
                  </div>
                </div>

                {/* Status Dot (Absolute Top Right) */}
                <div 
                  className={`absolute top-4 right-3 z-20 shrink-0 w-2.5 h-2.5 rounded-full shadow-sm transition-opacity ${isSelected ? 'opacity-0' : 'group-hover:opacity-0'}`}
                  style={{
                    backgroundColor: 
                      doc?.status?.toLowerCase().includes('approve') ? '#22c55e' : // bg-green-500
                      doc?.status?.toLowerCase().includes('reject') ? '#ef4444' : // bg-red-500
                      '#eab308' // bg-yellow-500
                  }}
                  title={doc?.status || 'Pending'}
                />

                {/* Action buttons (Download & Delete) - Absolute Top Right on Hover */}
                <div className="absolute top-2 right-2 z-30 shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#e4e9f1] rounded-md shadow-sm p-0.5">
                  <button
                    onClick={(e) => doc && handleDownload(e, doc)}
                    className="p-1 rounded hover:bg-white text-gray-600 transition-colors"
                    title="Download document"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); doc && onDeleteDoc(doc.id); }}
                    className="p-1 rounded hover:bg-white text-gray-600 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Preview Area (Middle) */}
                <div className="mx-3 mt-1 mb-2 h-[160px] bg-white rounded-lg border border-gray-200/60 overflow-hidden flex items-center justify-center relative shadow-sm pointer-events-none group-hover:shadow transition-shadow">
                  <ErrorBoundary fallback={
                    <div className="flex flex-col items-center justify-center bg-gray-50 w-full h-full p-4">
                      <div className="w-[70%] h-[90%] bg-white rounded shadow-sm border border-gray-200 flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-8 h-8 text-red-300" />
                        <span className="text-[10px] font-medium uppercase text-red-400">Preview Error</span>
                      </div>
                    </div>
                  }>
                    <DocumentThumbnail document={doc} className="w-full h-full" />
                  </ErrorBoundary>
                </div>

                {/* Footer (Avatar and Date) */}
                <div className="flex items-center gap-2 px-3 pb-3">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-medium flex items-center justify-center shrink-0">
                    {doc?.uploadedBy ? doc.uploadedBy.charAt(0).toUpperCase() : 'V'}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 justify-center">
                    <span className="text-[11px] text-gray-500 truncate">
                      Deschis de tine • {formatDate(doc?.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {documents.filter(Boolean).length > visibleCount && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 10)}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-all cursor-pointer"
            >
              afiseaza mai mult
            </button>
          </div>
        )}
        </>
      )}
    </div>
  )
}
