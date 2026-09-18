import type { Contribution } from '../types/contribution'

const card = 'rounded-[10px] border border-[#d9e0dc] bg-white'

export function RevisionHistory({ item }: { item: Contribution }) {
  const events = item.history?.length
    ? item.history
    : item.submittedAt
      ? [
          {
            id: 'previous-submission',
            kind: 'submitted' as const,
            at: item.submittedAt,
            revision: item.revision,
          },
        ]
      : []

  return (
    <section className={`${card} h-fit p-5`}>
      <h2 className='text-[16px] font-bold'>Revision history</h2>
      <p className='mt-1 text-[11px] text-[#6f7c76]'>
        Previous submissions stay in the timeline.
      </p>
      <ol className='mt-5 space-y-4 border-l border-[#d9e0dc] pl-4'>
        {events.map((event) => (
          <li
            key={event.id}
            className={`relative text-[11px] before:absolute before:-left-[21px] before:top-1 before:size-2.5 before:rounded-full ${
              event.kind === 'rejected'
                ? 'before:bg-[#a1332b]'
                : event.kind === 'validated'
                  ? 'before:bg-[#184b38]'
                  : 'before:bg-[#2b6a50]'
            }`}
          >
            <strong
              className={
                event.kind === 'changes-requested' || event.kind === 'rejected'
                  ? 'text-[#a1332b]'
                  : event.kind === 'validated'
                    ? 'text-[#184b38]'
                    : 'text-[#14211b]'
              }
            >
              {event.kind === 'changes-requested'
                ? 'Changes requested'
                : event.kind === 'validated'
                  ? 'Validated'
                  : event.kind === 'rejected'
                    ? 'Rejected'
                    : `v${event.revision} ${event.kind === 'resubmitted' ? 'resubmitted' : 'submitted'}`}
            </strong>
            <p className='mt-1 text-[#6f7c76]'>
              {new Date(event.at).toLocaleString('en-GB', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
            {event.note ? (
              <p className='mt-1 text-[#6f7c76]'>{event.note}</p>
            ) : null}
          </li>
        ))}
      </ol>
      {item.status === 'Changes requested' ? (
        <p className='mt-5 rounded-lg bg-[#e8f2ed] p-3 text-[11px] text-[#184b38]'>
          Next: update the work or evidence, add a revision note, then resubmit
          for review.
        </p>
      ) : null}
    </section>
  )
}
