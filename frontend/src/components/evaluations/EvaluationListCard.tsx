import { CalendarClock, ChevronRight, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { EvaluationListItem } from '../../types/evaluation'
import Avatar from '../ui/Avatar'
import { formatPeriod } from '../ui/formatDateTime'
import EvaluationStatusBadge from './EvaluationStatusBadge'
import { formatScore, typeMeta } from './evaluationLabels'

type EvaluationListCardProps = {
  item: EvaluationListItem
  to: string
  studentView?: boolean
}

export default function EvaluationListCard({ item, to, studentView }: EvaluationListCardProps) {
  const progress = item.criteriaTotal ? (item.criteriaScored / item.criteriaTotal) * 100 : 0
  return (
    <Link
      to={to}
      className='group flex items-center gap-4 rounded-xl border border-[#e3e8e5] bg-white px-4 py-4 transition hover:border-[#b9cfc3] hover:shadow-[0_4px_16px_rgba(20,33,27,0.06)] sm:px-5'
    >
      {!studentView ? <Avatar name={item.student.fullName} /> : null}
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-2'>
          <EvaluationStatusBadge status={item.status} studentView={studentView} upcoming={item.isUpcoming} />
          {item.isOverdue ? (
            <span className='inline-flex items-center gap-1 text-[12px] font-semibold text-[#a1332b]'>
              <TriangleAlert className='size-3.5' aria-hidden='true' /> Period ended
            </span>
          ) : item.isDueSoon ? (
            <span className='inline-flex items-center gap-1 text-[12px] font-semibold text-[#a3530f]'>
              <CalendarClock className='size-3.5' aria-hidden='true' /> Due soon
            </span>
          ) : null}
        </div>
        <p className='mt-2 truncate text-[15px] font-semibold text-[#14211b] group-hover:text-[#184b38]'>
          {studentView ? typeMeta[item.type].label : `${item.student.fullName} · ${typeMeta[item.type].short}`}
        </p>
        <p className='mt-1 text-[12px] text-[#5d6b64]'>
          {formatPeriod(item.periodStart, item.periodEnd)} · Rubric v{item.rubricVersionNumber}
          {studentView && item.mentorName ? ` · ${item.mentorName}` : ''}
        </p>
      </div>
      <div className='hidden w-40 shrink-0 text-right sm:block'>
        {item.status === 'finalized' && item.finalScore !== null && item.finalScore !== undefined ? (
          <p className='text-[20px] font-bold tabular-nums text-[#14211b]'>
            {formatScore(item.finalScore)}
            <span className='text-[12px] font-normal text-[#8a958f]'> / 100</span>
          </p>
        ) : studentView ? (
          <p className='text-[12px] text-[#8a958f]'>Result hidden until finalized</p>
        ) : (
          <>
            <p className='text-[12px] text-[#5d6b64]'>
              {item.criteriaScored} / {item.criteriaTotal} criteria scored
            </p>
            <div className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#eef1ef]'>
              <div className='h-full rounded-full bg-[#2c8a5a]' style={{ width: `${progress}%` }} />
            </div>
          </>
        )}
      </div>
      <ChevronRight
        className='size-5 shrink-0 text-[#b3bdb8] transition group-hover:translate-x-0.5 group-hover:text-[#184b38]'
        aria-hidden='true'
      />
    </Link>
  )
}
