import { Check } from 'lucide-react'
import type { SubmissionCheck } from '../../../types/contribution'
import { editorSteps, type EditorStep } from './editorForm'

type EditorStepperProps = {
  step: EditorStep
  checks: SubmissionCheck[]
  // Steps after "details" need a saved draft.
  locked: boolean
  onChange: (step: EditorStep) => void
}

export default function EditorStepper({ step, checks, locked, onChange }: EditorStepperProps) {
  return (
    <nav aria-label='Contribution steps' className='mb-6'>
      <ol className='grid grid-cols-2 gap-2 md:grid-cols-4'>
        {editorSteps.map((item, index) => {
          const related = checks.filter((check) => item.checks.includes(check.code))
          const done = related.length > 0 && related.every((check) => check.passed)
          const active = item.value === step
          const disabled = locked && item.value !== 'details'
          return (
            <li key={item.value}>
              <button
                type='button'
                disabled={disabled}
                onClick={() => onChange(item.value)}
                aria-current={active ? 'step' : undefined}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  active
                    ? 'border-[#184b38] bg-white shadow-[0_2px_8px_rgba(24,75,56,0.12)]'
                    : 'border-[#e3e8e5] bg-white/70 hover:bg-white'
                }`}
              >
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                    done ? 'bg-[#2c8a5a] text-white' : active ? 'bg-[#184b38] text-white' : 'bg-[#eef1ef] text-[#5d6b64]'
                  }`}
                >
                  {done ? <Check className='size-4' aria-hidden='true' /> : index + 1}
                </span>
                <span className={`text-[13px] font-semibold ${active ? 'text-[#14211b]' : 'text-[#5d6b64]'}`}>
                  {item.label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
