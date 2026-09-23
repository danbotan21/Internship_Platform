import { Check } from 'lucide-react'
import type { EvaluationStatus } from '../../types/evaluation'

const steps: { status: EvaluationStatus; label: string; hint: string }[] = [
  { status: 'draft', label: 'Draft', hint: 'Mentor scores and writes feedback' },
  { status: 'readyForReview', label: 'Ready to finalize', hint: 'Complete, verified before locking' },
  { status: 'finalized', label: 'Finalized', hint: 'Locked and visible to the student' },
]

export default function LifecycleStepper({ status }: { status: EvaluationStatus }) {
  const current = steps.findIndex((step) => step.status === status)
  return (
    <ol className='grid gap-2 sm:grid-cols-3'>
      {steps.map((step, index) => {
        const done = index < current || status === 'finalized'
        const active = index === current
        return (
          <li
            key={step.status}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
              active ? 'border-[#184b38] bg-white' : 'border-[#e3e8e5] bg-white/60'
            }`}
          >
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                done ? 'bg-[#2c8a5a] text-white' : active ? 'bg-[#184b38] text-white' : 'bg-[#eef1ef] text-[#5d6b64]'
              }`}
            >
              {done ? <Check className='size-4' aria-hidden='true' /> : index + 1}
            </span>
            <span className='min-w-0'>
              <span className={`block text-[13px] font-semibold ${active ? 'text-[#14211b]' : 'text-[#5d6b64]'}`}>
                {step.label}
              </span>
              <span className='block truncate text-[11px] text-[#8a958f]'>{step.hint}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
