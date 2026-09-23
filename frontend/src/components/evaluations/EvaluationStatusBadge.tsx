import type { EvaluationStatus } from '../../types/evaluation'
import { evaluationStatusMeta } from './evaluationLabels'

type EvaluationStatusBadgeProps = {
  status: EvaluationStatus
  // Students see "In progress" instead of the mentor's internal steps.
  studentView?: boolean
  upcoming?: boolean
}

export default function EvaluationStatusBadge({ status, studentView, upcoming }: EvaluationStatusBadgeProps) {
  const meta = evaluationStatusMeta[status]
  const label =
    upcoming && status !== 'finalized'
      ? 'Upcoming'
      : studentView && status !== 'finalized'
        ? 'In progress'
        : meta.label
  const tone = upcoming && status !== 'finalized' ? 'bg-[#eef1ef] text-[#5d6b64]' : meta.tone
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${tone}`}>
      <span className={`size-1.5 rounded-full ${upcoming && status !== 'finalized' ? 'bg-[#8a958f]' : meta.dot}`} aria-hidden='true' />
      {label}
    </span>
  )
}
