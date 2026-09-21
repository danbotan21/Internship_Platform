import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'

const MIN_REASON = 5
const MAX_REASON = 1000

type Tone = 'warning' | 'success'

const toneStyles: Record<Tone, string> = {
  warning: 'bg-[#fff0e3] text-[#a54a00]',
  success: 'bg-[#eaf3ed] text-[#1b4332]',
}

type ReasonDialogProps = {
  title: string
  description: ReactNode
  /** Extra controls rendered above the info box, e.g. a role picker. */
  children?: ReactNode
  info: { tone: Tone; heading: string; items: string[]; footnote?: string }
  reasonLabel: string
  reasonPlaceholder?: string
  note: { tone: Tone; heading: string; text: string }
  confirmLabel: string
  busyLabel: string
  confirmDisabled?: boolean
  onCancel: () => void
  /** Resolves on success; throws with a user-facing message on failure. */
  onConfirm: (reason: string) => Promise<void>
}

/**
 * Confirmation dialog for admin actions that require a written reason
 * (reject a request, deactivate an account, change a role).
 */
export default function ReasonDialog({
  title,
  description,
  children,
  info,
  reasonLabel,
  reasonPlaceholder,
  note,
  confirmLabel,
  busyLabel,
  confirmDisabled = false,
  onCancel,
  onConfirm,
}: ReasonDialogProps) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const titleId = useId()

  const trimmed = reason.trim()
  const canSubmit = trimmed.length >= MIN_REASON && !confirmDisabled && !submitting

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
    if (!canSubmit) {
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
        className="flex max-h-full w-full max-w-150 flex-col gap-5 overflow-y-auto rounded-2xl bg-white p-7 shadow-xl"
      >
        <div className="flex flex-col gap-3">
          <h2 id={titleId} className="text-2xl font-bold">
            {title}
          </h2>
          <div className="text-[13px] text-[#718078]">{description}</div>
        </div>

        {children}

        <div className={`rounded-xl p-4 ${toneStyles[info.tone]}`}>
          <p className="text-[10px] font-bold tracking-wide uppercase">{info.heading}</p>
          <ul className="mt-2 list-inside list-disc text-[13px] font-semibold">
            {info.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {info.footnote && <p className="mt-2 text-xs">{info.footnote}</p>}
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold">{reasonLabel} *</span>
          <textarea
            ref={textareaRef}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={MAX_REASON}
            rows={3}
            required
            placeholder={reasonPlaceholder}
            className="resize-none rounded-lg border border-[#e2e8e4] p-3 text-[13px] outline-none placeholder:text-[#718078] focus:ring-2 focus:ring-[#1b4332]/30"
          />
        </label>

        <div className={`rounded-xl px-4 py-3 ${toneStyles[note.tone]}`}>
          <p className="text-xs font-bold">{note.heading}</p>
          <p className="text-xs">{note.text}</p>
        </div>

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
            disabled={!canSubmit}
            className="h-10.5 min-w-48 rounded-[9px] bg-[#ff7a00] px-5 text-[13px] font-bold text-[#172c23] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? busyLabel : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
