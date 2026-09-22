import { CalendarRange, Send, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { evaluationApi } from '../../../api/evaluations'
import SubmissionChecklist from '../../../components/contributions/SubmissionChecklist'
import { formatScore } from '../../../components/evaluations/evaluationLabels'
import AutosaveIndicator from '../../../components/ui/AutosaveIndicator'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/ui/Modal'
import Tabs from '../../../components/ui/Tabs'
import { formatPeriod } from '../../../components/ui/formatDateTime'
import { card } from '../../../components/ui/styles'
import type { EvaluationDetails } from '../../../types/evaluation'
import { useAutosave } from '../../usePageData'
import EvaluationContextTab from './EvaluationContextTab'
import EvaluationFeedbackTab from './EvaluationFeedbackTab'
import EvaluationPeriodModal from './EvaluationPeriodModal'
import EvaluationScoringTab from './EvaluationScoringTab'
import { provisionalScore, toEvaluationDraft, toSaveInput, type EvaluationDraft } from './evaluationForm'

type Tab = 'scoring' | 'feedback' | 'context'

type EvaluationDraftViewProps = {
  evaluation: EvaluationDetails
  busy: boolean
  run: <T>(action: () => Promise<T>) => Promise<T | null>
  onChanged: (result: EvaluationDetails, message?: string) => void
}

// Scoring workspace. Ratings and feedback save themselves while the mentor works;
// the local draft stays the source of truth, so nothing typed is overwritten.
export default function EvaluationDraftView({ evaluation, busy, run, onChanged }: EvaluationDraftViewProps) {
  const navigate = useNavigate()
  const [scores, setScores] = useState(() => toEvaluationDraft(evaluation).scores)
  const [feedback, setFeedback] = useState(() => toEvaluationDraft(evaluation).feedback)
  const [dirty, setDirty] = useState(false)
  const [tab, setTab] = useState<Tab>('scoring')
  const [dialog, setDialog] = useState<'delete' | 'period' | null>(null)

  const draft = useMemo<EvaluationDraft>(() => ({ scores, feedback }), [scores, feedback])
  const latest = useRef(draft)
  useEffect(() => {
    latest.current = draft
  })

  const autosave = useAutosave(draft, dirty, async (snapshot) => {
    const result = await evaluationApi.save(evaluation.id, toSaveInput(evaluation, snapshot))
    onChanged(result)
    if (latest.current === snapshot) setDirty(false)
  })

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  // Manual actions send the current draft too, after any background save finished.
  const saveWith = async (extra: { periodStart?: string; periodEnd?: string } = {}) => {
    await autosave.flush()
    const snapshot = latest.current
    const result = await run(() => evaluationApi.save(evaluation.id, { ...toSaveInput(evaluation, snapshot), ...extra }))
    if (result && latest.current === snapshot) setDirty(false)
    return result
  }

  const continueToReview = async () => {
    if (!(await saveWith())) return
    const result = await run(() => evaluationApi.markReady(evaluation.id))
    if (result) {
      onChanged(result, 'The evaluation is complete. Verify it and finalize.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const changePeriod = async (periodStart: string, periodEnd: string) => {
    const result = await saveWith({ periodStart, periodEnd })
    if (result) {
      onChanged(result, 'Evaluation period updated.')
      setDialog(null)
    }
  }

  const remove = async () => {
    await autosave.flush()
    const result = await run(() => evaluationApi.remove(evaluation.id))
    if (result !== null) navigate('/evaluation', { replace: true })
  }

  const live = provisionalScore(evaluation, scores)

  return (
    <>
      <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]'>
        <div className='min-w-0 space-y-4'>
          <Tabs<Tab>
            label='Evaluation sections'
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'scoring', label: 'Scoring', count: evaluation.criteria.length },
              { value: 'feedback', label: 'Feedback' },
              { value: 'context', label: 'Context' },
            ]}
          />
          {tab === 'scoring' ? (
            <EvaluationScoringTab
              criteria={evaluation.criteria}
              scores={scores}
              onChange={(criterionId, change) => {
                setScores((current) => ({ ...current, [criterionId]: { ...current[criterionId], ...change } }))
                setDirty(true)
              }}
            />
          ) : tab === 'feedback' ? (
            <EvaluationFeedbackTab
              feedback={feedback}
              onChange={(key, value) => {
                setFeedback((current) => ({ ...current, [key]: value }))
                setDirty(true)
              }}
            />
          ) : (
            <EvaluationContextTab
              evaluationId={evaluation.id}
              period={`${evaluation.periodStart}_${evaluation.periodEnd}`}
            />
          )}
        </div>

        <aside className='space-y-4 lg:sticky lg:top-4 lg:self-start'>
          <div className={`${card} p-5`}>
            <div className='flex items-start justify-between gap-3'>
              <p className='text-[13px] font-semibold text-[#14211b]'>Provisional score</p>
              <AutosaveIndicator status={autosave.status} error={autosave.error} />
            </div>
            <p className='mt-1 text-[28px] font-bold tabular-nums text-[#14211b]'>
              {formatScore(live.points)}
              <span className='text-[14px] font-normal text-[#8a958f]'> / {live.maximum} weighted points</span>
            </p>
            <p className='text-[12px] text-[#8a958f]'>
              {live.rated} of {evaluation.criteria.length} criteria rated
            </p>
            <div className='mt-4 flex items-center justify-between gap-2 rounded-lg bg-[#f7f9f8] px-3 py-2 text-[12px] text-[#2b3833]'>
              <span className='inline-flex items-center gap-1.5'>
                <CalendarRange className='size-3.5 text-[#2b6a50]' aria-hidden='true' />
                {formatPeriod(evaluation.periodStart, evaluation.periodEnd)}
              </span>
              <button
                type='button'
                onClick={() => setDialog('period')}
                className='font-semibold text-[#184b38] hover:underline'
              >
                Change
              </button>
            </div>
            <div className='mt-5 border-t border-[#eef1ef] pt-5'>
              <SubmissionChecklist checks={evaluation.checks} title='Ready for review?' />
              {dirty ? <p className='mt-3 text-[12px] text-[#8a958f]'>Checks update once your changes are saved.</p> : null}
            </div>
            <Button className='mt-5 w-full' icon={Send} loading={busy} onClick={() => void continueToReview()}>
              Continue to review
            </Button>
          </div>
          <Button
            variant='ghost'
            size='sm'
            icon={Trash2}
            className='w-full text-[#a1332b]'
            onClick={() => setDialog('delete')}
          >
            Delete this draft evaluation
          </Button>
          <p className='rounded-xl bg-[#eef3f0] p-4 text-[12px] text-[#2b3833]'>
            Ratings use the criterion scale; weighted points = rating ÷ scale maximum × weight. The student sees
            nothing until you finalize.
          </p>
        </aside>
      </div>

      {dialog === 'period' ? (
        <EvaluationPeriodModal
          start={evaluation.periodStart}
          end={evaluation.periodEnd}
          saving={busy}
          onClose={() => setDialog(null)}
          onSave={(start, end) => void changePeriod(start, end)}
        />
      ) : null}

      {dialog === 'delete' ? (
        <Modal
          title='Delete this draft evaluation?'
          description='Ratings and feedback of this draft are removed. You can create the evaluation again later.'
          onClose={() => setDialog(null)}
          footer={
            <>
              <Button variant='secondary' onClick={() => setDialog(null)}>
                Keep draft
              </Button>
              <Button variant='danger' icon={Trash2} loading={busy} onClick={() => void remove()}>
                Delete draft
              </Button>
            </>
          }
        >
          <p className='text-[14px] text-[#2b3833]'>
            {evaluation.student.fullName} · {formatPeriod(evaluation.periodStart, evaluation.periodEnd)}
          </p>
        </Modal>
      ) : null}
    </>
  )
}
