import { CircleCheck, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { evaluationApi } from '../../api/evaluations'
import EvaluationFeedbackView from '../../components/evaluations/EvaluationFeedbackView'
import EvaluationStatusBadge from '../../components/evaluations/EvaluationStatusBadge'
import ScoreBreakdownTable from '../../components/evaluations/ScoreBreakdownTable'
import ScoreHero from '../../components/evaluations/ScoreHero'
import { typeMeta } from '../../components/evaluations/evaluationLabels'
import Alert from '../../components/ui/Alert'
import BackLink from '../../components/ui/BackLink'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import PageHeading from '../../components/ui/PageHeading'
import PageLoader from '../../components/ui/PageLoader'
import { formatDateTime, formatPeriod } from '../../components/ui/formatDateTime'
import { card, sectionTitle, textareaBase } from '../../components/ui/styles'
import { useAction, useLoadedData } from '../usePageData'

export default function StudentEvaluationPage() {
  const { id = '' } = useParams()
  const { data: evaluation, setData, error: loadError, loading } = useLoadedData(() => evaluationApi.getMine(id), id)
  const { busy, error, run } = useAction()
  const [response, setResponse] = useState('')

  if (loading && !evaluation) return <PageLoader label='Loading evaluation…' />
  if (loadError || !evaluation) return <Alert tone='danger' title='Evaluation unavailable'>{loadError || 'Not found.'}</Alert>

  const finalized = evaluation.status === 'finalized'

  return (
    <>
      <BackLink to='/evaluation'>My evaluations</BackLink>
      <PageHeading
        eyebrow='Evaluation'
        title={finalized ? `${typeMeta[evaluation.type].label} result` : typeMeta[evaluation.type].label}
        meta={
          <>
            <EvaluationStatusBadge status={evaluation.status} studentView upcoming={evaluation.isUpcoming} />
            <span className='text-[12px] text-[#8a958f]'>
              {formatPeriod(evaluation.periodStart, evaluation.periodEnd)} · {evaluation.mentor.fullName} ·{' '}
              {evaluation.rubricTitle} v{evaluation.rubricVersionNumber}
            </span>
          </>
        }
      />
      {error ? <Alert tone='danger' className='mb-4'>{error}</Alert> : null}

      {!finalized ? (
        <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]'>
          <section className={`${card} p-6`}>
            <div className='flex items-start gap-3'>
              <EyeOff className='mt-0.5 size-5 shrink-0 text-[#5d6b64]' aria-hidden='true' />
              <div>
                <h2 className={sectionTitle}>
                  {evaluation.isUpcoming ? 'This evaluation period has not started yet' : 'Your mentor is working on this evaluation'}
                </h2>
                <p className='mt-1 text-[13px] text-[#5d6b64]'>
                  Ratings, comments and feedback stay hidden until {evaluation.mentor.fullName} finalizes the evaluation.
                </p>
              </div>
            </div>
            <h3 className='mt-6 text-[13px] font-semibold text-[#14211b]'>You will be rated on</h3>
            <ul className='mt-2 space-y-2'>
              {evaluation.criteria.map((criterion) => (
                <li key={criterion.criterionId} className='flex justify-between gap-3 rounded-lg bg-[#f7f9f8] px-4 py-3 text-[13px]'>
                  <span>
                    <span className='font-semibold'>{criterion.name}</span>
                    <span className='block text-[12px] text-[#5d6b64]'>{criterion.description}</span>
                  </span>
                  <span className='shrink-0 font-bold tabular-nums'>{criterion.weight}%</span>
                </li>
              ))}
            </ul>
          </section>
          <aside className='rounded-xl bg-[#eef3f0] p-5 text-[13px] text-[#2b3833]'>
            <p className='font-semibold'>What happens next</p>
            <ol className='mt-2 list-inside list-decimal space-y-1'>
              <li>Your mentor scores each criterion and writes feedback.</li>
              <li>They verify the evaluation and finalize it.</li>
              <li>You see your result here and confirm you read it.</li>
            </ol>
            <Link to='/evaluation/criteria' className='mt-4 inline-block font-semibold text-[#184b38] hover:underline'>
              Read the criteria guidance
            </Link>
          </aside>
        </div>
      ) : (
        <div className='space-y-5'>
          <ScoreHero
            score={evaluation.finalScore ?? 0}
            label={`Finalized by ${evaluation.mentor.fullName} · ${formatDateTime(evaluation.finalizedAtUtc)}`}
            previousScore={evaluation.previousFinalScore}
            previousType={evaluation.previousType}
          />
          <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]'>
            <ScoreBreakdownTable
              criteria={evaluation.criteria}
              title='Criterion breakdown'
              description='Your rating per criterion, its weighted points and your mentor’s comment.'
            />
            <div className='space-y-5'>
              <EvaluationFeedbackView feedback={evaluation.feedback} mentorName={evaluation.mentor.fullName} />
              <section className={`${card} p-5`}>
                {evaluation.acknowledgedAtUtc ? (
                  <div className='flex items-start gap-3'>
                    <CircleCheck className='mt-0.5 size-5 shrink-0 text-[#2c8a5a]' aria-hidden='true' />
                    <div>
                      <p className='text-[14px] font-semibold text-[#14211b]'>
                        You acknowledged this result {formatDateTime(evaluation.acknowledgedAtUtc)}
                      </p>
                      {evaluation.studentResponse ? (
                        <p className='mt-1 text-[13px] text-[#5d6b64]'>“{evaluation.studentResponse}”</p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className={sectionTitle}>Confirm you read your result</h2>
                    <p className='mt-1 text-[13px] text-[#5d6b64]'>
                      Your mentor sees when you acknowledge it. You can add a short reply.
                    </p>
                    <Field label='Reply (optional)' htmlFor='ack-response' className='mt-4' counter={{ value: response.trim().length, max: 1000 }}>
                      <textarea
                        id='ack-response'
                        className={`${textareaBase} min-h-20`}
                        maxLength={1000}
                        value={response}
                        onChange={(event) => setResponse(event.target.value)}
                      />
                    </Field>
                    <Button
                      className='mt-3 w-full'
                      icon={CircleCheck}
                      loading={busy}
                      onClick={() =>
                        void run(() => evaluationApi.acknowledge(evaluation.id, response.trim() || null)).then((result) => {
                          if (result) setData(result)
                        })
                      }
                    >
                      Acknowledge result
                    </Button>
                  </>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
