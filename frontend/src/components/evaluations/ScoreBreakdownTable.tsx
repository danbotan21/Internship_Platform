import { ArrowDown, ArrowUp } from 'lucide-react'
import type { EvaluationCriterionScore } from '../../types/evaluation'
import { card, sectionTitle } from '../ui/styles'
import { formatRating, formatScore } from './evaluationLabels'

type ScoreBreakdownTableProps = {
  criteria: EvaluationCriterionScore[]
  title?: string
  description?: string
}

// Rating, weighted points, change since the previous evaluation and comment per criterion.
export default function ScoreBreakdownTable({ criteria, title = 'Score breakdown', description }: ScoreBreakdownTableProps) {
  return (
    <section className={`${card} p-5`}>
      <h2 className={sectionTitle}>{title}</h2>
      {description ? <p className='mt-1 text-[13px] text-[#5d6b64]'>{description}</p> : null}
      <ul className='mt-4 divide-y divide-[#eef1ef]'>
        {criteria.map((criterion) => {
          const ratio = criterion.rating ? criterion.rating / criterion.scaleMax : 0
          const change =
            criterion.rating && criterion.previousRating && criterion.previousScaleMax
              ? criterion.rating / criterion.scaleMax - criterion.previousRating / criterion.previousScaleMax
              : null
          return (
            <li key={criterion.criterionId} className='py-4 first:pt-0 last:pb-0'>
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <p className='text-[14px] font-semibold text-[#14211b]'>{criterion.name}</p>
                  <p className='text-[12px] text-[#8a958f]'>Weight {criterion.weight}%</p>
                </div>
                <div className='flex items-center gap-4 text-right'>
                  {change !== null && Math.abs(change) > 0.001 ? (
                    <span
                      className={`inline-flex items-center gap-0.5 text-[12px] font-semibold ${
                        change > 0 ? 'text-[#17603f]' : 'text-[#a1332b]'
                      }`}
                      title={`Previously ${formatRating(criterion.previousRating)} / ${criterion.previousScaleMax}`}
                    >
                      {change > 0 ? <ArrowUp className='size-3.5' aria-hidden='true' /> : <ArrowDown className='size-3.5' aria-hidden='true' />}
                      was {formatRating(criterion.previousRating)}
                    </span>
                  ) : null}
                  <span className='text-[14px] font-bold tabular-nums text-[#14211b]'>
                    {formatRating(criterion.rating)} / {criterion.scaleMax}
                  </span>
                  <span className='w-20 text-[13px] tabular-nums text-[#5d6b64]'>
                    {formatScore(criterion.weightedPoints)} / {criterion.weight} pts
                  </span>
                </div>
              </div>
              <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-[#eef1ef]'>
                <div className='h-full rounded-full bg-[#2c8a5a]' style={{ width: `${ratio * 100}%` }} />
              </div>
              {criterion.comment ? (
                <p className='mt-2 text-[13px] text-[#2b3833]'>{criterion.comment}</p>
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
