import { useState } from 'react'
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  X,
} from 'lucide-react'
import type { VaultDocument } from '../../types/documentation'

interface LiveDocumentPreviewProps {
  document: VaultDocument
}

export default function LiveDocumentPreview({ document }: LiveDocumentPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState<'preview' | 'pipeline'>('preview')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState<100 | 125>(100)

  const isApproved = document.status.toLowerCase() === 'approved'
  const isRejected = document.status.toLowerCase() === 'rejected'
  const totalPages = 3

  const isPdfBlob =
    document.fileType.toLowerCase() === 'pdf' &&
    document.fileUrl.startsWith('blob:')

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1048576) {
      return (bytes / 1048576).toFixed(1) + ' MB'
    }
    return Math.round(bytes / 1024) + ' KB'
  }

  const getBadgeColor = () => {
    switch (document.fileType.toLowerCase()) {
      case 'pdf':
        return 'bg-red-500 text-white'
      case 'docx':
      case 'doc':
        return 'bg-blue-600 text-white'
      case 'xlsx':
      case 'xls':
        return 'bg-emerald-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const renderDocumentPageContent = (page: number) => {
    switch (page) {
      case 1:
        return (
          <div className="space-y-3 text-left">
            {/* Document Header Header */}
            <div className="border-b border-gray-200 pb-2 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold tracking-widest text-[#153327] uppercase">
                <Award className="h-3 w-3 text-[#FF7A00]" />
                <span>InternFlow Verification Vault</span>
              </div>
              <p className="text-[8px] text-gray-400 font-mono">
                REG-REF: IF-{document.id.slice(0, 8).toUpperCase()} · v{document.version}.0
              </p>
            </div>

            {/* Document Title in Document Style */}
            <div className="text-center pt-1">
              <h3 className="text-xs font-serif font-bold text-gray-900 leading-snug">
                {document.title}
              </h3>
              <p className="text-[9px] text-gray-500 font-medium">
                {document.category} · Tripartite Institutional Agreement
              </p>
            </div>

            {/* Official Watermark / Stamp */}
            <div className="relative my-2 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 p-2 text-[10px]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-semibold text-gray-800">Parties Involved:</span>
                  <p className="text-[9px] text-gray-600 mt-0.5">
                    1. Student: <strong className="text-gray-900">{document.uploadedBy}</strong>
                  </p>
                  <p className="text-[9px] text-gray-600">
                    2. Mentor: <strong>Dr. Michael Chen</strong> (Tech Lead)
                  </p>
                  <p className="text-[9px] text-gray-600">
                    3. Coordinator: <strong>Elena Vasilescu</strong> (Faculty)
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`inline-block rounded-md px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                      isApproved
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isRejected
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {document.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Article Preamble Clauses */}
            <div className="space-y-1.5 text-[9px] text-gray-600 leading-relaxed font-serif">
              <p>
                <strong className="font-sans font-semibold text-gray-900">Art. 1 (Scope):</strong>{' '}
                This institutional instrument governs the practicum milestones, safety regulations, and deliverables
                stipulated for the Internship Period.
              </p>
              <p>
                <strong className="font-sans font-semibold text-gray-900">Art. 2 (Compliance):</strong>{' '}
                The intern acknowledges adherence to intellectual property regulations, data integrity, and weekly mentor
                sign-off requirements.
              </p>
            </div>

            {/* Simulated Live Seal */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[8px] text-gray-400">
              <span>Security Stamp: SHA-256 Verified</span>
              <span className="font-mono text-emerald-600 font-semibold flex items-center gap-0.5">
                <ShieldCheck className="h-3 w-3" /> Encrypted Vault
              </span>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-3 text-left">
            <div className="border-b border-gray-200 pb-1.5">
              <span className="text-[9px] font-bold text-gray-700 uppercase tracking-wider">
                Section B: Milestone Deliverables & Assessment
              </span>
            </div>

            {/* Mini Milestone Rubric */}
            <div className="space-y-2 text-[9px]">
              <div className="rounded-md border border-gray-200 bg-white p-2">
                <div className="flex justify-between font-medium text-gray-800">
                  <span>Milestone 1: Environment & Architecture</span>
                  <span className="text-emerald-600 font-bold">100%</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
              </div>

              <div className="rounded-md border border-gray-200 bg-white p-2">
                <div className="flex justify-between font-medium text-gray-800">
                  <span>Milestone 2: Implementation & Tests</span>
                  <span className="text-[#FF7A00] font-bold">85%</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-[#FF7A00] rounded-full w-[85%]" />
                </div>
              </div>

              <div className="rounded-md border border-gray-200 bg-white p-2">
                <div className="flex justify-between font-medium text-gray-800">
                  <span>Milestone 3: Final Defense & Evaluation</span>
                  <span className="text-gray-400 font-bold">Pending</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-gray-200 rounded-full w-[35%]" />
                </div>
              </div>
            </div>

            <div className="rounded-md bg-amber-50/70 border border-amber-200/80 p-2 text-[9px] text-amber-900">
              <strong>Mentor Evaluation Note:</strong> Candidate exhibits strong system architecture and documentation precision.
            </div>
          </div>
        )

      case 3:
      default:
        return (
          <div className="space-y-3 text-left">
            <div className="border-b border-gray-200 pb-1.5 text-center">
              <span className="text-[9px] font-bold text-gray-800 uppercase tracking-wider">
                Section C: Multi-Party Digital Sign-Offs
              </span>
            </div>

            {/* 3 Signature Blocks */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Student Sign */}
              <div className="rounded border border-emerald-200 bg-emerald-50/30 p-2 text-center">
                <p className="text-[8px] font-bold text-gray-700">Intern</p>
                <div className="my-1.5 font-serif italic text-[10px] text-emerald-800 select-none">
                  Ana Popescu
                </div>
                <span className="inline-flex items-center gap-0.5 text-[7px] font-semibold text-emerald-700">
                  <CheckCircle2 className="h-2.5 w-2.5" /> SIGNED
                </span>
              </div>

              {/* Mentor Sign */}
              <div className="rounded border border-amber-200 bg-amber-50/30 p-2 text-center">
                <p className="text-[8px] font-bold text-gray-700">Mentor</p>
                {document.completedSignatures >= 2 ? (
                  <>
                    <div className="my-1.5 font-serif italic text-[10px] text-emerald-800 select-none">
                      Dr. M. Chen
                    </div>
                    <span className="inline-flex items-center gap-0.5 text-[7px] font-semibold text-emerald-700">
                      <CheckCircle2 className="h-2.5 w-2.5" /> SIGNED
                    </span>
                  </>
                ) : (
                  <>
                    <div className="my-1.5 text-[8px] text-gray-400 italic">Awaiting</div>
                    <span className="inline-flex items-center gap-0.5 text-[7px] font-semibold text-amber-700">
                      <Clock className="h-2.5 w-2.5" /> PENDING
                    </span>
                  </>
                )}
              </div>

              {/* Coordinator Sign */}
              <div className="rounded border border-gray-200 bg-gray-50/40 p-2 text-center">
                <p className="text-[8px] font-bold text-gray-700">Coordinator</p>
                {document.completedSignatures >= 3 ? (
                  <>
                    <div className="my-1.5 font-serif italic text-[10px] text-emerald-800 select-none">
                      E. Vasilescu
                    </div>
                    <span className="inline-flex items-center gap-0.5 text-[7px] font-semibold text-emerald-700">
                      <CheckCircle2 className="h-2.5 w-2.5" /> SIGNED
                    </span>
                  </>
                ) : (
                  <>
                    <div className="my-1.5 text-[8px] text-gray-400 italic">Awaiting</div>
                    <span className="inline-flex items-center gap-0.5 text-[7px] font-semibold text-gray-500">
                      <Clock className="h-2.5 w-2.5" /> PENDING
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="text-[8px] text-center text-gray-400 pt-2 border-t border-gray-100 font-mono">
              Audit Token: IF-AUTH-9941 · Verified by Practicum Committee
            </div>
          </div>
        )
    }
  }

  const renderWorkflowPipeline = () => {
    return (
      <div className="p-3 space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#FF7A00]" />
            <span className="text-xs font-bold text-gray-900">Live Verification Flow</span>
          </div>
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-[#FF7A00]">
            {document.completedSignatures} of {document.totalSignatures} Confirmed
          </span>
        </div>

        {/* Live Stepper Visualization */}
        <div className="relative pl-6 space-y-4">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200" />

          {/* Step 1: Upload */}
          <div className="relative">
            <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white ring-4 ring-white shadow-xs">
              <CheckCircle2 className="h-3 w-3" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">1. Student Submission</p>
              <p className="text-[10px] text-gray-500">
                Uploaded by {document.uploadedBy} · Integrity Verified
              </p>
            </div>
          </div>

          {/* Step 2: Mentor Approval */}
          <div className="relative">
            <div
              className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white shadow-xs ${
                document.completedSignatures >= 2
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 text-white animate-pulse'
              }`}
            >
              {document.completedSignatures >= 2 ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">2. Corporate Mentor Review</p>
              <p className="text-[10px] text-gray-500">
                {document.completedSignatures >= 2
                  ? 'Signed by Dr. Michael Chen (Mentor)'
                  : 'Pending review by Corporate Mentor'}
              </p>
            </div>
          </div>

          {/* Step 3: University Sign-off */}
          <div className="relative">
            <div
              className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white shadow-xs ${
                document.completedSignatures >= 3
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-300 text-white'
              }`}
            >
              {document.completedSignatures >= 3 ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">3. University Institutional Seal</p>
              <p className="text-[10px] text-gray-500">
                {document.completedSignatures >= 3
                  ? 'Official verification stamped'
                  : 'Awaiting coordinator final sign-off'}
              </p>
            </div>
          </div>
        </div>

        {/* Security / Cryptographic Badge */}
        <div className="rounded-lg bg-gray-50 p-2.5 text-[10px] text-gray-600 border border-gray-200/80 flex items-center justify-between">
          <span>Checksum Status</span>
          <span className="font-mono text-emerald-700 font-semibold">VALID · 256-BIT</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Live Preview Container Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-[#F9FAFB] shadow-xs">
        {/* Interactive Header Toolbar */}
        <div className="flex items-center justify-between border-b border-gray-200/80 bg-white px-3.5 py-2.5">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'preview'
                  ? 'bg-white text-gray-900 shadow-xs font-semibold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-[#FF7A00]" />
              <span>Live Page</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                activeTab === 'pipeline'
                  ? 'bg-white text-gray-900 shadow-xs font-semibold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-[#3366CC]" />
              <span>Flow</span>
            </button>
          </div>

          {/* Right Controls: Pagination & Fullscreen */}
          <div className="flex items-center gap-1.5">
            {activeTab === 'preview' && (
              <div className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 rounded-lg px-2 py-0.5 border border-gray-200">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  aria-label="Previous page"
                  className="rounded p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="font-mono text-[10px] font-semibold text-gray-700 select-none">
                  {currentPage}/{totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  aria-label="Next page"
                  className="rounded p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Expand / Maximize preview button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              title="Expand live visualization"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Live Canvas Area */}
        <div className="p-3.5">
          {activeTab === 'preview' ? (
            isPdfBlob ? (
              /* If user uploaded a real PDF, render native browser PDF iframe */
              <div className="relative h-64 w-full rounded-xl overflow-hidden border border-gray-200 bg-white shadow-xs">
                <iframe
                  src={`${document.fileUrl}#toolbar=0&navpanes=0`}
                  title={document.title}
                  className="h-full w-full border-none"
                />
              </div>
            ) : (
              /* Realistic Interactive Document Page Sheet */
              <div
                className={`relative mx-auto w-full max-w-sm rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm transition-transform duration-150 ${
                  zoomLevel === 125 ? 'scale-105' : 'scale-100'
                }`}
                style={{
                  minHeight: '230px',
                  boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
                }}
              >
                {/* Paper dog-ear corner effect */}
                <div className="absolute right-0 top-0 h-4 w-4 border-b border-l border-gray-200 bg-gray-50 rounded-bl-sm" />

                {/* Page Content */}
                {renderDocumentPageContent(currentPage)}
              </div>
            )
          ) : (
            /* Workflow Pipeline Tab */
            <div className="rounded-xl border border-gray-200/90 bg-white shadow-xs">
              {renderWorkflowPipeline()}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between border-t border-gray-200/70 bg-gray-50/80 px-4 py-2 text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-bold tracking-tight uppercase ${getBadgeColor()}`}
            >
              {document.fileType}
            </span>
            <span className="font-medium text-gray-700">{formatFileSize(document.size)}</span>
          </div>

          <span className="text-[10px] text-gray-400 font-mono">
            {activeTab === 'preview' ? `Live Sheet · P.${currentPage}` : 'Real-time Pipeline'}
          </span>
        </div>
      </div>

      {/* Enlarged Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 sm:p-6 animate-in fade-in-0 duration-200">
          <div className="relative flex flex-col h-full max-h-[85vh] w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50/70">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight ${getBadgeColor()}`}
                >
                  {document.fileType}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{document.title}</h3>
                  <p className="text-[11px] text-gray-500">{document.fileName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom toggle in modal */}
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => (z === 100 ? 125 : 100))}
                  className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-white transition-colors"
                  title="Toggle Zoom"
                >
                  {zoomLevel === 100 ? <ZoomIn className="h-4 w-4" /> : <ZoomOut className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#F4F6F8] flex items-center justify-center hardware-scroll">
              <div
                className={`w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-md transition-transform duration-150 ${
                  zoomLevel === 125 ? 'scale-110' : 'scale-100'
                }`}
              >
                {renderDocumentPageContent(currentPage)}
              </div>
            </div>

            {/* Modal Footer with pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-lg border border-gray-200 px-3 py-1 font-medium hover:bg-gray-50 disabled:opacity-40"
                >
                  Previous Page
                </button>
                <span className="font-mono font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-gray-200 px-3 py-1 font-medium hover:bg-gray-50 disabled:opacity-40"
                >
                  Next Page
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="rounded-xl bg-[#153327] px-4 py-1.5 font-semibold text-white hover:bg-[#1B4332] transition-colors"
              >
                Close Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
