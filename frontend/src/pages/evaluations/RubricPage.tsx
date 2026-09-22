import { History, ListChecks, Pencil, Plus, Send, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { evaluationApi } from '../../api/evaluations'
import SubmissionChecklist from '../../components/contributions/SubmissionChecklist'
import CriterionEditorModal from '../../components/evaluations/CriterionEditorModal'
import RubricCriteriaList from '../../components/evaluations/RubricCriteriaList'
import WeightMeter from '../../components/evaluations/WeightMeter'
import { rubricStatusMeta } from '../../components/evaluations/evaluationLabels'
import Alert from '../../components/ui/Alert'
import BackLink from '../../components/ui/BackLink'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Field from '../../components/ui/Field'
import Modal from '../../components/ui/Modal'
import PageHeading from '../../components/ui/PageHeading'
import PageLoader from '../../components/ui/PageLoader'
import { formatDateTime } from '../../components/ui/formatDateTime'
import { card, inputBase, sectionTitle } from '../../components/ui/styles'
import type { MentorRubric, RubricCriterion } from '../../types/evaluation'
import { useAction, useLoadedData } from '../usePageData'

type Dialog =
  | { kind: 'add' }
  | { kind: 'edit'; criterion: RubricCriterion }
  | { kind: 'remove'; criterion: RubricCriterion }
  | { kind: 'publish' }
  | { kind: 'discard' }
  | null

export default function RubricPage() {
  const navigate = useNavigate()
  const { data: rubric, setData, error: loadError, loading } = useLoadedData(() => evaluationApi.getRubric(), 'rubric')
  const { busy, error, setError, run } = useAction()
  const [dialog, setDialog] = useState<Dialog>(null)
  const [title, setTitle] = useState<string | null>(null)
  const [changeNote, setChangeNote] = useState<string | null>(null)

  const apply = async (action: () => Promise<MentorRubric>) => {
    const result = await run(action)
    if (result) {
      setData(result)
      setDialog(null)
    }
    return Boolean(result)
  }

  if (loading && !rubric) return <PageLoader label='Loading rubric…' />
  if (loadError || !rubric) return <Alert tone='danger'>{loadError || 'Rubric unavailable.'}</Alert>

  const { published, draft } = rubric
  const draftTitle = title ?? draft?.title ?? ''
  const draftNote = changeNote ?? draft?.changeNote ?? ''
  const detailsChanged = draft && (draftTitle !== draft.title || draftNote !== (draft.changeNote ?? ''))
  const publishReady = draft?.publishChecks.every((check) => check.passed) ?? false
  const editing = dialog?.kind === 'edit' ? dialog.criterion : undefined
  const otherWeight =
    (draft?.criteria ?? []).filter((item) => item.id !== editing?.id).reduce((sum, item) => sum + item.weight, 0)

  return (
    <>
      <BackLink to='/evaluation'>Evaluations</BackLink>
      <PageHeading
        eyebrow='Evaluation · Rubric'
        title='Evaluation rubric'
        description='The criteria, weights and rating scales you score students against. Published versions are immutable; every evaluation keeps the version it was created with.'
        actions={
          <Button variant='secondary' icon={History} onClick={() => navigate('/evaluation/rubric/history')}>
            Version history
          </Button>
        }
      />
      {error ? (
        <Alert tone='danger' className='mb-5' onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      {!published && !draft ? (
        <EmptyState
          icon={ListChecks}
          title='You have no rubric yet'
          description='Start from the recommended internship criteria (technical delivery, problem solving, collaboration, communication, reliability) or build your own.'
          action={
            <div className='flex flex-wrap justify-center gap-2'>
              <Button loading={busy} onClick={() => void apply(() => evaluationApi.createDraft('template'))}>
                Start from recommended criteria
              </Button>
              <Button variant='secondary' disabled={busy} onClick={() => void apply(() => evaluationApi.createDraft('empty'))}>
                Start empty
              </Button>
            </div>
          }
        />
      ) : null}

      {draft ? (
        <div className='mb-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]'>
          <section className={`${card} p-5`}>
            <div className='flex flex-wrap items-start justify-between gap-3'>
              <div>
                <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${rubricStatusMeta.draft.tone}`}>
                  Draft v{draft.versionNumber}
                </span>
                <h2 className={`${sectionTitle} mt-2`}>Editing the next version</h2>
                <p className='mt-1 text-[13px] text-[#5d6b64]'>
                  {published
                    ? `Based on v${published.versionNumber}, used by ${published.usedByEvaluations} evaluation(s). Changes only affect evaluations created after publishing.`
                    : 'Your first version. Publish it to start creating evaluations.'}
                </p>
              </div>
              <Button icon={Plus} variant='secondary' onClick={() => setDialog({ kind: 'add' })}>
                Add criterion
              </Button>
            </div>

            <div className='mt-5 grid gap-3 sm:grid-cols-2'>
              <Field label='Rubric title' htmlFor='rubric-title'>
                <input id='rubric-title' className={inputBase} maxLength={120} value={draftTitle} onChange={(event) => setTitle(event.target.value)} />
              </Field>
              <Field label='What changed in this version' htmlFor='rubric-note'>
                <input
                  id='rubric-note'
                  className={inputBase}
                  maxLength={500}
                  value={draftNote}
                  onChange={(event) => setChangeNote(event.target.value)}
                  placeholder='e.g. Added an initiative criterion'
                />
              </Field>
            </div>
            {detailsChanged ? (
              <div className='mt-2 flex justify-end'>
                <Button
                  size='sm'
                  loading={busy}
                  onClick={() =>
                    void apply(() => evaluationApi.updateDraft(draftTitle, draftNote || null)).then((saved) => {
                      if (saved) {
                        setTitle(null)
                        setChangeNote(null)
                      }
                    })
                  }
                >
                  Save details
                </Button>
              </div>
            ) : null}

            <div className='mt-5 rounded-xl bg-[#f7f9f8] p-4'>
              <WeightMeter criteria={draft.criteria} />
            </div>
            <div className='mt-5'>
              <RubricCriteriaList
                criteria={draft.criteria}
                busy={busy}
                onMove={(criterion, offset) => void apply(() => evaluationApi.moveCriterion(criterion.id, offset))}
                onEdit={(criterion) => setDialog({ kind: 'edit', criterion })}
                onRemove={(criterion) => setDialog({ kind: 'remove', criterion })}
              />
            </div>
          </section>

          <aside className='space-y-4 lg:sticky lg:top-4 lg:self-start'>
            <div className={`${card} p-5`}>
              <SubmissionChecklist checks={draft.publishChecks} title='Ready to publish?' />
              <Button className='mt-5 w-full' icon={Send} disabled={!publishReady} onClick={() => setDialog({ kind: 'publish' })}>
                Publish v{draft.versionNumber}
              </Button>
              <Button variant='danger' className='mt-2 w-full' icon={Trash2} onClick={() => setDialog({ kind: 'discard' })}>
                Discard draft
              </Button>
            </div>
            <p className='rounded-xl bg-[#eef3f0] p-4 text-[12px] text-[#2b3833]'>
              Weighted score = rating ÷ scale maximum × criterion weight. The weights of all criteria add up to the
              100-point result.
            </p>
          </aside>
        </div>
      ) : null}

      {published ? (
        <section className={`${card} p-5`}>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${rubricStatusMeta.published.tone}`}>
                Published v{published.versionNumber}
              </span>
              <h2 className={`${sectionTitle} mt-2`}>{published.title}</h2>
              <p className='mt-1 text-[13px] text-[#5d6b64]'>
                Published {formatDateTime(published.publishedAtUtc)} · {published.criteria.length} criteria · used by{' '}
                {published.usedByEvaluations} evaluation(s) · read-only
              </p>
            </div>
            {!draft ? (
              <Button icon={Pencil} loading={busy} onClick={() => void apply(() => evaluationApi.createDraft('published'))}>
                Create new version
              </Button>
            ) : null}
          </div>
          <div className='mt-5 rounded-xl bg-[#f7f9f8] p-4'>
            <WeightMeter criteria={published.criteria} />
          </div>
          <div className='mt-5'>
            <RubricCriteriaList criteria={published.criteria} />
          </div>
        </section>
      ) : null}

      {dialog?.kind === 'add' || dialog?.kind === 'edit' ? (
        <CriterionEditorModal
          criterion={editing}
          otherWeight={otherWeight}
          saving={busy}
          onClose={() => setDialog(null)}
          onSave={(input) =>
            void apply(() =>
              editing ? evaluationApi.updateCriterion(editing.id, input) : evaluationApi.addCriterion(input),
            )
          }
        />
      ) : null}

      {dialog?.kind === 'remove' ? (
        <Modal
          title={`Remove “${dialog.criterion.name}” from Draft v${draft?.versionNumber}?`}
          description='Only the draft changes. Published versions and existing evaluations stay untouched.'
          onClose={() => setDialog(null)}
          footer={
            <>
              <Button variant='secondary' onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button variant='danger' icon={Trash2} loading={busy} onClick={() => void apply(() => evaluationApi.removeCriterion(dialog.criterion.id))}>
                Remove criterion
              </Button>
            </>
          }
        >
          <p className='text-[14px] text-[#2b3833]'>
            The remaining weights must add up to 100% again before the draft can be published.
          </p>
        </Modal>
      ) : null}

      {dialog?.kind === 'publish' && draft ? (
        <Modal
          title={`Publish rubric v${draft.versionNumber}?`}
          description='Students of your team immediately see the visible criteria.'
          onClose={() => setDialog(null)}
          footer={
            <>
              <Button variant='secondary' onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button icon={Send} loading={busy} onClick={() => void apply(() => evaluationApi.publishDraft())}>
                Publish
              </Button>
            </>
          }
        >
          <ul className='space-y-2 text-[14px] text-[#2b3833]'>
            <li>✓ {draft.criteria.length} criteria · 100% total weight</li>
            <li>✓ New evaluations will use v{draft.versionNumber}</li>
            <li>
              ✓ Existing evaluations keep their version
              {published ? ` (v${published.versionNumber} becomes archived)` : ''}
            </li>
            <li>✓ Further changes require a new draft version</li>
          </ul>
        </Modal>
      ) : null}

      {dialog?.kind === 'discard' && draft ? (
        <Modal
          title={`Discard Draft v${draft.versionNumber}?`}
          description='All changes in this draft are deleted. Published versions stay as they are.'
          onClose={() => setDialog(null)}
          footer={
            <>
              <Button variant='secondary' onClick={() => setDialog(null)}>
                Keep draft
              </Button>
              <Button variant='danger' icon={Trash2} loading={busy} onClick={() => void apply(() => evaluationApi.discardDraft())}>
                Discard draft
              </Button>
            </>
          }
        >
          <p className='text-[14px] text-[#2b3833]'>This cannot be undone.</p>
        </Modal>
      ) : null}
    </>
  )
}
