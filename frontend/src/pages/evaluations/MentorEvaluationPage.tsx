import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { evaluationApi } from '../../api/evaluations'
import EvaluationStatusBadge from '../../components/evaluations/EvaluationStatusBadge'
import LifecycleStepper from '../../components/evaluations/LifecycleStepper'
import { typeMeta } from '../../components/evaluations/evaluationLabels'
import Alert from '../../components/ui/Alert'
import Avatar from '../../components/ui/Avatar'
import BackLink from '../../components/ui/BackLink'
import PageHeading from '../../components/ui/PageHeading'
import PageLoader from '../../components/ui/PageLoader'
import { formatPeriod } from '../../components/ui/formatDateTime'
import type { EvaluationDetails } from '../../types/evaluation'
import { useAction, useLoadedData } from '../usePageData'
import EvaluationDraftView from './workspace/EvaluationDraftView'
import EvaluationFinalizedView from './workspace/EvaluationFinalizedView'
import EvaluationReviewView from './workspace/EvaluationReviewView'

// One evaluation through its lifecycle: draft scoring → verification → locked result.
export default function MentorEvaluationPage() {
  const { id = '' } = useParams()
  const { data: evaluation, setData, error: loadError, loading } = useLoadedData(
    () => evaluationApi.getForMentor(id),
    id,
  )
  const { busy, error, setError, run } = useAction()
  const [flash, setFlash] = useState('')

  if (loading && !evaluation) return <PageLoader label='Loading evaluation…' />
  if (loadError || !evaluation) {
    return (
      <Alert tone='danger' title='Evaluation unavailable'>
        {loadError || 'Not found.'}
      </Alert>
    )
  }

  const changed = (result: EvaluationDetails, message?: string) => {
    setData(result)
    if (message !== undefined) setFlash(message)
  }

  return (
    <>
      <BackLink to='/evaluation'>Evaluations</BackLink>
      <PageHeading
        eyebrow='Evaluation · Mentor'
        title={`${typeMeta[evaluation.type].label} · ${evaluation.student.fullName}`}
        meta={
          <>
            <EvaluationStatusBadge status={evaluation.status} upcoming={evaluation.isUpcoming} />
            <Link
              to={`/evaluation/students/${evaluation.student.userId}`}
              className='inline-flex items-center gap-2 text-[13px] text-[#3d4a44] hover:underline'
            >
              <Avatar name={evaluation.student.fullName} size='sm' />
              {evaluation.student.fullName}
            </Link>
            <span className='text-[12px] text-[#8a958f]'>
              {formatPeriod(evaluation.periodStart, evaluation.periodEnd)} · {evaluation.rubricTitle} v
              {evaluation.rubricVersionNumber}
            </span>
          </>
        }
      />
      <div className='mb-5'>
        <LifecycleStepper status={evaluation.status} />
      </div>
      {flash ? (
        <Alert tone='success' className='mb-4' onDismiss={() => setFlash('')}>
          {flash}
        </Alert>
      ) : null}
      {error ? (
        <Alert tone='danger' className='mb-4' onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      {evaluation.status === 'finalized' ? (
        <EvaluationFinalizedView evaluation={evaluation} />
      ) : evaluation.status === 'readyForReview' ? (
        <EvaluationReviewView evaluation={evaluation} busy={busy} run={run} onChanged={changed} />
      ) : (
        <EvaluationDraftView key={evaluation.id} evaluation={evaluation} busy={busy} run={run} onChanged={changed} />
      )}
    </>
  )
}
