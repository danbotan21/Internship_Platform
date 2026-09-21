import { MessageSquareWarning } from 'lucide-react'
import type { ContributionReview } from '../../../types/contribution'
import { textareaBase } from '../../ui/styles'

type FeedbackResponsesPanelProps = {
  review: ContributionReview
  responses: Record<string, string>
  onChange: (feedbackItemId: string, response: string) => void
}

// The student answers every point of the mentor's change request.
export default function FeedbackResponsesPanel({ review, responses, onChange }: FeedbackResponsesPanelProps) {
  return (
    <section className='rounded-xl border border-[#f2d5b3] bg-[#fdf8f1] p-5'>
      <div className='flex items-start gap-3'>
        <MessageSquareWarning className='mt-0.5 size-5 shrink-0 text-[#a3530f]' aria-hidden='true' />
        <div>
          <h2 className='text-[15px] font-semibold text-[#5a3209]'>
            {review.mentorName ?? 'Your mentor'} requested changes
          </h2>
          <p className='mt-1 whitespace-pre-wrap text-[13px] text-[#6b4a2a]'>{review.summary}</p>
        </div>
      </div>
      <ol className='mt-4 space-y-4'>
        {review.feedbackItems.map((item) => {
          const value = responses[item.id] ?? ''
          return (
            <li key={item.id} className='rounded-lg border border-[#f2e2cc] bg-white p-4'>
              <p className='text-[14px] font-medium text-[#14211b]'>
                {item.position}. {item.message}
              </p>
              {item.evidenceName ? (
                <p className='mt-1 text-[12px] text-[#8a4a0c]'>About: {item.evidenceName}</p>
              ) : null}
              <label className='mt-3 block text-[12px] font-semibold text-[#5d6b64]' htmlFor={`response-${item.id}`}>
                How did you address it?{' '}
                <span className={value.trim().length >= 10 ? 'text-[#17603f]' : 'text-[#a3530f]'}>
                  ({value.trim().length >= 10 ? 'answered' : 'at least 10 characters'})
                </span>
              </label>
              <textarea
                id={`response-${item.id}`}
                className={`${textareaBase} mt-1.5 min-h-20`}
                maxLength={1000}
                value={value}
                onChange={(event) => onChange(item.id, event.target.value)}
              />
            </li>
          )
        })}
      </ol>
    </section>
  )
}
