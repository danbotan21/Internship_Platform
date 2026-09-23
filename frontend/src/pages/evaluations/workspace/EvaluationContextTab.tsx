import { FolderGit2, SquareArrowOutUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { evaluationApi } from '../../../api/evaluations'
import CategoryTag from '../../../components/contributions/CategoryTag'
import EvidenceSummaryChips from '../../../components/contributions/EvidenceSummaryChips'
import { formatScore, typeMeta } from '../../../components/evaluations/evaluationLabels'
import Alert from '../../../components/ui/Alert'
import EmptyState from '../../../components/ui/EmptyState'
import PageLoader from '../../../components/ui/PageLoader'
import { formatDateTime, formatPeriod } from '../../../components/ui/formatDateTime'
import { card, sectionTitle } from '../../../components/ui/styles'
import { useLoadedData } from '../../usePageData'

// Read-only internship context for the evaluation period; reloads when the period changes.
export default function EvaluationContextTab({ evaluationId, period }: { evaluationId: string; period: string }) {
  const { data, error, loading } = useLoadedData(
    () => evaluationApi.context(evaluationId),
    `context-${evaluationId}-${period}`,
  )

  if (loading && !data) return <PageLoader label='Loading context…' />
  if (error || !data) return <Alert tone='danger'>{error || 'Context unavailable.'}</Alert>

  return (
    <div className='space-y-5'>
      <Alert tone='info' title='Context only — it never scores automatically'>
        Use it to inform your judgement for {formatPeriod(data.periodStart, data.periodEnd)}. Missing sources never block
        scoring.
      </Alert>

      <section className={`${card} p-5`}>
        <h2 className={sectionTitle}>Validated contributions in this period ({data.contributions.length})</h2>
        <p className='mt-1 text-[13px] text-[#5d6b64]'>
          Work the student recorded and you verified in Contribution Management.
        </p>
        {data.contributions.length ? (
          <ul className='mt-4 space-y-2'>
            {data.contributions.map((item) => (
              <li key={item.id} className='flex flex-wrap items-center gap-3 rounded-xl border border-[#e3e8e5] p-4'>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <CategoryTag category={item.category} />
                    <span className='text-[12px] text-[#8a958f]'>{formatPeriod(item.workStartDate, item.workEndDate)}</span>
                  </div>
                  <p className='mt-1.5 text-[14px] font-semibold text-[#14211b]'>{item.title}</p>
                  <div className='mt-1'>
                    <EvidenceSummaryChips summary={item.evidence} />
                  </div>
                </div>
                <div className='text-right text-[12px] text-[#8a958f]'>
                  {item.validatedAtUtc ? `Validated ${formatDateTime(item.validatedAtUtc)}` : 'Validated'}
                  <Link
                    to={`/contributions/${item.id}`}
                    className='mt-1 flex items-center justify-end gap-1 font-semibold text-[#184b38] hover:underline'
                  >
                    Open <SquareArrowOutUpRight className='size-3' aria-hidden='true' />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className='mt-4'>
            <EmptyState icon={FolderGit2} title='No validated contributions in this period' />
          </div>
        )}
      </section>

      <section className={`${card} p-5`}>
        <h2 className={sectionTitle}>Previous evaluations</h2>
        {data.previousEvaluations.length ? (
          <ul className='mt-3 space-y-2'>
            {data.previousEvaluations.map((item) => (
              <li key={item.id} className='flex items-center justify-between rounded-lg bg-[#f7f9f8] px-4 py-3 text-[13px]'>
                <span>
                  <span className='font-semibold'>{typeMeta[item.type].label}</span> ·{' '}
                  {formatPeriod(item.periodStart, item.periodEnd)}
                </span>
                <Link to={`/evaluation/${item.id}`} className='font-bold tabular-nums text-[#184b38] hover:underline'>
                  {formatScore(item.finalScore)} / 100
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className='mt-2 text-[13px] text-[#5d6b64]'>This is the student's first finalized evaluation.</p>
        )}
      </section>

      {data.unavailableSources.length ? (
        <Alert tone='warning' title='Not available yet'>
          {data.unavailableSources.join(' and ')} will appear here once those modules are integrated.
        </Alert>
      ) : null}
    </div>
  )
}
