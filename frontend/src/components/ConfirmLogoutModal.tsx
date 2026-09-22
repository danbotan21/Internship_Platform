import { useEffect } from 'react'
import { LogOut, X, AlertTriangle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface ConfirmLogoutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function ConfirmLogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: ConfirmLogoutModalProps) {
  const { session } = useAuth()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Confirm Sign Out</h3>
              <p className="text-xs text-gray-500">Are you sure you want to end your session?</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            You are currently signed in as{' '}
            <span className="font-semibold text-gray-900">{session?.fullName ?? 'User'}</span>
            {session?.role ? (
              <>
                {' '}
                (<span className="text-gray-500">{session.role}</span>)
              </>
            ) : null}
            .
          </p>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            Any unsaved actions may be interrupted, and you will need to sign in again to access your workspace.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onClose()
              onConfirm()
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
