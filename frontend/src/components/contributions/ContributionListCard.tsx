import { ChevronRight, TriangleAlert, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ContributionListItem } from '../../types/contribution'
import Avatar from '../ui/Avatar'
import { formatPeriod, formatRelative } from '../ui/formatDateTime'
import CategoryTag from './CategoryTag'
import ContributionStatusBadge from './ContributionStatusBadge'
import EvidenceSummaryChips from './EvidenceSummaryChips'
import { collaboratorStatusMeta } from './contributionLabels'

type ContributionListCardProps = {
  item: ContributionListItem
  to: string
  showStudent?: boolean
  showWarnings?: boolean
}

export default function ContributionListCard({
  item,
  to,
  showStudent,
  showWarnings,
}: ContributionListCardProps) {
  return (
    <Link
      to={to}
      className='group flex items-center gap-4 rounded-xl border border-[#e3e8e5] bg-white px-4 py-4 transition hover:border-[#b9cfc3] hover:shadow-[0_4px_16px_rgba(20,33,27,0.06)] sm:px-5'
    >
      {showStudent ? <Avatar name={item.student.fullName} /> : null}
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-2'>
          <ContributionStatusBadge status={item.status} />
          <CategoryTag category={item.category} />
          {item.currentRevisionNumber > 1 ? (
            <span className='text-[12px] text-[#8a958f]'>Revision {item.currentRevisionNumber}</span>
          ) : null}
        </div>
        <p className='mt-2 truncate text-[15px] font-semibold text-[#14211b] group-hover:text-[#184b38]'>
          {item.title || 'Untitled draft'}
        </p>
        <div className='mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#5d6b64]'>
          {showStudent ? <span className='font-medium text-[#3d4a44]'>{item.student.fullName}</span> : null}
          <span>{formatPeriod(item.workStartDate, item.workEndDate)}</span>
          <EvidenceSummaryChips summary={item.evidence} />
          {item.collaboratorCount > 0 ? (
            <span className='inline-flex items-center gap-1'>
              <Users className='size-3.5' aria-hidden='true' />
              {item.collaboratorCount} collaborator{item.collaboratorCount === 1 ? '' : 's'}
            </span>
          ) : null}
        </div>
      </div>
      <div className='hidden shrink-0 flex-col items-end gap-1.5 text-right sm:flex'>
        {item.myCollaboratorStatus ? (
          <span
            className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${collaboratorStatusMeta[item.myCollaboratorStatus].tone}`}
          >
            You: {collaboratorStatusMeta[item.myCollaboratorStatus].label}
          </span>
        ) : null}
        {item.disputedCollaboratorCount > 0 ? (
          <span className='inline-flex items-center gap-1 text-[12px] font-semibold text-[#a1332b]'>
            <TriangleAlert className='size-3.5' aria-hidden='true' />
            Attribution disputed
          </span>
        ) : null}
        {showWarnings && item.warningCount > 0 ? (
          <span className='inline-flex items-center gap-1 text-[12px] font-semibold text-[#a3530f]'>
            <TriangleAlert className='size-3.5' aria-hidden='true' />
            {item.warningCount} check{item.warningCount === 1 ? '' : 's'} to look at
          </span>
        ) : null}
        <span className='text-[12px] text-[#8a958f]'>Updated {formatRelative(item.updatedAtUtc)}</span>
      </div>
      <ChevronRight
        className='size-5 shrink-0 text-[#b3bdb8] transition group-hover:translate-x-0.5 group-hover:text-[#184b38]'
        aria-hidden='true'
      />
    </Link>
  )
}
