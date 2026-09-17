import { Award, Download, X, CheckCircle } from 'lucide-react'

interface CertificateModalProps {
  isOpen: boolean
  onClose: () => void
  recipientName?: string
}

export default function CertificateModal({
  isOpen,
  onClose,
  recipientName = 'Ana Popescu',
}: CertificateModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Certificate Decorative Border */}
        <div className="rounded-xl border-4 border-double border-[#153327]/30 bg-[#FFFDF9] p-6 sm:p-8 text-center shadow-inner">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#153327] text-[#FFB800] shadow-md">
            <Award className="h-8 w-8" />
          </div>

          <p className="text-[11px] font-bold tracking-widest text-[#153327] uppercase">
            Internflow Institutional Verification
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-serif font-bold text-gray-900">
            Certificate of Completion
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            This officially certifies that
          </p>

          <p className="mt-3 text-xl sm:text-2xl font-serif font-bold text-[#FF7A00]">
            {recipientName}
          </p>

          <p className="mx-auto mt-2 max-w-lg text-xs text-gray-600 leading-relaxed">
            has fulfilled all institutional practicum requirements, completed all weekly milestones, and achieved verified sign-offs for the{' '}
            <strong className="text-gray-900">Full-Stack Software Engineering Internship Program</strong>.
          </p>

          <div className="mt-8 flex items-center justify-around border-t border-gray-200/80 pt-6 text-xs text-gray-500">
            <div className="text-center">
              <div className="h-7 border-b border-gray-400 font-serif italic text-gray-800">
                Dr. Michael Chen
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">
                Corporate Mentor
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="mt-1 text-[9px] font-bold uppercase text-emerald-700">
                Digitally Stamped
              </span>
            </div>

            <div className="text-center">
              <div className="h-7 border-b border-gray-400 font-serif italic text-gray-800">
                Elena Vasilescu
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">
                University Coordinator
              </p>
            </div>
          </div>

          <p className="mt-5 text-[10px] font-mono text-gray-400">
            Credential ID: IF-2025-0894 · Stamped on {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              alert('Downloading Certificate PDF (IF-2025-0894.pdf)...')
              onClose()
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF7A00] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#E86E00] transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download Certificate (PDF)
          </button>
        </div>
      </div>
    </div>
  )
}
