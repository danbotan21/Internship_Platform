import { TrendingDown, TrendingUp } from 'lucide-react'
import type { EvaluationType } from '../../types/evaluation'
import { formatScore, scoreBand, typeMeta } from './evaluationLabels'

type ScoreHeroProps = {
  score: number
  label: string
  previousScore?: number | null
  previousType?: EvaluationType | null
  caption?: string
}

// The 0–100 result with its verbal band and the change since the previous evaluation.
export default function ScoreHero({ score, label, previousScore, previousType, caption }: ScoreHeroProps) {
  const band = scoreBand(score)
  const delta = previousScore === null || previousScore === undefined ? null : score - previousScore
  return (
    <section className='flex flex-wrap items-center gap-6 rounded-xl border border-[#cfe3d7] bg-gradient-to-br from-[#eef8f2] to-[#f7fbf9] p-6'>
      <div
        className='relative flex size-28 shrink-0 items-center justify-center rounded-full'
        style={{ background: `conic-gradient(#2c8a5a ${score * 3.6}deg, #dcebe2 0deg)` }}
        aria-hidden='true'
      >
        <div className='flex size-[92px] flex-col items-center justify-center rounded-full bg-white'>
          <span className='text-[28px] font-bold leading-none tabular-nums text-[#14211b]'>{formatScore(score)}</span>
          <span className='text-[11px] text-[#8a958f]'>/ 100</span>
        </div>
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-[12px] font-bold uppercase tracking-wider text-[#2b6a50]'>{label}</p>
        <p className={`mt-1 text-[22px] font-bold ${band.tone}`}>{band.label}</p>
        {caption ? <p className='mt-1 text-[13px] text-[#5d6b64]'>{caption}</p> : null}
        {delta !== null && previousType ? (
          <p
            className={`mt-2 inline-flex items-center gap-1 text-[13px] font-semibold ${
              delta >= 0 ? 'text-[#17603f]' : 'text-[#a1332b]'
            }`}
          >
            {delta >= 0 ? <TrendingUp className='size-4' aria-hidden='true' /> : <TrendingDown className='size-4' aria-hidden='true' />}
            {delta >= 0 ? '+' : ''}
            {formatScore(delta)} points since the {typeMeta[previousType].label.toLowerCase()} ({formatScore(previousScore)})
          </p>
        ) : null}
      </div>
    </section>
  )
}
