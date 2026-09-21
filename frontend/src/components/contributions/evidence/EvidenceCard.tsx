import { SquareArrowOutUpRight, Trash2 } from 'lucide-react'
import type { Evidence, GitHubLiveStatus } from '../../../types/contribution'
import { evidenceTypeMeta } from '../contributionLabels'
import FileEvidenceBody from './FileEvidenceBody'
import GitHubEvidenceBody from './GitHubEvidenceBody'
import SignalList from './SignalList'

type EvidenceCardProps = {
  evidence: Evidence
  live?: GitHubLiveStatus
  onRemove?: (evidence: Evidence) => void
  removing?: boolean
}

export default function EvidenceCard({ evidence, live, onRemove, removing }: EvidenceCardProps) {
  const { label, icon: Icon } = evidenceTypeMeta[evidence.type]
  return (
    <article className='rounded-xl border border-[#e3e8e5] bg-white p-4'>
      <div className='flex items-start gap-3'>
        <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#eef3f0] text-[#184b38]'>
          <Icon className='size-4' aria-hidden='true' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='mb-1 text-[11px] font-bold uppercase tracking-wider text-[#8a958f]'>{label}</p>
          {evidence.gitHub ? (
            <GitHubEvidenceBody evidence={evidence} live={live} />
          ) : evidence.type === 'image' || evidence.type === 'document' ? (
            <FileEvidenceBody evidence={evidence} />
          ) : (
            <a
              href={evidence.url}
              target='_blank'
              rel='noopener noreferrer'
              className='group inline-flex max-w-full items-start gap-1.5 text-[14px] font-semibold text-[#14211b] hover:text-[#184b38]'
            >
              <span className='break-words'>{evidence.name}</span>
              <SquareArrowOutUpRight className='mt-1 size-3.5 shrink-0 opacity-60' aria-hidden='true' />
            </a>
          )}
          {evidence.type === 'link' ? (
            <p className='mt-0.5 truncate text-[12px] text-[#8a958f]'>{evidence.url}</p>
          ) : null}
          {evidence.caption ? (
            <p className='mt-3 rounded-lg bg-[#f7f9f8] px-3 py-2 text-[13px] text-[#2b3833]'>
              {evidence.caption}
            </p>
          ) : null}
          <div className='mt-3'>
            <SignalList signals={evidence.signals} />
          </div>
        </div>
        {onRemove ? (
          <button
            type='button'
            onClick={() => onRemove(evidence)}
            disabled={removing}
            className='rounded-lg p-2 text-[#8a958f] hover:bg-[#fdf0ef] hover:text-[#a1332b] disabled:opacity-50'
            aria-label={`Remove ${evidence.name}`}
          >
            <Trash2 className='size-4' aria-hidden='true' />
          </button>
        ) : null}
      </div>
    </article>
  )
}
