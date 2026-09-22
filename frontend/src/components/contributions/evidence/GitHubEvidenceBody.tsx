import { ChevronDown, SquareArrowOutUpRight } from 'lucide-react'
import { useState } from 'react'
import type { Evidence, GitHubLiveStatus } from '../../../types/contribution'
import { formatDateTime } from '../../ui/formatDateTime'

const stateTone: Record<string, string> = {
  merged: 'bg-[#f1eafc] text-[#6b3fa0]',
  open: 'bg-[#e3f3ea] text-[#17603f]',
  closed: 'bg-[#fde8e7] text-[#a1332b]',
}

const checksLabel: Record<string, { label: string; tone: string }> = {
  success: { label: 'CI passed', tone: 'text-[#17603f]' },
  failure: { label: 'CI failed', tone: 'text-[#a1332b]' },
  pending: { label: 'CI running', tone: 'text-[#2f5aa8]' },
  none: { label: 'No CI configured', tone: 'text-[#8a958f]' },
}

type GitHubEvidenceBodyProps = {
  evidence: Evidence
  live?: GitHubLiveStatus
}

export default function GitHubEvidenceBody({ evidence, live }: GitHubEvidenceBodyProps) {
  const [showFiles, setShowFiles] = useState(false)
  const github = evidence.gitHub!
  const isPullRequest = evidence.type === 'githubPullRequest'
  const reference = isPullRequest ? `#${github.reference}` : github.reference.slice(0, 7)
  const liveChecks = live?.checksConclusion ? checksLabel[live.checksConclusion] : null
  const stateChanged = live?.state && github.state && live.state !== github.state

  return (
    <div>
      <a
        href={evidence.url}
        target='_blank'
        rel='noopener noreferrer'
        className='group inline-flex max-w-full items-start gap-1.5 text-[14px] font-semibold text-[#14211b] hover:text-[#184b38]'
      >
        <span className='break-words'>{evidence.name}</span>
        <SquareArrowOutUpRight className='mt-1 size-3.5 shrink-0 opacity-60 group-hover:opacity-100' aria-hidden='true' />
      </a>
      <div className='mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#5d6b64]'>
        <span className='font-mono'>
          {github.repository} · {reference}
        </span>
        {github.authorLogin ? <span>@{github.authorLogin}</span> : null}
        {github.authoredAtUtc ? <span>{formatDateTime(github.authoredAtUtc)}</span> : null}
        <span className='font-mono'>
          <span className='text-[#17603f]'>+{github.additions}</span>{' '}
          <span className='text-[#a1332b]'>−{github.deletions}</span>
        </span>
        <span>
          {github.changedFiles} file{github.changedFiles === 1 ? '' : 's'}
        </span>
        {github.state ? (
          <span className={`rounded-full px-2 py-0.5 font-semibold ${stateTone[github.state] ?? ''}`}>
            {github.state}
          </span>
        ) : null}
      </div>

      {live ? (
        <p className='mt-2 text-[12px] text-[#5d6b64]'>
          <span className='font-semibold text-[#3d4a44]'>Live on GitHub:</span>{' '}
          {live.error ? (
            <span className='text-[#a3530f]'>{live.error}</span>
          ) : (
            <>
              {liveChecks ? <span className={liveChecks.tone}>{liveChecks.label}</span> : null}
              {stateChanged ? (
                <span className='ml-2 font-semibold text-[#6b3fa0]'>now {live.state}</span>
              ) : null}
            </>
          )}
        </p>
      ) : null}

      {isPullRequest && github.commits.length ? (
        <ul className='mt-3 space-y-1 border-l-2 border-[#eef1ef] pl-3'>
          {github.commits.slice(0, 5).map((commit) => (
            <li key={commit.sha} className='truncate text-[12px] text-[#5d6b64]'>
              <span className='font-mono text-[#8a958f]'>{commit.sha.slice(0, 7)}</span> {commit.message}
              {commit.authorLogin ? <span className='text-[#8a958f]'> — @{commit.authorLogin}</span> : null}
            </li>
          ))}
          {github.commits.length > 5 ? (
            <li className='text-[12px] text-[#8a958f]'>+ {github.commits.length - 5} more commits</li>
          ) : null}
        </ul>
      ) : null}

      {github.files.length ? (
        <div className='mt-3'>
          <button
            type='button'
            onClick={() => setShowFiles((value) => !value)}
            className='inline-flex items-center gap-1 text-[12px] font-semibold text-[#184b38] hover:underline'
            aria-expanded={showFiles}
          >
            <ChevronDown className={`size-3.5 transition ${showFiles ? 'rotate-180' : ''}`} aria-hidden='true' />
            {showFiles ? 'Hide' : 'Show'} changed files
          </button>
          {showFiles ? (
            <ul className='mt-2 max-h-56 space-y-1 overflow-y-auto rounded-lg bg-[#f7f9f8] p-3 font-mono text-[11px]'>
              {github.files.map((file) => (
                <li key={file.filename} className='flex justify-between gap-3'>
                  <span className='truncate text-[#2b3833]'>{file.filename}</span>
                  <span className='shrink-0'>
                    <span className='text-[#17603f]'>+{file.additions}</span>{' '}
                    <span className='text-[#a1332b]'>−{file.deletions}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
