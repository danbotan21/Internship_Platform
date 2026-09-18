import type { ReactNode } from 'react'
import type { Contribution, Evidence, Status } from '../types/contribution'

const card = 'rounded-[10px] border border-[#d9e0dc] bg-white'
const secondary =
  'rounded-lg border border-[#d9e0dc] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#184b38] hover:bg-[#f5f7f6]'

export function Badge({ status }: { status: Status }) {
  const colors: Record<Status, string> = {
    Draft: 'bg-[#fff1d8] text-[#8a5200]',
    Submitted: 'bg-[#eaf0ff] text-[#3057a6]',
    'Changes requested': 'bg-[#fde8e7] text-[#a1332b]',
    Validated: 'bg-[#e8f2ed] text-[#184b38]',
    Rejected: 'bg-[#fde8e7] text-[#a1332b]',
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold ${colors[status]}`}
    >
      {status}
    </span>
  )
}

export function Heading({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow: string
  title: string
  description: string
  right?: ReactNode
}) {
  return (
    <div className='mb-5 flex flex-wrap items-start justify-between gap-4'>
      <div>
        <p className='mb-3 text-[10px] font-bold uppercase tracking-wide text-[#2b6a50]'>
          {eyebrow}
        </p>
        <h1 className='text-[27px] font-bold leading-tight tracking-[-0.035em] md:text-[30px]'>
          {title}
        </h1>
        <p className='mt-1 text-[12px] text-[#6f7c76]'>{description}</p>
      </div>
      {right}
    </div>
  )
}

export function Stat({
  title,
  count,
  caption,
}: {
  title: string
  count: number
  caption: string
}) {
  return (
    <div className={`${card} px-4 py-3`}>
      <p className='text-[11px] text-[#6f7c76]'>{title}</p>
      <div className='mt-1 flex items-end gap-4'>
        <strong className='text-[22px]'>{count}</strong>
        <span className='pb-1 text-[11px] text-[#6f7c76]'>{caption}</span>
      </div>
    </div>
  )
}

export function EvidenceList({
  items,
  onRemove,
}: {
  items: Evidence[]
  onRemove?: (id: string) => void
}) {
  if (!items.length)
    return (
      <p className='rounded-lg border border-dashed border-[#d9e0dc] p-5 text-[12px] text-[#6f7c76]'>
        No evidence yet. Add a link or a small file before submitting.
      </p>
    )

  return (
    <div className='space-y-3'>
      {items.map((item) => (
        <div
          key={item.id}
          className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d9e0dc] p-4'
        >
          <div>
            <p className='text-[12px] font-semibold'>{item.name}</p>
            <p className='mt-1 text-[11px] text-[#6f7c76]'>
              {item.kind === 'link' ? 'External link' : 'Uploaded file'}
            </p>
          </div>
          <div className='flex gap-2'>
            <a
              className={`${secondary} inline-block`}
              href={item.url}
              target='_blank'
              rel='noopener noreferrer'
            >
              Open ↗
            </a>
            {onRemove ? (
              <button
                type='button'
                className={secondary}
                onClick={() => onRemove(item.id)}
                aria-label={`Remove ${item.name}`}
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

export function ContributionDetails({ item }: { item: Contribution }) {
  return (
    <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]'>
      <section className={`${card} p-5`}>
        <h2 className='text-[17px] font-bold'>What was delivered</h2>
        <p className='mt-3 whitespace-pre-wrap text-[12px] text-[#6f7c76]'>
          {item.description}
        </p>
        <div className='mt-6 border-t border-[#d9e0dc] pt-5'>
          <h3 className='mb-3 text-[13px] font-bold'>Evidence</h3>
          <EvidenceList items={item.evidence} />
          {item.evidenceNote ? (
            <p className='mt-3 text-[11px] text-[#6f7c76]'>
              {item.evidenceNote}
            </p>
          ) : null}
        </div>
      </section>
      <aside className={`${card} h-fit p-5 text-[12px]`}>
        <h2 className='text-[16px] font-bold'>Contribution context</h2>
        <p className='mt-5'>
          <span className='text-[#6f7c76]'>Work period</span>
          <br />
          {item.workPeriod}
        </p>
        <p className='mt-4'>
          <span className='text-[#6f7c76]'>Student role</span>
          <br />
          {item.ownRole}
        </p>
        <p className='mt-4'>
          <span className='text-[#6f7c76]'>Linked task</span>
          <br />
          {item.linkedTask || 'None'}
        </p>
        <p className='mt-4'>
          <span className='text-[#6f7c76]'>Revision</span>
          <br />v{item.revision}
        </p>
      </aside>
    </div>
  )
}
