import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Download, CheckCircle2, XCircle, FileText, Clock, PenTool, ShieldCheck } from 'lucide-react'
import type { VaultDocument, UserRoleCapabilities } from '../../types/documentation'

interface QuickPreviewDrawerProps {
  document: VaultDocument | null
  onClose: () => void
  onApprove: (id: string) => void
  onOpenRejectModal: (doc: VaultDocument) => void
  onSign: (id: string) => void
  capabilities: UserRoleCapabilities
}

const formatFileSize = (bytes: number): string => {
  if (bytes >= 1048576) {
    return (bytes / 1048576).toFixed(1) + ' MB'
  }
  return Math.round(bytes / 1024) + ' KB'
}

const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function QuickPreviewDrawer({
  document,
  onClose,
  onApprove,
  onOpenRejectModal,
  onSign,
  capabilities,
}: QuickPreviewDrawerProps) {
  // Lock background scroll when drawer is open
  useEffect(() => {
    if (!document) return

    const originalBodyOverflow = window.getComputedStyle(window.document.body).overflow
    window.document.body.style.overflow = 'hidden'

    const mainEl = window.document.querySelector('main')
    const originalMainOverflow = mainEl ? window.getComputedStyle(mainEl).overflow : ''
    if (mainEl) {
      mainEl.style.overflow = 'hidden'
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.document.body.style.overflow = originalBodyOverflow === 'hidden' ? '' : originalBodyOverflow
      if (mainEl) {
        mainEl.style.overflow = originalMainOverflow === 'hidden' ? '' : originalMainOverflow
      }
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [document, onClose])

  if (!document) return null

  const isApproved = document.status.toLowerCase() === 'approved'
  const isRejected = document.status.toLowerCase() === 'rejected'
  const needsSignature = document.completedSignatures < document.totalSignatures

  const drawerContent = (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Crisp dark backdrop without Gaussian blur to eliminate GPU rasterization bottlenecks */}
      <div
        className="fixed inset-0 bg-black/45 transition-opacity duration-200 animate-in fade-in-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <section className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10 pointer-events-none">
        {/* Hardware-accelerated drawer sliding panel */}
        <div
          className="w-screen max-w-md h-full bg-white shadow-2xl flex flex-col pointer-events-auto animate-in slide-in-from-right duration-200 ease-out"
          style={{
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0 bg-white">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#EBF1FF] px-2.5 py-0.5 text-xs font-semibold text-[#3366CC]">
                {document.category}
              </span>
              <span className="text-xs font-bold text-gray-500">v{document.version}</span>
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                Properties
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close properties window"
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body - hardware-accelerated scroll container */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 hardware-scroll overscroll-contain">
            {/* Title & Status */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-snug">
                {document.title}
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 font-mono break-all">
                {document.fileName}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isApproved
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isRejected
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {document.status}
                </span>

                {document.isMandatory && (
                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-[#FF7A00] border border-orange-200">
                    Mandatory Form
                  </span>
                )}
              </div>

              {/* Rejection alert banner if rejected */}
              {document.rejectionReason && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50/60 p-3 text-xs text-red-800">
                  <p className="font-semibold text-red-900">Rejection Reason:</p>
                  <p className="mt-0.5">{document.rejectionReason}</p>
                </div>
              )}

              {/* Read-only timestamp badge if approved */}
              {document.approvedAt && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 text-xs text-emerald-800">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-semibold">Officially Verified & Approved</p>
                    <p className="text-[11px] text-emerald-700">
                      Approved by {document.approvedBy || 'Mentor'} on {formatDate(document.approvedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Document Preview Canvas Mock */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#F9FAFB] p-4 text-center">
              <div className="mx-auto flex h-40 w-32 flex-col items-center justify-center rounded-lg bg-white p-3 shadow-xs border border-gray-200/80">
                <FileText className="h-12 w-12 text-[#FF7A00]/80 mb-2" />
                <div className="h-2 w-16 bg-gray-200 rounded-sm mb-1" />
                <div className="h-2 w-20 bg-gray-100 rounded-sm mb-1" />
                <div className="h-2 w-12 bg-gray-100 rounded-sm" />
                <span className="mt-3 text-[10px] font-mono text-gray-400">Page 1 of 3</span>
              </div>
              <p className="mt-3 text-xs text-gray-500 font-medium">
                {document.fileType.toUpperCase()} Document ({formatFileSize(document.size)})
              </p>
            </div>

            {/* Signatures Progress (US 446) */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-gray-900">
                  Multi-Party Signatures Status
                </h4>
                <span className="text-xs font-bold text-[#FF7A00]">
                  {document.completedSignatures} of {document.totalSignatures} Signed
                </span>
              </div>
              <div className="space-y-2.5">
                {/* Party 1: Student */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">1. Student Intern ({document.uploadedBy})</span>
                  <span className="flex items-center gap-1 font-medium text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Signed
                  </span>
                </div>

                {/* Party 2: Mentor */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">2. Corporate Mentor</span>
                  {document.completedSignatures >= 2 ? (
                    <span className="flex items-center gap-1 font-medium text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Signed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-medium text-amber-600">
                      <Clock className="h-3.5 w-3.5" /> Pending
                    </span>
                  )}
                </div>

                {/* Party 3: University */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">3. University Coordinator</span>
                  {document.completedSignatures >= 3 ? (
                    <span className="flex items-center gap-1 font-medium text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Signed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-medium text-gray-400">
                      <Clock className="h-3.5 w-3.5" /> Pending
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-gray-50 p-2.5 border border-gray-100">
                <span className="text-gray-400">Uploaded Date</span>
                <p className="mt-0.5 font-medium text-gray-800">
                  {formatDate(document.createdAt)}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2.5 border border-gray-100">
                <span className="text-gray-400">Uploaded By</span>
                <p className="mt-0.5 font-medium text-gray-800">{document.uploadedBy}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2.5 border border-gray-100">
                <span className="text-gray-400">Visibility Scope</span>
                <p className="mt-0.5 font-medium text-gray-800">{document.visibilityRole}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2.5 border border-gray-100">
                <span className="text-gray-400">Document Size</span>
                <p className="mt-0.5 font-medium text-gray-800">
                  {formatFileSize(document.size)}
                </p>
              </div>
            </div>

            {/* Audit Log Timeline */}
            <div>
              <h4 className="mb-3 text-xs font-semibold text-gray-900">Audit Trail & Timeline</h4>
              <div className="space-y-3 border-l-2 border-gray-100 pl-3.5">
                {document.audits && document.audits.length > 0 ? (
                  document.audits.map((audit) => (
                    <div key={audit.id} className="relative text-xs">
                      <div className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-[#1B4332] ring-2 ring-white" />
                      <p className="font-semibold text-gray-800">{audit.action}</p>
                      <p className="text-gray-600">{audit.details}</p>
                      <p className="mt-0.5 text-[10px] text-gray-400">
                        {audit.performedBy} · {formatDate(audit.timestamp)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No previous audit records.</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="border-t border-gray-100 bg-gray-50/90 px-6 py-4 flex flex-col gap-2 shrink-0">
            {/* Primary Digital Sign Button if needed */}
            {needsSignature && (
              <button
                type="button"
                onClick={() => onSign(document.id)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#153327] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1B4332] transition-colors active:scale-[0.99]"
              >
                <PenTool className="h-4 w-4 text-[#FF7A00]" />
                Add Digital Signature
              </button>
            )}

            <div className="flex items-center gap-2">
              {/* Download */}
              <a
                href={document.fileUrl}
                download={document.fileName}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs active:scale-[0.99]"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </a>

              {/* Reject */}
              {capabilities.canReject && !isApproved && (
                <button
                  type="button"
                  onClick={() => onOpenRejectModal(document)}
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50/80 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors active:scale-[0.99]"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </button>
              )}

              {/* Approve */}
              {capabilities.canApprove && !isApproved && (
                <button
                  type="button"
                  onClick={() => onApprove(document.id)}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#FF7A00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#E86E00] transition-colors shadow-xs active:scale-[0.99]"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Approve
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )

  return createPortal(drawerContent, window.document.body)
}


