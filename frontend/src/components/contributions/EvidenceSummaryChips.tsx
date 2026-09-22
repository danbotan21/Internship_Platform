import { FileText, GitCommitHorizontal, GitPullRequest, Image, Link2 } from 'lucide-react'
import type { EvidenceSummary } from '../../types/contribution'

export default function EvidenceSummaryChips({ summary }: { summary: EvidenceSummary }) {
  const items = [
    { count: summary.commits, label: 'commit', icon: GitCommitHorizontal },
    { count: summary.pullRequests, label: 'PR', icon: GitPullRequest },
    { count: summary.images, label: 'screenshot', icon: Image },
    { count: summary.documents, label: 'document', icon: FileText },
    { count: summary.links, label: 'link', icon: Link2 },
  ].filter((item) => item.count > 0)

  if (!items.length) {
    return <span className='text-[12px] text-[#a1332b]'>No evidence yet</span>
  }

  return (
    <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#5d6b64]'>
      {items.map(({ count, label, icon: Icon }) => (
        <span key={label} className='inline-flex items-center gap-1'>
          <Icon className='size-3.5' aria-hidden='true' />
          {count} {label}
          {count === 1 ? '' : 's'}
        </span>
      ))}
      {summary.additions + summary.deletions > 0 ? (
        <span className='font-mono text-[11px]'>
          <span className='text-[#17603f]'>+{summary.additions}</span>{' '}
          <span className='text-[#a1332b]'>−{summary.deletions}</span>
        </span>
      ) : null}
    </div>
  )
}
