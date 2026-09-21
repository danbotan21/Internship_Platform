import type { ContributionDetails, HistoryEvent } from '../../types/contribution'
import { formatDateTime } from '../ui/formatDateTime'
import { card, sectionTitle } from '../ui/styles'

const eventMeta: Record<HistoryEvent['type'], { label: string; dot: string }> = {
  submitted: { label: 'Submitted', dot: 'bg-[#4b76c9]' },
  resubmitted: { label: 'Resubmitted', dot: 'bg-[#4b76c9]' },
  changesRequested: { label: 'Changes requested', dot: 'bg-[#e07a26]' },
  validated: { label: 'Validated', dot: 'bg-[#2c8a5a]' },
  rejected: { label: 'Rejected', dot: 'bg-[#c9483e]' },
}

export default function ContributionTimeline({ contribution }: { contribution: ContributionDetails }) {
  return (
    <section className={`${card} p-5`}>
      <h2 className={sectionTitle}>Timeline</h2>
      <ol className='mt-4 space-y-4'>
        <li className='relative pl-6'>
          <span className='absolute left-0 top-1.5 size-2.5 rounded-full bg-[#b3bdb8]' aria-hidden='true' />
          <p className='text-[13px] font-semibold text-[#14211b]'>Draft created</p>
          <p className='text-[12px] text-[#8a958f]'>{formatDateTime(contribution.createdAtUtc)}</p>
        </li>
        {contribution.history.map((event) => (
          <li key={event.id} className='relative pl-6'>
            <span
              className={`absolute left-0 top-1.5 size-2.5 rounded-full ${eventMeta[event.type].dot}`}
              aria-hidden='true'
            />
            <p className='text-[13px] font-semibold text-[#14211b]'>
              {eventMeta[event.type].label}
              <span className='ml-1.5 font-normal text-[#8a958f]'>v{event.revisionNumber}</span>
            </p>
            <p className='text-[12px] text-[#8a958f]'>
              {formatDateTime(event.occurredAtUtc)}
              {event.actorName ? ` · ${event.actorName}` : ''}
            </p>
            {event.note ? (
              <p className='mt-1 line-clamp-3 text-[12px] text-[#5d6b64]'>{event.note}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}
