import { CalendarRange, UserRound } from 'lucide-react'
import type { ContributionDetails } from '../../types/contribution'
import { formatPeriod } from '../ui/formatDateTime'
import { card, sectionTitle } from '../ui/styles'

// What was delivered, by whom and when.
export default function ContributionOverview({ contribution }: { contribution: ContributionDetails }) {
  const revision = contribution.currentRevision
  return (
    <section className={`${card} p-5`}>
      <h2 className={sectionTitle}>What was delivered</h2>
      <p className='mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-[#2b3833]'>
        {revision.description || <span className='text-[#8a958f]'>No description yet.</span>}
      </p>

      <dl className='mt-5 grid gap-4 border-t border-[#eef1ef] pt-5 sm:grid-cols-2'>
        <div className='flex gap-3'>
          <UserRound className='mt-0.5 size-4 shrink-0 text-[#2b6a50]' aria-hidden='true' />
          <div>
            <dt className='text-[12px] font-semibold uppercase tracking-wide text-[#8a958f]'>
              {contribution.student.fullName}'s role
            </dt>
            <dd className='mt-1 text-[13px] text-[#2b3833]'>{revision.ownRole || '—'}</dd>
          </div>
        </div>
        <div className='flex gap-3'>
          <CalendarRange className='mt-0.5 size-4 shrink-0 text-[#2b6a50]' aria-hidden='true' />
          <div>
            <dt className='text-[12px] font-semibold uppercase tracking-wide text-[#8a958f]'>
              Work period
            </dt>
            <dd className='mt-1 text-[13px] text-[#2b3833]'>
              {formatPeriod(revision.workStartDate, revision.workEndDate)}
            </dd>
          </div>
        </div>
      </dl>
    </section>
  )
}
