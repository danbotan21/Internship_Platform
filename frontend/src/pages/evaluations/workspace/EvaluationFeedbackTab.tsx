import Field from '../../../components/ui/Field'
import { card, sectionTitle, textareaBase } from '../../../components/ui/styles'
import type { EvaluationFeedback } from '../../../types/evaluation'

type FeedbackKey = keyof EvaluationFeedback

const fields: { key: FeedbackKey; label: string; hint: string; required: boolean }[] = [
  { key: 'strengths', label: 'Strengths', hint: 'What the student does well and should keep doing.', required: true },
  {
    key: 'areasForImprovement',
    label: 'Areas for improvement',
    hint: 'The most important things to work on, concretely.',
    required: true,
  },
  { key: 'nextSteps', label: 'Next steps', hint: 'Actions for the next period.', required: true },
  { key: 'overallComment', label: 'Overall comment', hint: 'Optional summary of the period.', required: false },
]

type EvaluationFeedbackTabProps = {
  feedback: Record<FeedbackKey, string>
  onChange: (key: FeedbackKey, value: string) => void
}

export default function EvaluationFeedbackTab({ feedback, onChange }: EvaluationFeedbackTabProps) {
  return (
    <section className={`${card} space-y-5 p-5`}>
      <div>
        <h2 className={sectionTitle}>Structured feedback</h2>
        <p className='mt-1 text-[13px] text-[#5d6b64]'>
          The student receives this together with the finalized result. The first three are required.
        </p>
      </div>
      {fields.map((field) => (
        <Field
          key={field.key}
          label={field.label}
          htmlFor={`feedback-${field.key}`}
          required={field.required}
          hint={field.hint}
          counter={{ value: feedback[field.key].trim().length, min: field.required ? 10 : undefined, max: 2000 }}
        >
          <textarea
            id={`feedback-${field.key}`}
            className={textareaBase}
            maxLength={2000}
            value={feedback[field.key]}
            onChange={(event) => onChange(field.key, event.target.value)}
          />
        </Field>
      ))}
    </section>
  )
}
