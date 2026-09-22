import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { contributionApi } from '../../api/contributions'
import { useAuth } from '../../hooks/authContext'
import CategoryTag from '../../components/contributions/CategoryTag'
import ContributionOverview from '../../components/contributions/ContributionOverview'
import ContributionStatusBadge from '../../components/contributions/ContributionStatusBadge'
import ContributionTimeline from '../../components/contributions/ContributionTimeline'
import SubmissionChecklist from '../../components/contributions/SubmissionChecklist'
import AttributionPanel from '../../components/contributions/attribution/AttributionPanel'
import EvidenceList from '../../components/contributions/evidence/EvidenceList'
import ReviewResultCard from '../../components/contributions/review/ReviewResultCard'
import Alert, { type AlertTone } from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import PageHeading from '../../components/ui/PageHeading'
import { formatDateTime } from '../../components/ui/formatDateTime'
import { card, sectionTitle } from '../../components/ui/styles'
import type { ContributionDetails } from '../../types/contribution'
import { useAction, useLoadedData } from './contributionHooks'

function statusGuidance(contribution: ContributionDetails): { tone: AlertTone; title: string; text: string } {
  const disputed = contribution.collaborators.some((item) => item.status === 'disputed')
  switch (contribution.status) {
    case 'draft':
      return {
        tone: 'info',
        title: 'Draft — only you can see it',
        text: 'Complete the checklist and submit it when the evidence is attached.',
      }
    case 'submitted':
      return disputed
        ? {
            tone: 'danger',
            title: 'A collaborator disputes the attribution',
            text: 'The mentor cannot validate until you answer the dispute below.',
          }
        : {
            tone: 'info',
            title: 'Waiting for your mentor',
            text: 'The contribution is read-only while it is reviewed.',
          }
    case 'changesRequested':
      return {
        tone: 'warning',
        title: 'Your mentor requested changes',
        text: 'Revise the contribution, answer every feedback point and resubmit.',
      }
    case 'validated':
      return {
        tone: 'success',
        title: 'Validated',
        text: 'The mentor verified this work. It is final and counts as accepted evidence.',
      }
    default:
      return {
        tone: 'danger',
        title: 'Rejected',
        text: 'This contribution is closed. Read the review below; create a new contribution if the work should be recorded differently.',
      }
  }
}

export default function StudentContributionPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { session } = useAuth()
  const [flash, setFlash] = useState(() => (location.state as { flash?: string } | null)?.flash ?? '')
  const { data: contribution, setData, error: loadError, loading } = useLoadedData(
    () => contributionApi.getMine(id),
    id,
  )
  const { busy, error, setError, run } = useAction()
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Show the one-time message, then drop it so a reload does not repeat it.
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null })
  }, [location.state, location.pathname, navigate])

  if (loading && !contribution) {
    return <p className='py-10 text-center text-[13px] text-[#5d6b64]'>Loading contribution…</p>
  }
  if (loadError || !contribution) {
    return <Alert tone='danger' title='Contribution unavailable'>{loadError || 'Not found.'}</Alert>
  }

  const revision = contribution.currentRevision
  const editable = contribution.status === 'draft' || contribution.status === 'changesRequested'
  const neverSubmitted = contribution.status === 'draft' && contribution.history.length === 0
  const guidance = statusGuidance(contribution)
  const apply = async (action: () => Promise<ContributionDetails>) => {
    const result = await run(action)
    if (result) setData(result)
    return Boolean(result)
  }

  const deleteDraft = async () => {
    const deleted = await run(() => contributionApi.deleteDraft(contribution.id))
    if (deleted !== null) navigate('/contributions', { replace: true })
  }

  return (
    <>
      <Link
        to='/contributions'
        className='mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#184b38] hover:underline'
      >
        <ArrowLeft className='size-4' aria-hidden='true' /> My contributions
      </Link>
      <PageHeading
        title={revision.title || 'Untitled draft'}
        meta={
          <>
            <ContributionStatusBadge status={contribution.status} />
            <CategoryTag category={revision.category} />
            <span className='text-[12px] text-[#8a958f]'>
              Revision {contribution.currentRevisionNumber}
              {contribution.submittedAtUtc ? ` · submitted ${formatDateTime(contribution.submittedAtUtc)}` : ''}
            </span>
          </>
        }
        actions={
          <>
            {neverSubmitted ? (
              <Button variant='danger' icon={Trash2} disabled={busy} onClick={() => setConfirmDelete(true)}>
                Delete draft
              </Button>
            ) : null}
            {editable ? (
              <Button icon={Pencil} onClick={() => navigate(`/contributions/${contribution.id}/edit`)}>
                {contribution.status === 'changesRequested' ? 'Revise & resubmit' : 'Continue editing'}
              </Button>
            ) : null}
          </>
        }
      />

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
      <Alert tone={guidance.tone} title={guidance.title} className='mb-6'>
        {guidance.text}
      </Alert>

      <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]'>
        <div className='min-w-0 space-y-5'>
          {contribution.reviews[0] && contribution.status !== 'submitted' ? (
            <ReviewResultCard review={contribution.reviews[0]} />
          ) : null}
          <ContributionOverview contribution={contribution} />
          <section className={`${card} p-5`}>
            <h2 className={`${sectionTitle} mb-4`}>Evidence ({revision.evidence.length})</h2>
            <EvidenceList evidence={revision.evidence} />
          </section>
          <AttributionPanel
            contribution={contribution}
            viewerId={session?.userId ?? ''}
            canAnswerDisputes={contribution.status === 'submitted'}
            busy={busy}
            onUpdate={(collaborator, input) =>
              apply(() => contributionApi.updateCollaborator(contribution.id, collaborator.id, input))
            }
            onRemove={(collaborator) =>
              void apply(() => contributionApi.removeCollaborator(contribution.id, collaborator.id))
            }
          />
          {contribution.reviews.slice(contribution.status !== 'submitted' ? 1 : 0).length ? (
            <section className='space-y-3'>
              <h2 className={sectionTitle}>Earlier reviews</h2>
              {contribution.reviews.slice(contribution.status !== 'submitted' ? 1 : 0).map((review) => (
                <ReviewResultCard key={review.id} review={review} compact />
              ))}
            </section>
          ) : null}
        </div>
        <aside className='space-y-5'>
          {editable ? (
            <div className={`${card} p-5`}>
              <SubmissionChecklist checks={contribution.submissionChecks} />
            </div>
          ) : null}
          <ContributionTimeline contribution={contribution} />
        </aside>
      </div>

      {confirmDelete ? (
        <Modal
          title='Delete this draft?'
          description='The draft and its uploaded files are removed permanently.'
          onClose={() => setConfirmDelete(false)}
          footer={
            <>
              <Button variant='secondary' onClick={() => setConfirmDelete(false)}>
                Keep draft
              </Button>
              <Button variant='danger' icon={Trash2} loading={busy} onClick={() => void deleteDraft()}>
                Delete draft
              </Button>
            </>
          }
        >
          <p className='text-[14px] text-[#2b3833]'>“{revision.title || 'Untitled draft'}” will be deleted.</p>
        </Modal>
      ) : null}
    </>
  )
}
