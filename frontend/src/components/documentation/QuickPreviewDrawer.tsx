import { X, CheckCircle2 } from 'lucide-react'
import { createPortal } from 'react-dom'
import type { VaultDocument } from '../../types/documentation'

interface QuickPreviewDrawerProps {
  document: VaultDocument | null
  onClose: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

export default function QuickPreviewDrawer({
  document,
  onClose,
  onApprove,
  onReject,
}: QuickPreviewDrawerProps) {
  if (!document) return null

  return createPortal(
    <div className="fixed inset-y-0 right-0 z-[100] w-full max-w-sm bg-white shadow-2xl border-l border-emerald-500 overflow-y-auto flex flex-col transition-transform transform translate-x-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="pr-2">
          <h2 className="text-sm font-bold text-gray-900 truncate max-w-[200px]" title={document.fileName}>
            {document.fileName}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Uploaded {document.createdAt ? new Date(document.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date'} by <span className="font-medium text-gray-700">{document.uploadedBy || 'Unknown'}</span>
          </p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded shrink-0">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 p-5 overflow-y-auto">
        {/* Fake Preview Box */}
        <div className="w-full h-48 bg-[#EAF2EC] rounded-xl flex items-center justify-center mb-6">
          <span className="text-xs text-gray-500">PDF preview</span>
        </div>

        {/* Metadata List */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">Category</span>
            <span className="text-gray-900">{document.category || 'Report'}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">Size</span>
            <span className="text-gray-900">1.4 MB</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">Version</span>
            <span className="text-gray-900">v3 · <span className="font-semibold cursor-pointer text-gray-900">Compare versions</span></span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">Status</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              document.status?.toLowerCase() === 'approved' 
                ? 'bg-[#EAF7EE] text-[#1E7E34]' 
                : document.status?.toLowerCase() === 'rejected'
                ? 'bg-[#FDF0EE] text-[#E5484D]'
                : 'bg-[#FEF5E7] text-[#D97706]'
            }`}>
              {document.status === 'Approved' ? 'Approved' : document.status === 'Rejected' ? 'Rejected' : 'Pending'}
            </span>
          </div>
          
          {/* Rejection Reason Block */}
          {document.status?.toLowerCase() === 'rejected' && document.rejectionReason && (
            <div className="flex flex-col pt-3 mt-3 border-t border-red-100 gap-1.5 animate-in fade-in slide-in-from-top-2">
              <span className="text-[11px] font-semibold text-red-700 uppercase tracking-wider">Reason for Rejection</span>
              <span className="text-xs text-red-600 italic bg-[#FDF0EE] p-2.5 rounded-md border border-red-200">
                "{document.rejectionReason}"
              </span>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="relative pl-4 space-y-6 mb-8 border-l border-gray-200 ml-2">
          {/* Step 1 */}
          <div className="relative">
            <div className="absolute -left-[22px] bg-white p-0.5">
              <div className="w-4 h-4 rounded-full bg-[#1B4332] flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>
            <h4 className="text-[11px] font-bold text-gray-900 leading-none">Approved by Mentor</h4>
            <p className="text-[10px] text-gray-500 mt-1">Oct 26, 2025 - 10:14 AM</p>
          </div>
          {/* Step 2 */}
          <div className="relative">
            <div className="absolute -left-[22px] bg-white p-0.5">
              <div className="w-4 h-4 rounded-full bg-[#1B4332] flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>
            <h4 className="text-[11px] font-bold text-gray-900 leading-none">Viewed by Coordinator</h4>
            <p className="text-[10px] text-gray-500 mt-1">Oct 25, 2025 - 4:02 PM</p>
          </div>
          {/* Step 3 */}
          <div className="relative">
            <div className="absolute -left-[22px] bg-white p-0.5">
              <div className="w-4 h-4 rounded-full bg-[#1B4332] flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>
            <h4 className="text-[11px] font-bold text-gray-900 leading-none">Submitted for review</h4>
            <p className="text-[10px] text-gray-500 mt-1">Oct 24, 2025 - 9:41 AM</p>
          </div>
          {/* Step 4 */}
          <div className="relative">
            <div className="absolute -left-[21px] bg-white p-0.5">
              <div className="w-3.5 h-3.5 rounded-full bg-gray-200"></div>
            </div>
            <h4 className="text-[11px] font-bold text-gray-500 leading-none">Archived</h4>
            <p className="text-[10px] text-gray-400 mt-1">—</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-auto pb-4">
          <button 
            onClick={() => {
              if (document?.fileUrl) {
                const a = window.document.createElement('a')
                a.href = document.fileUrl
                a.download = document.fileName || 'download'
                window.document.body.appendChild(a)
                a.click()
                window.document.body.removeChild(a)
              }
            }}
            className="flex-[1_1_30%] min-w-[80px] py-1.5 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-800 hover:bg-gray-50 flex justify-center items-center"
          >
            Download
          </button>
          <button 
            onClick={() => onReject(document.id)}
            className="flex-[1_1_30%] min-w-[80px] py-1.5 px-3 rounded-lg border border-red-300 text-xs font-semibold text-red-600 hover:bg-red-50 flex justify-center items-center"
          >
            Reject
          </button>
          <button 
            onClick={() => onApprove(document.id)}
            className="flex-[1_1_30%] min-w-[80px] py-1.5 px-3 rounded-lg bg-[#FF7A00] text-xs font-semibold text-white hover:bg-[#E86E00] flex justify-center items-center"
          >
            Approve
          </button>
        </div>
      </div>
    </div>,
    window.document.body
  )
}
