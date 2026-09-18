import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'

const MIN_REASON = 5
const MAX_REASON = 1000

type RejectRequestDialogProps = {
  companyName: string
  requesterName: string
  onCancel: () => void
  /** Resolves on success; throws with a user-facing message on failure. */
  onConfirm: (reason: string) => Promise<void>
}

export default function RejectRequestDialog({
  companyName,
  requesterName,
  onCancel,
  onConfirm,
}: RejectRequestDialogProps) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const titleId = useId()

  const trimmed = reason.trim()
  const valid = trimmed.length >= MIN_REASON

  useEffect(() => {
    textareaRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!valid || submitting) {
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm(trimmed)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172c23]/40 p-4" onClick={onCancel}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-150 flex-col gap-5 rounded-2xl bg-white p-7 shadow-xl"
      >
        <div className="flex flex-col gap-3">
          <h2 id={titleId} className="text-2xl font-bold">
            Reject {companyName}?
          </h2>
          <p className="text-[13px] text-[#718078]">
            {requesterName} will be told the request was rejected and can submit a new one. The company cannot post
            opportunities until a request is approved.
          </p>
        </div>

        <div className="rounded-xl bg-[#fff0e3] p-4 text-[#a54a00]">
          <p className="text-[10px] font-bold tracking-wide uppercase">What the requester sees</p>
          <ul className="mt-2 list-inside list-disc text-[13px] font-semibold">
            <li>Your reason, exactly as written below</li>
            <li>A link to submit a corrected request</li>
          </ul>
          <p className="mt-2 text-xs">Their account stays active as a normal user.</p>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold">Reason for rejection *</span>
          <textarea
            ref={textareaRef}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={MAX_REASON}
            rows={3}
            required
            placeholder="Registration number does not match the company name in the state register."
            className="resize-none rounded-lg border border-[#e2e8e4] p-3 text-[13px] outline-none placeholder:text-[#718078] focus:ring-2 focus:ring-[#1b4332]/30"
          />
          <span className="text-[11px] text-[#718078]">
            Required · shown to the requester · at least {MIN_REASON} characters
          </span>
        </label>

        {error && (
          <p role="alert" className="rounded-lg bg-[#fde8e6] px-3 py-2 text-xs font-medium text-[#b42318]">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-10.5 w-46 rounded-[9px] bg-[#f8f9fa] text-[13px] font-bold text-[#718078]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!valid || submitting}
            className="h-10.5 w-48 rounded-[9px] bg-[#ff7a00] text-[13px] font-bold text-[#172c23] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Rejecting…' : 'Reject request'}
          </button>
        </div>
      </form>
    </div>
  )
}
