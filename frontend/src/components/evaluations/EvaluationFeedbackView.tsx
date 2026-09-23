import { Compass, Sparkles, Target } from 'lucide-react'
import type { EvaluationFeedback } from '../../types/evaluation'
import { card, sectionTitle } from '../ui/styles'

const blocks = [
  { key: 'strengths', label: 'Strengths', icon: Sparkles, tone: 'bg-[#eef8f2] text-[#17603f]' },
  { key: 'areasForImprovement', label: 'Areas to improve', icon: Target, tone: 'bg-[#fdf5ea] text-[#8a4a0c]' },
  { key: 'nextSteps', label: 'Next steps', icon: Compass, tone: 'bg-[#f1f5fe] text-[#2f4f8f]' },
] as const

export default function EvaluationFeedbackView({ feedback, mentorName }: { feedback: EvaluationFeedback; mentorName?: string }) {
  return (
    <section className={`${card} p-5`}>
      <h2 className={sectionTitle}>Mentor feedback</h2>
      {mentorName ? <p className='mt-1 text-[13px] text-[#5d6b64]'>From {mentorName}</p> : null}
      <div className='mt-4 space-y-3'>
        {blocks.map(({ key, label, icon: Icon, tone }) => (
          <div key={key} className={`rounded-lg p-4 ${tone}`}>
            <p className='inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider'>
              <Icon className='size-3.5' aria-hidden='true' />
              {label}
            </p>
            <p className='mt-1.5 whitespace-pre-wrap text-[14px] text-[#2b3833]'>{feedback[key] || '—'}</p>
          </div>
        ))}
        {feedback.overallComment ? (
          <p className='whitespace-pre-wrap border-t border-[#eef1ef] pt-3 text-[13px] text-[#2b3833]'>
            {feedback.overallComment}
          </p>
        ) : null}
      </div>
    </section>
  )
}
