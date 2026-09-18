import type { Contribution } from '../types/contribution'

export type ContributionDecisionKind = 'validate' | 'reject'

type ContributionDecisionDialogProps = {
  item: Contribution
  kind: ContributionDecisionKind
  validationNote: string
  rejectionReason: string
  rejectionExplanation: string
  rejectionReasons: readonly string[]
  busy: boolean
  onValidationNoteChange: (value: string) => void
  onRejectionReasonChange: (value: string) => void
  onRejectionExplanationChange: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
}

const field =
  'mt-2 w-full rounded-lg border border-[#d9e0dc] bg-white px-3 py-3 text-[13px] text-[#14211b] outline-none focus:border-[#2b6a50] focus:ring-2 focus:ring-[#2b6a50]/15'
const label =
  'block text-[10px] font-semibold uppercase tracking-wide text-[#6f7c76]'
const secondary =
  'rounded-lg border border-[#d9e0dc] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#184b38] hover:bg-[#f5f7f6] disabled:cursor-not-allowed disabled:opacity-60'
const primary =
  'rounded-lg bg-[#184b38] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#245c47] disabled:cursor-not-allowed disabled:opacity-60'
const danger =
  'rounded-lg border border-[#efc1bb] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#a1332b] hover:bg-[#fde8e7] disabled:cursor-not-allowed disabled:opacity-60'

export default function ContributionDecisionDialog({
  item,
  kind,
  validationNote,
  rejectionReason,
  rejectionExplanation,
  rejectionReasons,
  busy,
  onValidationNoteChange,
  onRejectionReasonChange,
  onRejectionExplanationChange,
  onCancel,
  onConfirm,
}: ContributionDecisionDialogProps) {
  const isValidation = kind === 'validate'

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-[#14211b]/40 p-4'
      role='presentation'
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel()
      }}
    >
      <section
        className='max-h-[90vh] w-full max-w-[680px] overflow-y-auto rounded-xl border border-[#d9e0dc] bg-white p-6 shadow-2xl'
        role='dialog'
        aria-modal='true'
        aria-labelledby='contribution-decision-title'
        aria-describedby='contribution-decision-description'
      >
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-[10px] font-bold uppercase tracking-wide text-[#2b6a50]'>
              Mentor decision
            </p>
            <h2
              id='contribution-decision-title'
              className='mt-2 text-[22px] font-bold tracking-[-0.025em]'
            >
              {isValidation
                ? 'Validate this contribution?'
                : 'Reject this contribution?'}
            </h2>
            <p
              id='contribution-decision-description'
              className='mt-1 text-[12px] text-[#6f7c76]'
            >
              {isValidation
                ? 'Confirm that the work, evidence and attribution are verified.'
                : 'Use rejection only when the submitted record cannot be verified as project work.'}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${
              isValidation
                ? 'bg-[#e8f2ed] text-[#184b38]'
                : 'bg-[#fde8e7] text-[#a1332b]'
            }`}
          >
            {isValidation ? 'VALIDATE' : 'REJECT'}
          </span>
        </div>

        <div className='mt-6 rounded-lg bg-[#e8f2ed] p-4'>
          <h3 className='text-[14px] font-bold'>{item.title}</h3>
          <p className='mt-1 text-[11px] text-[#6f7c76]'>
            {item.studentDisplayName || 'Demo student'} · {item.category} · v
            {item.revision}
          </p>
          <div className='mt-4 grid gap-2 text-[11px] text-[#184b38] sm:grid-cols-3'>
            <span>✓ Work context available</span>
            <span>✓ Evidence attached</span>
            <span>
              {isValidation
                ? '✓ Attribution reviewed'
                : 'Review outcome recorded'}
            </span>
          </div>
        </div>

        {isValidation ? (
          <label className={`${label} mt-6`}>
            Validation note · optional
            <textarea
              className={`${field} min-h-24 resize-y`}
              value={validationNote}
              onChange={(event) => onValidationNoteChange(event.target.value)}
              placeholder='Add a short note about why this contribution was verified.'
              disabled={busy}
            />
          </label>
        ) : (
          <div className='mt-6 space-y-4'>
            <label className={label}>
              Reason *
              <select
                className={field}
                value={rejectionReason}
                onChange={(event) =>
                  onRejectionReasonChange(event.target.value)
                }
                disabled={busy}
              >
                {rejectionReasons.map((reason) => (
                  <option key={reason}>{reason}</option>
                ))}
              </select>
            </label>
            <label className={label}>
              Mentor explanation *
              <textarea
                className={`${field} min-h-28 resize-y`}
                value={rejectionExplanation}
                onChange={(event) =>
                  onRejectionExplanationChange(event.target.value)
                }
                placeholder='Explain why the submitted evidence cannot verify the claimed work.'
                disabled={busy}
              />
            </label>
          </div>
        )}

        <div
          className={`mt-6 rounded-lg p-4 text-[11px] ${
            isValidation
              ? 'bg-[#e8f2ed] text-[#184b38]'
              : 'bg-[#fde8e7] text-[#a1332b]'
          }`}
        >
          <strong>Result</strong>
          <p className='mt-1'>
            {isValidation
              ? 'The contribution changes from SUBMITTED to VALIDATED and becomes trusted read-only evidence.'
              : 'The submitted revision changes to REJECTED and becomes read-only. The student can create a new contribution if needed.'}
          </p>
        </div>

        <div className='mt-6 flex flex-wrap justify-end gap-2'>
          <button
            type='button'
            className={secondary}
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type='button'
            className={isValidation ? primary : danger}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy
              ? 'Saving...'
              : isValidation
                ? 'Validate contribution'
                : 'Reject contribution'}
          </button>
        </div>
      </section>
    </div>
  )
}
