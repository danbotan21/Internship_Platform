import type { EvaluationListItem } from '../../types/evaluation'
import { card, sectionTitle } from '../ui/styles'
import { evaluationTypes, formatScore, typeMeta } from './evaluationLabels'

// Finalized results across the internship: initial → mid-term → final.
export default function ScoreTrend({ evaluations }: { evaluations: EvaluationListItem[] }) {
  const points = evaluationTypes.map((type) => ({
    type,
    score: evaluations.find((item) => item.type === type && item.status === 'finalized')?.finalScore ?? null,
  }))

  return (
    <section className={`${card} p-5`}>
      <h2 className={sectionTitle}>Progress across the internship</h2>
      <div className='mt-5 grid grid-cols-3 items-end gap-4' style={{ height: 160 }}>
        {points.map(({ type, score }) => (
          <div key={type} className='flex h-full flex-col items-center justify-end gap-2'>
            <span className='text-[14px] font-bold tabular-nums text-[#14211b]'>{score === null ? '—' : formatScore(score)}</span>
            <div
              className={`w-full max-w-16 rounded-t-lg ${score === null ? 'border border-dashed border-[#d3dbd6] bg-transparent' : 'bg-[#2c8a5a]'}`}
              style={{ height: `${score === null ? 12 : Math.max(8, score)}%` }}
            />
            <span className='text-[12px] text-[#5d6b64]'>{typeMeta[type].short}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
