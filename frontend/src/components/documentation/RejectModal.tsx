import { useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import type { VaultDocument } from '../../types/documentation'

interface RejectModalProps {
  document: VaultDocument | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
}

export default function RejectModal({
  document,
  isOpen,
  onClose,
  onConfirm,
}: RejectModalProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !document) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Please provide a specific reason for rejecting this document.')
      return
    }
    setError('')
    setIsSubmitting(true)
    try {
      await onConfirm(reason.trim())
      setReason('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold text-gray-900">Reject Document</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            You are rejecting <span className="font-semibold text-gray-900">{document.fileName}</span>.
            In compliance with institutional audit requirements, please specify what corrections or revisions are needed.
          </p>

          <div className="mt-3">
            <label htmlFor="reject-reason" className="block text-xs font-medium text-gray-700">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reject-reason"
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (error) setError('')
              }}
              placeholder="e.g. Missing corporate mentor sign-off on section 4.2; please re-sign and upload."
              className="mt-1.5 w-full rounded-xl border border-gray-200 p-3 text-xs text-gray-800 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
          </div>

          <div className="mt-5 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
