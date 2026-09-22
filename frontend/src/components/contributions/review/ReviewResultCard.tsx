import { CircleCheck, CircleX, MessageSquareReply } from 'lucide-react'
import type { ContributionReview } from '../../../types/contribution'
import Avatar from '../../ui/Avatar'
import { formatDateTime } from '../../ui/formatDateTime'
import { card } from '../../ui/styles'
import { criterionMeta, outcomeMeta, rejectionReasonLabels } from '../contributionLabels'

type ReviewResultCardProps = {
  review: ContributionReview
  compact?: boolean
}

export default function ReviewResultCard({ review, compact }: ReviewResultCardProps) {
  const outcome = outcomeMeta[review.outcome]
  return (
    <section className={`${card} p-5`}>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <Avatar name={review.mentorName ?? 'Mentor'} />
          <div>
            <p className={`text-[14px] font-bold ${outcome.tone}`}>
              {outcome.label} · v{review.revisionNumber}
            </p>
            <p className='text-[12px] text-[#8a958f]'>
              {review.mentorName ?? 'Mentor'} · {formatDateTime(review.reviewedAtUtc)}
            </p>
          </div>
        </div>
        {review.rejectionReason ? (
          <span className='rounded-full bg-[#fde8e7] px-2.5 py-1 text-[12px] font-semibold text-[#a1332b]'>
            {rejectionReasonLabels[review.rejectionReason]}
          </span>
        ) : null}
      </div>

      <p className='mt-4 whitespace-pre-wrap text-[14px] leading-relaxed text-[#2b3833]'>{review.summary}</p>

      {!compact ? (
        <ul className='mt-4 space-y-2 border-t border-[#eef1ef] pt-4'>
          {review.checks.map((check) => (
            <li key={check.criterion} className='flex gap-2.5'>
              {check.isMet ? (
                <CircleCheck className='mt-0.5 size-4 shrink-0 text-[#2c8a5a]' aria-label='Met' />
              ) : (
                <CircleX className='mt-0.5 size-4 shrink-0 text-[#c9483e]' aria-label='Not met' />
              )}
              <div>
                <p className='text-[13px] font-medium text-[#14211b]'>{criterionMeta[check.criterion].label}</p>
                {check.comment ? <p className='text-[12px] text-[#5d6b64]'>{check.comment}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {review.feedbackItems.length ? (
        <div className='mt-4 border-t border-[#eef1ef] pt-4'>
          <p className='text-[13px] font-semibold text-[#14211b]'>Requested changes</p>
          <ol className='mt-2 space-y-3'>
            {review.feedbackItems.map((item) => (
              <li key={item.id} className='rounded-lg bg-[#fdf5ea] p-3'>
                <p className='text-[13px] text-[#5a3209]'>
                  <span className='font-bold'>{item.position}.</span> {item.message}
                </p>
                {item.evidenceName ? (
                  <p className='mt-1 text-[12px] text-[#8a4a0c]'>About: {item.evidenceName}</p>
                ) : null}
                {item.response ? (
                  <p className='mt-2 flex gap-1.5 rounded-md bg-white px-2.5 py-2 text-[12px] text-[#2b3833]'>
                    <MessageSquareReply className='mt-0.5 size-3.5 shrink-0 text-[#2b6a50]' aria-hidden='true' />
                    {item.response}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  )
}
