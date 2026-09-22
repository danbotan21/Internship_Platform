import { FileText, LoaderCircle, SquareArrowOutUpRight } from 'lucide-react'
import { useState } from 'react'
import type { Evidence } from '../../../types/contribution'
import ContributionModal from '../ContributionModal'
import { useEvidenceFileUrl } from './useEvidenceFileUrl'

function formatSize(bytes?: number | null) {
  if (!bytes) return ''
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function FileEvidenceBody({ evidence }: { evidence: Evidence }) {
  const { objectUrl, error } = useEvidenceFileUrl(evidence.url)
  const [previewOpen, setPreviewOpen] = useState(false)
  const isImage = evidence.type === 'image'

  return (
    <div className='flex flex-wrap items-start gap-4'>
      {isImage ? (
        <button
          type='button'
          onClick={() => objectUrl && setPreviewOpen(true)}
          disabled={!objectUrl}
          className='flex h-24 w-36 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e3e8e5] bg-[#f7f9f8]'
          aria-label={`Preview ${evidence.name}`}
        >
          {objectUrl ? (
            <img src={objectUrl} alt={evidence.caption ?? evidence.name} className='size-full object-cover' />
          ) : error ? (
            <span className='px-2 text-center text-[11px] text-[#a1332b]'>{error}</span>
          ) : (
            <LoaderCircle className='size-5 animate-spin text-[#8a958f]' aria-hidden='true' />
          )}
        </button>
      ) : (
        <div className='flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#fdf0ef] text-[#a1332b]'>
          <FileText className='size-6' aria-hidden='true' />
        </div>
      )}
      <div className='min-w-0 flex-1'>
        <p className='break-words text-[14px] font-semibold text-[#14211b]'>{evidence.name}</p>
        <p className='mt-0.5 text-[12px] text-[#8a958f]'>
          {evidence.contentType} · {formatSize(evidence.fileSizeBytes)}
        </p>
        {objectUrl ? (
          <a
            href={objectUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-[#184b38] hover:underline'
          >
            Open {isImage ? 'full size' : 'PDF'}
            <SquareArrowOutUpRight className='size-3' aria-hidden='true' />
          </a>
        ) : null}
      </div>
      {previewOpen && objectUrl ? (
        <ContributionModal title={evidence.name} description={evidence.caption ?? undefined} onClose={() => setPreviewOpen(false)} wide>
          <div className='flex items-center justify-center'>
            <img
              src={objectUrl}
              alt={evidence.caption ?? evidence.name}
              className='max-h-[calc(90vh-10rem)] max-w-full object-contain'
            />
          </div>
        </ContributionModal>
      ) : null}
    </div>
  )
}
