import type { ContributionStatus } from '../../types/contribution'
import { statusMeta } from './contributionLabels'

export default function ContributionStatusBadge({ status }: { status: ContributionStatus }) {
  const meta = statusMeta[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${meta.tone}`}
    >
      <span className={`size-1.5 rounded-full ${meta.dot}`} aria-hidden='true' />
      {meta.label}
    </span>
  )
}
