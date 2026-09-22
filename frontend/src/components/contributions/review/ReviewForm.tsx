import { CircleCheck, CircleX, Plus, Send, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type {
  ContributionDetails,
  RejectionReason,
  ReviewCriterion,
  ReviewInput,
  ReviewOutcome,
} from '../../../types/contribution'
import Alert from '../../ui/Alert'
import Button from '../../ui/Button'
import Field from '../../ui/Field'
import { card, inputBase, textareaBase } from '../../ui/styles'
import { criteria, criterionMeta, rejectionReasonLabels } from '../contributionLabels'

type Assessment = { isMet: boolean | null; comment: string }

type ReviewFormProps = {
  contribution: ContributionDetails
  submitting: boolean
  onSubmit: (input: ReviewInput) => void
}

const outcomes: { value: ReviewOutcome; label: string; description: string; tone: string }[] = [
  {
    value: 'validated',
    label: 'Validate',
    description: 'Every criterion is met.',
    tone: 'peer-checked:border-[#2c8a5a] peer-checked:bg-[#eef8f2]',
  },
  {
    value: 'changesRequested',
    label: 'Request changes',
    description: 'Fixable problems — list what to change.',
    tone: 'peer-checked:border-[#e07a26] peer-checked:bg-[#fdf5ea]',
  },
  {
    value: 'rejected',
    label: 'Reject',
    description: 'Cannot be accepted as project work.',
    tone: 'peer-checked:border-[#c9483e] peer-checked:bg-[#fdf0ef]',
  },
]

// Structured review: every criterion is assessed before an outcome is allowed.
export default function ReviewForm({ contribution, submitting, onSubmit }: ReviewFormProps) {
  const [assessments, setAssessments] = useState<Record<ReviewCriterion, Assessment>>(
    () =>
      Object.fromEntries(criteria.map((criterion) => [criterion, { isMet: null, comment: '' }])) as Record<
        ReviewCriterion,
        Assessment
      >,
  )
  const [outcome, setOutcome] = useState<ReviewOutcome | null>(null)
  const [summary, setSummary] = useState('')
  const [rejectionReason, setRejectionReason] = useState<RejectionReason>('evidenceNotVerifiable')
  const [feedback, setFeedback] = useState<{ message: string; evidenceId: string }[]>([
    { message: '', evidenceId: '' },
  ])

  const evidence = contribution.currentRevision.evidence
  const allAssessed = criteria.every((criterion) => assessments[criterion].isMet !== null)
  const allMet = criteria.every((criterion) => assessments[criterion].isMet === true)
  const anyUnmet = criteria.some((criterion) => assessments[criterion].isMet === false)
  const unexplained = criteria.filter(
    (criterion) => assessments[criterion].isMet === false && assessments[criterion].comment.trim().length < 10,
  )
  const hasDispute = contribution.collaborators.some((item) => item.status === 'disputed')
  const changeRequestsLeft = contribution.changeRequestsLimit - contribution.changeRequestsUsed
  const filledFeedback = feedback.filter((item) => item.message.trim().length > 0)

  const outcomeBlocker = (value: ReviewOutcome): string | null => {
    if (!allAssessed) return 'Assess every criterion first.'
    if (value === 'validated') {
      if (!allMet) return 'Every criterion must be met.'
      if (hasDispute) return 'A collaborator disputes the attribution.'
    }
    if (value === 'changesRequested') {
      if (!anyUnmet) return 'Mark at least one criterion as not met.'
      if (changeRequestsLeft <= 0) return 'The change request limit is reached.'
    }
    if (value === 'rejected' && !anyUnmet) return 'Mark the criteria that are not met.'
    return null
  }

  const problems: string[] = []
  if (!outcome) problems.push('Choose an outcome.')
  else if (outcomeBlocker(outcome)) problems.push(outcomeBlocker(outcome)!)
  if (unexplained.length) problems.push('Explain every unmet criterion (10+ characters).')
  if (summary.trim().length < 20) problems.push('Write a summary of at least 20 characters.')
  if (
    outcome === 'changesRequested' &&
    (filledFeedback.length === 0 || filledFeedback.some((item) => item.message.trim().length < 10))
  ) {
    problems.push('List each requested change (10+ characters).')
  }

  const setAssessment = (criterion: ReviewCriterion, change: Partial<Assessment>) =>
    setAssessments((current) => ({ ...current, [criterion]: { ...current[criterion], ...change } }))

  const submit = () => {
    if (!outcome || problems.length) return
    onSubmit({
      outcome,
      summary: summary.trim(),
      rejectionReason: outcome === 'rejected' ? rejectionReason : null,
      checks: criteria.map((criterion) => ({
        criterion,
        isMet: assessments[criterion].isMet === true,
        comment: assessments[criterion].comment.trim() || null,
      })),
      feedbackItems:
        outcome === 'changesRequested'
          ? filledFeedback.map((item) => ({ message: item.message.trim(), evidenceId: item.evidenceId || null }))
          : [],
    })
  }

  return (
    <section className={`${card} p-5`}>
      <h2 className='text-[16px] font-bold text-[#14211b]'>Your review</h2>
      <p className='mt-1 text-[13px] text-[#5d6b64]'>
        Assess each criterion. The outcome options unlock based on your assessment.
      </p>

      <ol className='mt-5 space-y-3'>
        {criteria.map((criterion, index) => {
          const assessment = assessments[criterion]
          return (
            <li key={criterion} className='rounded-lg border border-[#e3e8e5] p-3'>
              <div className='flex flex-wrap items-start justify-between gap-2'>
                <div className='min-w-0'>
                  <p className='text-[13px] font-semibold text-[#14211b]'>
                    {index + 1}. {criterionMeta[criterion].label}
                  </p>
                  <p className='text-[12px] text-[#5d6b64]'>{criterionMeta[criterion].question}</p>
                </div>
                <div className='flex gap-1' role='group' aria-label={criterionMeta[criterion].label}>
                  <button
                    type='button'
                    onClick={() => setAssessment(criterion, { isMet: true })}
                    aria-pressed={assessment.isMet === true}
                    className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[12px] font-semibold ${
                      assessment.isMet === true
                        ? 'border-[#2c8a5a] bg-[#eef8f2] text-[#17603f]'
                        : 'border-[#d9e0dc] text-[#5d6b64] hover:bg-[#f2f5f3]'
                    }`}
                  >
                    <CircleCheck className='size-3.5' aria-hidden='true' /> Met
                  </button>
                  <button
                    type='button'
                    onClick={() => setAssessment(criterion, { isMet: false })}
                    aria-pressed={assessment.isMet === false}
                    className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[12px] font-semibold ${
                      assessment.isMet === false
                        ? 'border-[#c9483e] bg-[#fdf0ef] text-[#a1332b]'
                        : 'border-[#d9e0dc] text-[#5d6b64] hover:bg-[#f2f5f3]'
                    }`}
                  >
                    <CircleX className='size-3.5' aria-hidden='true' /> Not met
                  </button>
                </div>
              </div>
              {assessment.isMet === false ? (
                <textarea
                  className={`${textareaBase} mt-2 min-h-16 text-[13px]`}
                  placeholder='What exactly is missing or wrong?'
                  maxLength={1000}
                  value={assessment.comment}
                  onChange={(event) => setAssessment(criterion, { comment: event.target.value })}
                  aria-label={`Why is "${criterionMeta[criterion].label}" not met?`}
                />
              ) : null}
            </li>
          )
        })}
      </ol>

      <fieldset className='mt-5'>
        <legend className='text-[13px] font-semibold text-[#14211b]'>Outcome</legend>
        <div className='mt-2 grid gap-2'>
          {outcomes.map((option) => {
            const blocker = outcomeBlocker(option.value)
            return (
              <label key={option.value} className={blocker ? 'cursor-not-allowed' : 'cursor-pointer'}>
                <input
                  type='radio'
                  name='review-outcome'
                  className='peer sr-only'
                  value={option.value}
                  checked={outcome === option.value}
                  disabled={Boolean(blocker)}
                  onChange={() => setOutcome(option.value)}
                />
                <span
                  className={`block rounded-lg border border-[#d9e0dc] px-3 py-2.5 transition peer-disabled:opacity-50 peer-focus-visible:ring-2 peer-focus-visible:ring-[#2b6a50]/30 ${option.tone}`}
                >
                  <span className='block text-[13px] font-semibold text-[#14211b]'>{option.label}</span>
                  <span className='block text-[12px] text-[#5d6b64]'>{blocker ?? option.description}</span>
                </span>
              </label>
            )
          })}
        </div>
        {changeRequestsLeft < contribution.changeRequestsLimit ? (
          <p className='mt-2 text-[12px] text-[#8a958f]'>
            {changeRequestsLeft} of {contribution.changeRequestsLimit} change requests left for this contribution.
          </p>
        ) : null}
      </fieldset>

      {outcome === 'rejected' ? (
        <Field label='Rejection reason' htmlFor='rejection-reason' className='mt-4'>
          <select
            id='rejection-reason'
            className={inputBase}
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value as RejectionReason)}
          >
            {Object.entries(rejectionReasonLabels).map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {outcome === 'changesRequested' ? (
        <div className='mt-4'>
          <p className='text-[13px] font-semibold text-[#14211b]'>Changes the student must make</p>
          <ol className='mt-2 space-y-2'>
            {feedback.map((item, index) => (
              <li key={index} className='rounded-lg border border-[#e3e8e5] p-3'>
                <div className='flex items-start gap-2'>
                  <span className='mt-2 text-[13px] font-bold text-[#8a958f]'>{index + 1}.</span>
                  <div className='min-w-0 flex-1 space-y-2'>
                    <textarea
                      className={`${textareaBase} min-h-16 text-[13px]`}
                      placeholder='A concrete, checkable change…'
                      maxLength={1000}
                      value={item.message}
                      onChange={(event) =>
                        setFeedback((current) =>
                          current.map((entry, i) => (i === index ? { ...entry, message: event.target.value } : entry)),
                        )
                      }
                      aria-label={`Requested change ${index + 1}`}
                    />
                    <select
                      className={`${inputBase} py-2 text-[13px]`}
                      value={item.evidenceId}
                      onChange={(event) =>
                        setFeedback((current) =>
                          current.map((entry, i) =>
                            i === index ? { ...entry, evidenceId: event.target.value } : entry,
                          ),
                        )
                      }
                      aria-label={`Evidence for change ${index + 1}`}
                    >
                      <option value=''>Not about a specific evidence item</option>
                      {evidence.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          About: {entry.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {feedback.length > 1 ? (
                    <button
                      type='button'
                      onClick={() => setFeedback((current) => current.filter((_, i) => i !== index))}
                      className='rounded-lg p-2 text-[#8a958f] hover:bg-[#fdf0ef] hover:text-[#a1332b]'
                      aria-label={`Remove change ${index + 1}`}
                    >
                      <Trash2 className='size-4' aria-hidden='true' />
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
          {feedback.length < 10 ? (
            <Button
              variant='ghost'
              size='sm'
              icon={Plus}
              className='mt-2'
              onClick={() => setFeedback((current) => [...current, { message: '', evidenceId: '' }])}
            >
              Add another change
            </Button>
          ) : null}
        </div>
      ) : null}

      <Field
        label='Summary for the student'
        htmlFor='review-summary'
        required
        className='mt-4'
        counter={{ value: summary.trim().length, min: 20, max: 2000 }}
      >
        <textarea
          id='review-summary'
          className={textareaBase}
          maxLength={2000}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          placeholder='What you verified and why you reached this outcome.'
        />
      </Field>

      {problems.length && outcome ? (
        <Alert tone='warning' className='mt-4'>
          {problems[0]}
        </Alert>
      ) : null}

      <Button
        className='mt-4 w-full'
        icon={Send}
        loading={submitting}
        disabled={problems.length > 0}
        onClick={submit}
      >
        {outcome === 'validated'
          ? 'Validate contribution'
          : outcome === 'changesRequested'
            ? 'Send change request'
            : outcome === 'rejected'
              ? 'Reject contribution'
              : 'Submit review'}
      </Button>
    </section>
  )
}
