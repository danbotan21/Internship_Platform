import { Lock, RotateCcw, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { evaluationApi } from '../../../api/evaluations'
import SubmissionChecklist from '../../../components/contributions/SubmissionChecklist'
import EvaluationFeedbackView from '../../../components/evaluations/EvaluationFeedbackView'
import ScoreBreakdownTable from '../../../components/evaluations/ScoreBreakdownTable'
import ScoreHero from '../../../components/evaluations/ScoreHero'
import { formatScore, typeMeta } from '../../../components/evaluations/evaluationLabels'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import { card } from '../../../components/ui/styles'
import type { EvaluationDetails } from '../../../types/evaluation'

type EvaluationReviewViewProps = {
  evaluation: EvaluationDetails
  busy: boolean
  run: <T>(action: () => Promise<T>) => Promise<T | null>
  onChanged: (result: EvaluationDetails, message: string) => void
}

// Read-only verification before the result is locked and published.
export default function EvaluationReviewView({ evaluation, busy, run, onChanged }: EvaluationReviewViewProps) {
  const [confirming, setConfirming] = useState(false)

  const reopen = async () => {
    const result = await run(() => evaluationApi.reopen(evaluation.id))
    if (result) onChanged(result, 'Back in draft — you can edit again.')
  }

  const finalize = async () => {
    const result = await run(() => evaluationApi.finalize(evaluation.id))
    if (result) onChanged(result, 'Evaluation finalized and published to the student.')
  }

  return (
    <>
      <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]'>
        <div className='min-w-0 space-y-5'>
          <ScoreHero
            score={evaluation.provisionalPoints}
            label='Final score preview'
            previousScore={evaluation.previousFinalScore}
            previousType={evaluation.previousType}
            caption={`Calculated from the frozen rubric v${evaluation.rubricVersionNumber}.`}
          />
          <ScoreBreakdownTable
            criteria={evaluation.criteria}
            description='Verify each criterion before locking the evaluation.'
          />
          <EvaluationFeedbackView feedback={evaluation.feedback} />
        </div>
        <aside className='space-y-4 lg:sticky lg:top-4 lg:self-start'>
          <div className={`${card} p-5`}>
            <SubmissionChecklist checks={evaluation.checks} title='Finalization checks' />
            <p className='mt-4 flex gap-2 rounded-lg bg-[#f7f9f8] p-3 text-[12px] text-[#2b3833]'>
              <Lock className='mt-0.5 size-3.5 shrink-0 text-[#2b6a50]' aria-hidden='true' />
              Finalizing locks scores and feedback and publishes the result to {evaluation.student.fullName}.
            </p>
            <Button className='mt-4 w-full' icon={ShieldCheck} onClick={() => setConfirming(true)}>
              Finalize & publish
            </Button>
            <Button
              variant='secondary'
              className='mt-2 w-full'
              icon={RotateCcw}
              loading={busy && !confirming}
              onClick={() => void reopen()}
            >
              Back to edit
            </Button>
          </div>
        </aside>
      </div>

      {confirming ? (
        <Modal
          title={`Finalize ${evaluation.student.fullName}'s ${typeMeta[evaluation.type].label.toLowerCase()}?`}
          description='This publishes the result to the student and locks the assessment.'
          onClose={() => setConfirming(false)}
          footer={
            <>
              <Button variant='secondary' onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button icon={ShieldCheck} loading={busy} onClick={() => void finalize()}>
                Finalize & publish
              </Button>
            </>
          }
        >
          <p className='text-[32px] font-bold tabular-nums text-[#14211b]'>
            {formatScore(evaluation.provisionalPoints)}{' '}
            <span className='text-[16px] font-normal text-[#8a958f]'>/ 100</span>
          </p>
          <p className='mt-1 text-[13px] text-[#5d6b64]'>
            {evaluation.criteriaTotal} / {evaluation.criteriaTotal} criteria · feedback complete · rubric v
            {evaluation.rubricVersionNumber}
          </p>
          <p className='mt-4 text-[13px] text-[#2b3833]'>
            After finalization scores and comments become read-only. Corrections require a separate administrative
            process.
          </p>
        </Modal>
      ) : null}
    </>
  )
}
