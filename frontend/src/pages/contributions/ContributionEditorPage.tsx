import { ArrowLeft, ArrowRight, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { contributionApi } from '../../api/contributions'
import { useAuth } from '../../hooks/authContext'
import ContributionStatusBadge from '../../components/contributions/ContributionStatusBadge'
import SubmissionChecklist from '../../components/contributions/SubmissionChecklist'
import AttributionPanel from '../../components/contributions/attribution/AttributionPanel'
import { categoryMeta } from '../../components/contributions/contributionLabels'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import PageHeading from '../../components/ui/PageHeading'
import { card } from '../../components/ui/styles'
import type { ContributionDetails, DraftInput, Evidence } from '../../types/contribution'
import { useAction } from './contributionHooks'
import EditorDetailsStep from './editor/EditorDetailsStep'
import EditorEvidenceStep from './editor/EditorEvidenceStep'
import EditorStepper from './editor/EditorStepper'
import EditorSubmitStep from './editor/EditorSubmitStep'
import { editorSteps, emptyDraft, openChangeRequest, toDraft, type EditorStep } from './editor/editorForm'

function isStep(value: string | null): value is EditorStep {
  return editorSteps.some((step) => step.value === value)
}

export default function ContributionEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const [params, setParams] = useSearchParams()
  const stepParam = params.get('step')
  const step: EditorStep = id && isStep(stepParam) ? stepParam : 'details'

  const [contribution, setContribution] = useState<ContributionDetails | null>(null)
  const [form, setForm] = useState<DraftInput>(emptyDraft)
  const [dirty, setDirty] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)
  const { busy, error, setError, run } = useAction()

  useEffect(() => {
    if (!id) return
    let active = true
    contributionApi
      .getMine(id)
      .then((loaded) => {
        if (!active) return
        if (loaded.status !== 'draft' && loaded.status !== 'changesRequested') {
          navigate(`/contributions/${id}`, { replace: true })
          return
        }
        setContribution(loaded)
        setForm(toDraft(loaded))
      })
      .catch((reason: unknown) => {
        if (active) setLoadError(reason instanceof Error ? reason.message : 'Contribution not found.')
      })
    return () => {
      active = false
    }
  }, [id, navigate])

  const update = (changes: Partial<DraftInput>) => {
    setForm((current) => ({ ...current, ...changes }))
    setDirty(true)
  }

  const applyResult = (result: ContributionDetails) => {
    setContribution(result)
    return true
  }

  const save = async (): Promise<ContributionDetails | null> => {
    const saved = await run(() => (id ? contributionApi.save(id, form) : contributionApi.create(form)))
    if (!saved) return null
    setContribution(saved)
    setForm(toDraft(saved))
    setDirty(false)
    return saved
  }

  const goTo = async (next: EditorStep) => {
    if (next === step) return
    if (!id || dirty) {
      const saved = await save()
      if (!saved) return
      if (!id) {
        navigate(`/contributions/${saved.id}/edit?step=${next}`, { replace: true })
        return
      }
    }
    setError('')
    setParams({ step: next })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveAndExit = async () => {
    const saved = await save()
    if (saved) navigate(`/contributions/${saved.id}`)
  }

  const submit = async () => {
    if (!id) return
    if (dirty && !(await save())) return
    const submitted = await run(() => contributionApi.submit(id, form.revisionNote))
    if (submitted) navigate(`/contributions/${id}`, { state: { flash: 'Submitted for mentor review.' } })
  }

  const evidenceAction = (action: (contributionId: string) => Promise<ContributionDetails>) =>
    id ? run(() => action(id)).then((result) => (result ? applyResult(result) : false)) : Promise.resolve(false)

  const removeEvidence = async (evidence: Evidence) => {
    setRemovingId(evidence.id)
    await evidenceAction((contributionId) => contributionApi.removeEvidence(contributionId, evidence.id))
    setRemovingId(null)
  }

  if (loadError) {
    return (
      <Alert tone='danger' title='Contribution unavailable'>
        {loadError}
      </Alert>
    )
  }

  if (id && !contribution) {
    return <p className='py-10 text-center text-[13px] text-[#5d6b64]'>Loading contribution…</p>
  }

  const changeRequest = openChangeRequest(contribution)
  const stepIndex = editorSteps.findIndex((item) => item.value === step)
  const nextStep = editorSteps[stepIndex + 1]?.value
  const previousStep = editorSteps[stepIndex - 1]?.value

  return (
    <>
      <Link
        to={id ? `/contributions/${id}` : '/contributions'}
        className='mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#184b38] hover:underline'
      >
        <ArrowLeft className='size-4' aria-hidden='true' />
        {id ? 'Back to contribution' : 'Back to my contributions'}
      </Link>
      <PageHeading
        eyebrow={changeRequest ? `Revision ${contribution?.currentRevisionNumber}` : id ? 'Edit draft' : 'New contribution'}
        title={form.title.trim() || 'Record a contribution'}
        description={
          changeRequest
            ? 'Address every point of the mentor feedback, then resubmit.'
            : 'Describe the work, attach verifiable evidence, credit your teammates and submit it for review.'
        }
        meta={contribution ? <ContributionStatusBadge status={contribution.status} /> : null}
        actions={
          <Button variant='secondary' icon={Save} loading={busy && dirty} onClick={() => void saveAndExit()}>
            Save & close
          </Button>
        }
      />

      {changeRequest && step !== 'submit' ? (
        <Alert
          tone='warning'
          className='mb-5'
          title={`${changeRequest.feedbackItems.length} change(s) requested`}
          action={
            <button
              type='button'
              onClick={() => void goTo('submit')}
              className='shrink-0 text-[13px] font-semibold hover:underline'
            >
              Answer feedback
            </button>
          }
        >
          <ol className='mt-1 list-inside list-decimal space-y-0.5'>
            {changeRequest.feedbackItems.map((item) => (
              <li key={item.id}>{item.message}</li>
            ))}
          </ol>
        </Alert>
      ) : null}

      <EditorStepper
        step={step}
        checks={contribution?.submissionChecks ?? []}
        locked={!id}
        onChange={(next) => void goTo(next)}
      />

      {error ? (
        <Alert tone='danger' className='mb-5' onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]'>
        <div className='min-w-0'>
          {step === 'details' ? (
            <EditorDetailsStep form={form} onChange={update} />
          ) : step === 'evidence' && contribution ? (
            <EditorEvidenceStep
              contribution={contribution}
              removingId={removingId}
              onAddGitHub={(url) => evidenceAction((contributionId) => contributionApi.addGitHub(contributionId, url))}
              onUploadFile={(file, caption) =>
                evidenceAction((contributionId) => contributionApi.addFile(contributionId, file, caption))
              }
              onAddLink={(name, url, caption) =>
                evidenceAction((contributionId) => contributionApi.addLink(contributionId, name, url, caption))
              }
              onRemove={(evidence) => void removeEvidence(evidence)}
            />
          ) : step === 'team' && contribution ? (
            <AttributionPanel
              contribution={contribution}
              viewerId={session?.userId ?? ''}
              canEdit
              canAnswerDisputes
              busy={busy}
              onAdd={(input) => evidenceAction((contributionId) => contributionApi.addCollaborator(contributionId, input))}
              onUpdate={(collaborator, input) =>
                evidenceAction((contributionId) =>
                  contributionApi.updateCollaborator(contributionId, collaborator.id, input),
                )
              }
              onRemove={(collaborator) =>
                void evidenceAction((contributionId) => contributionApi.removeCollaborator(contributionId, collaborator.id))
              }
            />
          ) : step === 'submit' && contribution ? (
            <EditorSubmitStep
              contribution={contribution}
              form={form}
              dirty={dirty}
              submitting={busy}
              onChange={update}
              onSubmit={() => void submit()}
            />
          ) : null}

          <div className='mt-6 flex flex-wrap justify-between gap-2'>
            {previousStep && id ? (
              <Button variant='secondary' icon={ArrowLeft} disabled={busy} onClick={() => void goTo(previousStep)}>
                Back
              </Button>
            ) : (
              <span />
            )}
            {nextStep ? (
              <Button loading={busy && step === 'details'} onClick={() => void goTo(nextStep)}>
                {id ? 'Continue' : 'Save draft & continue'}
                <ArrowRight className='size-4' aria-hidden='true' />
              </Button>
            ) : null}
          </div>
        </div>

        <aside className='space-y-4 lg:sticky lg:top-4 lg:self-start'>
          <div className={`${card} p-5 ${step === 'submit' ? 'hidden' : ''}`}>
            {contribution ? (
              <SubmissionChecklist checks={contribution.submissionChecks} />
            ) : (
              <>
                <p className='text-[13px] font-semibold text-[#14211b]'>How it works</p>
                <ol className='mt-3 list-inside list-decimal space-y-2 text-[13px] text-[#5d6b64]'>
                  <li>Describe what you delivered and when.</li>
                  <li>Attach evidence the platform can verify.</li>
                  <li>Credit teammates — they confirm it themselves.</li>
                  <li>Submit; your mentor reviews it against clear criteria.</li>
                </ol>
              </>
            )}
            {dirty && contribution ? (
              <p className='mt-4 text-[12px] text-[#8a958f]'>Unsaved changes — the checklist updates after saving.</p>
            ) : null}
          </div>
          <div className='rounded-xl bg-[#eef3f0] p-4 text-[12px] text-[#2b3833]'>
            <p className='font-semibold'>{categoryMeta[form.category].label} requires</p>
            <p className='mt-1'>{categoryMeta[form.category].requirement}</p>
          </div>
        </aside>
      </div>
    </>
  )
}
