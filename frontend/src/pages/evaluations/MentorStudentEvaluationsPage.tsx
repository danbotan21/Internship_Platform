import { Plus } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { evaluationApi } from '../../api/evaluations'
import EvaluationStatusBadge from '../../components/evaluations/EvaluationStatusBadge'
import ScoreTrend from '../../components/evaluations/ScoreTrend'
import { evaluationTypes, formatScore, typeMeta } from '../../components/evaluations/evaluationLabels'
import Alert from '../../components/ui/Alert'
import Avatar from '../../components/ui/Avatar'
import BackLink from '../../components/ui/BackLink'
import PageHeading from '../../components/ui/PageHeading'
import PageLoader from '../../components/ui/PageLoader'
import { formatDateTime, formatPeriod } from '../../components/ui/formatDateTime'
import { card, sectionTitle } from '../../components/ui/styles'
import { useLoadedData } from '../usePageData'

// One student, their three evaluation instances and how their score evolves.
export default function MentorStudentEvaluationsPage() {
  const { studentId = '' } = useParams()
  const { data, error, loading } = useLoadedData(() => evaluationApi.mentorStudents(), `students-${studentId}`)

  if (loading && !data) return <PageLoader label='Loading…' />
  const overview = data?.find((item) => item.student.userId === studentId)
  if (error || !overview) return <Alert tone='danger'>{error || 'This student is not assigned to you.'}</Alert>

  const { student } = overview
  return (
    <>
      <BackLink to='/evaluation'>Evaluations</BackLink>
      <PageHeading
        eyebrow='Evaluation · Student workspace'
        title={student.fullName}
        description='One student, one evaluation per period. Internship context is read-only and never scores automatically.'
        meta={
          <span className='inline-flex items-center gap-2 text-[13px] text-[#5d6b64]'>
            <Avatar name={student.fullName} size='sm' />
            {student.email}
            {student.gitHubUsername ? ` · @${student.gitHubUsername}` : ''}
          </span>
        }
      />

      <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]'>
        <section className={`${card} p-5`}>
          <h2 className={sectionTitle}>Evaluation instances</h2>
          <ol className='mt-4 space-y-3'>
            {evaluationTypes.map((type, index) => {
              const evaluation = overview.evaluations.find((item) => item.type === type)
              return (
                <li key={type} className='flex flex-wrap items-center gap-4 rounded-xl border border-[#e3e8e5] p-4'>
                  <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eef3f0] text-[13px] font-bold text-[#184b38]'>
                    {index + 1}
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='text-[14px] font-semibold text-[#14211b]'>{typeMeta[type].label}</p>
                    <p className='text-[12px] text-[#8a958f]'>
                      {evaluation
                        ? `${formatPeriod(evaluation.periodStart, evaluation.periodEnd)} · rubric v${evaluation.rubricVersionNumber}`
                        : typeMeta[type].meaning}
                    </p>
                    {evaluation?.finalizedAtUtc ? (
                      <p className='text-[12px] text-[#8a958f]'>
                        Finalized {formatDateTime(evaluation.finalizedAtUtc)}
                        {evaluation.acknowledgedAtUtc ? ' · acknowledged by the student' : ' · not acknowledged yet'}
                      </p>
                    ) : null}
                  </div>
                  {evaluation ? (
                    <>
                      {evaluation.status === 'finalized' ? (
                        <span className='text-[18px] font-bold tabular-nums'>{formatScore(evaluation.finalScore)}</span>
                      ) : (
                        <span className='text-[12px] text-[#5d6b64]'>
                          {evaluation.criteriaScored} / {evaluation.criteriaTotal} scored
                        </span>
                      )}
                      <EvaluationStatusBadge status={evaluation.status} upcoming={evaluation.isUpcoming} />
                      <Link to={`/evaluation/${evaluation.id}`} className='text-[13px] font-semibold text-[#184b38] hover:underline'>
                        {evaluation.status === 'finalized' ? 'View' : evaluation.status === 'readyForReview' ? 'Review' : 'Continue'}
                      </Link>
                    </>
                  ) : (
                    <Link
                      to={`/evaluation/new?studentId=${student.userId}&type=${type}`}
                      className='inline-flex items-center gap-1 text-[13px] font-semibold text-[#184b38] hover:underline'
                    >
                      <Plus className='size-4' aria-hidden='true' /> Create
                    </Link>
                  )}
                </li>
              )
            })}
          </ol>
        </section>

        <aside className='space-y-5'>
          <div className={`${card} p-5`}>
            <h2 className={sectionTitle}>Internship context</h2>
            <dl className='mt-4 space-y-3 text-[13px]'>
              <div className='flex justify-between'>
                <dt className='text-[#5d6b64]'>Validated contributions</dt>
                <dd className='font-semibold'>{overview.validatedContributionCount}</dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-[#5d6b64]'>Latest final score</dt>
                <dd className='font-semibold'>{formatScore(overview.latestFinalScore)}</dd>
              </div>
            </dl>
            <p className='mt-4 text-[12px] text-[#8a958f]'>
              Context supports your judgement; it never calculates a rating.
            </p>
          </div>
          <ScoreTrend evaluations={overview.evaluations} />
        </aside>
      </div>
    </>
  )
}
