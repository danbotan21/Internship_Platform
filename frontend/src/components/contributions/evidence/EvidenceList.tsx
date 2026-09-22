import { Paperclip } from 'lucide-react'
import type { Evidence, GitHubLiveStatus } from '../../../types/contribution'
import EmptyState from '../../ui/EmptyState'
import EvidenceCard from './EvidenceCard'

type EvidenceListProps = {
  evidence: Evidence[]
  live?: GitHubLiveStatus[]
  onRemove?: (evidence: Evidence) => void
  removingId?: string | null
  emptyText?: string
}

export default function EvidenceList({ evidence, live, onRemove, removingId, emptyText }: EvidenceListProps) {
  if (!evidence.length) {
    return (
      <EmptyState
        icon={Paperclip}
        title='No evidence yet'
        description={emptyText ?? 'Evidence is what makes a contribution verifiable.'}
      />
    )
  }

  return (
    <div className='space-y-3'>
      {evidence.map((item) => (
        <EvidenceCard
          key={item.id}
          evidence={item}
          live={live?.find((status) => status.evidenceId === item.id)}
          onRemove={onRemove}
          removing={removingId === item.id}
        />
      ))}
    </div>
  )
}
