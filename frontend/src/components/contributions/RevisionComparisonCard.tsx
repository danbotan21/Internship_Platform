import { GitCompareArrows, Minus, Plus } from 'lucide-react'
import type { RevisionComparison } from '../../types/contribution'
import { card, sectionTitle } from '../ui/styles'

// What the student changed since the revision the mentor reviewed.
export default function RevisionComparisonCard({
  comparison,
  currentRevision,
}: {
  comparison: RevisionComparison
  currentRevision: number
}) {
  return (
    <section className={`${card} p-5`}>
      <div className='flex items-center gap-2'>
        <GitCompareArrows className='size-4 text-[#2b6a50]' aria-hidden='true' />
        <h2 className={sectionTitle}>
          Changes in v{currentRevision} since v{comparison.comparedWithRevision}
        </h2>
      </div>
      {!comparison.hasChanges ? (
        <p className='mt-3 text-[13px] text-[#a3530f]'>Nothing changed since the reviewed revision.</p>
      ) : (
        <div className='mt-4 space-y-3'>
          {comparison.fieldChanges.map((change) => (
            <div key={change.field} className='rounded-lg border border-[#eef1ef] p-3'>
              <p className='text-[12px] font-semibold uppercase tracking-wide text-[#8a958f]'>{change.field}</p>
              <div className='mt-2 grid gap-2 md:grid-cols-2'>
                <p className='rounded-md bg-[#fdf0ef] px-3 py-2 text-[13px] text-[#7a2a23] line-through decoration-[#c9483e]/40'>
                  {change.before || '—'}
                </p>
                <p className='rounded-md bg-[#eef8f2] px-3 py-2 text-[13px] text-[#17603f]'>
                  {change.after || '—'}
                </p>
              </div>
            </div>
          ))}
          {comparison.evidenceAdded.map((name) => (
            <p key={`+${name}`} className='flex items-center gap-2 text-[13px] text-[#17603f]'>
              <Plus className='size-4' aria-hidden='true' /> Evidence added: {name}
            </p>
          ))}
          {comparison.evidenceRemoved.map((name) => (
            <p key={`-${name}`} className='flex items-center gap-2 text-[13px] text-[#a1332b]'>
              <Minus className='size-4' aria-hidden='true' /> Evidence removed: {name}
            </p>
          ))}
        </div>
      )}
    </section>
  )
}
