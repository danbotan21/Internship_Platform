import { Badge, EvidenceList, Heading } from '../components/ContributionUi'
import { RevisionHistory } from '../components/RevisionHistory'
import type { Contribution } from '../types/contribution'

const card = 'rounded-[10px] border border-[#d9e0dc] bg-white'
const field =
  'mt-2 w-full rounded-lg border border-[#d9e0dc] bg-white px-3 py-3 text-[13px] text-[#14211b] outline-none focus:border-[#2b6a50] focus:ring-2 focus:ring-[#2b6a50]/15'
const label =
  'block text-[10px] font-semibold uppercase tracking-wide text-[#6f7c76]'
const primary =
  'rounded-lg bg-[#184b38] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#245c47]'
const secondary =
  'rounded-lg border border-[#d9e0dc] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#184b38] hover:bg-[#f5f7f6]'

type ContributionRevisionPageProps = {
  item: Contribution
  linkName: string
  linkUrl: string
  onLinkName: (value: string) => void
  onLinkUrl: (value: string) => void
  onUpdate: (changes: Partial<Contribution>) => void
  onRemoveEvidence: (id: string) => void
  onAddLink: () => void
  onUpload: (file?: File) => void
  onSave: () => void
  onReview: () => void
  onEditDetails: () => void
}

export default function ContributionRevisionPage({
  item,
  linkName,
  linkUrl,
  onLinkName,
  onLinkUrl,
  onUpdate,
  onRemoveEvidence,
  onAddLink,
  onUpload,
  onSave,
  onReview,
  onEditDetails,
}: ContributionRevisionPageProps) {
  return (
    <>
      <Heading
        eyebrow='Contribution management · Student'
        title={`Changes requested · ${item.title}`}
        description='Review mentor feedback, update your contribution and submit a new revision.'
        right={<Badge status={item.status} />}
      />
      <div className='mb-5 rounded-[10px] bg-[#fde8e7] p-4 text-[12px]'>
        <strong>Mentor feedback</strong>
        <p className='mt-1 text-[#6f7c76]'>
          {item.mentorFeedback ||
            'Review the requested changes before resubmitting.'}
        </p>
      </div>
      <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]'>
        <section className={`${card} p-5`}>
          <h2 className='text-[17px] font-bold'>Revision</h2>
          <p className='mt-1 text-[11px] text-[#6f7c76]'>
            Your existing details are retained. Replace or add evidence below.
          </p>
          <div className='mt-5'>
            <EvidenceList
              items={item.evidence}
              onRemove={onRemoveEvidence}
            />
          </div>
          <div className='mt-5 grid gap-3 sm:grid-cols-[1fr_1.4fr_auto]'>
            <label className={label}>
              Link name
              <input
                className={field}
                value={linkName}
                onChange={(event) => onLinkName(event.target.value)}
                placeholder='e.g. Final pull request'
              />
            </label>
            <label className={label}>
              URL
              <input
                className={field}
                value={linkUrl}
                onChange={(event) => onLinkUrl(event.target.value)}
                placeholder='https://...'
              />
            </label>
            <button
              type='button'
              className={`${secondary} self-end`}
              onClick={onAddLink}
            >
              Add link
            </button>
          </div>
          <label className={`${secondary} mt-3 inline-block cursor-pointer`}>
            Upload file (max 1 MB)
            <input
              className='sr-only'
              type='file'
              onChange={(event) => {
                onUpload(event.target.files?.[0])
                event.target.value = ''
              }}
            />
          </label>
          <label className={`${label} mt-6`}>
            Revision note *
            <textarea
              className={`${field} min-h-24 resize-y`}
              value={item.revisionNote ?? ''}
              onChange={(event) =>
                onUpdate({ revisionNote: event.target.value })
              }
              placeholder='What did you change in response to the feedback?'
            />
          </label>
          <div className='mt-5 flex flex-wrap justify-end gap-2'>
            <button type='button' className={secondary} onClick={onEditDetails}>
              Edit contribution details
            </button>
            <button type='button' className={secondary} onClick={onSave}>
              Save revision draft
            </button>
            <button type='button' className={primary} onClick={onReview}>
              Review resubmission
            </button>
          </div>
        </section>
        <RevisionHistory item={item} />
      </div>
    </>
  )
}
