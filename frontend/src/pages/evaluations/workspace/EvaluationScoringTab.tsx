import { ChevronDown, History } from 'lucide-react'
import { useState } from 'react'
import RatingInput from '../../../components/evaluations/RatingInput'
import { formatRating, formatScore } from '../../../components/evaluations/evaluationLabels'
import { textareaBase } from '../../../components/ui/styles'
import type { EvaluationCriterionScore } from '../../../types/evaluation'
import type { ScoreDraft } from './evaluationForm'

type EvaluationScoringTabProps = {
  criteria: EvaluationCriterionScore[]
  scores: ScoreDraft
  onChange: (criterionId: string, change: Partial<ScoreDraft[string]>) => void
}

function CriterionCard({
  criterion,
  value,
  onChange,
}: {
  criterion: EvaluationCriterionScore
  value: ScoreDraft[string]
  onChange: (change: Partial<ScoreDraft[string]>) => void
}) {
  const [showGuide, setShowGuide] = useState(false)
  const rated = value.rating !== null
  const commentLength = value.comment.trim().length
  const points = rated ? Math.round((value.rating! / criterion.scaleMax) * criterion.weight * 100) / 100 : null
  const complete = rated && commentLength >= 10

  return (
    <li className={`rounded-xl border bg-white p-5 ${complete ? 'border-[#cfe3d7]' : 'border-[#e3e8e5]'}`}>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          <p className='text-[15px] font-semibold text-[#14211b]'>{criterion.name}</p>
          <p className='mt-0.5 text-[13px] text-[#5d6b64]'>{criterion.description}</p>
        </div>
        <div className='text-right'>
          <p className='text-[12px] text-[#8a958f]'>Weight</p>
          <p className='text-[16px] font-bold tabular-nums'>{criterion.weight}%</p>
        </div>
      </div>

      <button
        type='button'
        onClick={() => setShowGuide((current) => !current)}
        className='mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-[#184b38] hover:underline'
        aria-expanded={showGuide}
      >
        <ChevronDown className={`size-3.5 transition ${showGuide ? 'rotate-180' : ''}`} aria-hidden='true' />
        Rating guide
      </button>
      {showGuide ? <p className='mt-1 rounded-lg bg-[#f7f9f8] px-3 py-2 text-[12px] text-[#2b3833]'>{criterion.guidance}</p> : null}

      <div className='mt-4 flex flex-wrap items-center justify-between gap-3'>
        <RatingInput
          value={value.rating}
          scaleMax={criterion.scaleMax}
          step={criterion.ratingStep}
          label={`Rating for ${criterion.name}`}
          onChange={(rating) => onChange({ rating })}
        />
        <div className='text-right text-[12px]'>
          <p className='font-semibold tabular-nums text-[#14211b]'>
            {points === null ? '—' : formatScore(points)} / {criterion.weight} pts
          </p>
          {criterion.previousRating !== null && criterion.previousRating !== undefined ? (
            <p className='inline-flex items-center gap-1 text-[#8a958f]'>
              <History className='size-3' aria-hidden='true' />
              previously {formatRating(criterion.previousRating)} / {criterion.previousScaleMax}
            </p>
          ) : null}
        </div>
      </div>

      <label className='mt-4 block text-[12px] font-semibold text-[#5d6b64]' htmlFor={`comment-${criterion.criterionId}`}>
        Comment for the student{' '}
        <span className={commentLength >= 10 ? 'text-[#17603f]' : 'text-[#a3530f]'}>
          ({commentLength >= 10 ? 'complete' : 'required, at least 10 characters'})
        </span>
      </label>
      <textarea
        id={`comment-${criterion.criterionId}`}
        className={`${textareaBase} mt-1.5 min-h-20 text-[13px]`}
        maxLength={1000}
        value={value.comment}
        onChange={(event) => onChange({ comment: event.target.value })}
        placeholder='What you observed that justifies this rating.'
      />
    </li>
  )
}

export default function EvaluationScoringTab({ criteria, scores, onChange }: EvaluationScoringTabProps) {
  return (
    <ol className='space-y-3'>
      {criteria.map((criterion) => (
        <CriterionCard
          key={criterion.criterionId}
          criterion={criterion}
          value={scores[criterion.criterionId] ?? { rating: null, comment: '' }}
          onChange={(change) => onChange(criterion.criterionId, change)}
        />
      ))}
    </ol>
  )
}
