import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { contributionApi } from '../../api/contributions'
import CategoryTag from '../../components/contributions/CategoryTag'
import ContributionOverview from '../../components/contributions/ContributionOverview'
import ContributionStatusBadge from '../../components/contributions/ContributionStatusBadge'
import ContributionTimeline from '../../components/contributions/ContributionTimeline'
import RevisionComparisonCard from '../../components/contributions/RevisionComparisonCard'
import AttributionPanel from '../../components/contributions/attribution/AttributionPanel'
import EvidenceList from '../../components/contributions/evidence/EvidenceList'
import ReviewForm from '../../components/contributions/review/ReviewForm'
import ReviewResultCard from '../../components/contributions/review/ReviewResultCard'
import Alert from '../../components/ui/Alert'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import PageHeading from '../../components/ui/PageHeading'
import { formatDateTime } from '../../components/ui/formatDateTime'
import { card, sectionTitle } from '../../components/ui/styles'
import type { GitHubLiveStatus, ReviewInput } from '../../types/contribution'
import { useAction, useLoadedData } from './contributionHooks'

export default function MentorReviewPage() {
  const { id = '' } = useParams()
  const { data: contribution, setData, error: loadError, loading } = useLoadedData(
    () => contributionApi.getForMentor(id),
    id,
  )
  const { busy, error, setError, run } = useAction()
  const [live, setLive] = useState<GitHubLiveStatus[]>([])
  const [liveLoading, setLiveLoading] = useState(false)
  const [flash, setFlash] = useState('')

  const loadLive = async () => {
    setLiveLoading(true)
    try {
      setLive(await contributionApi.gitHubStatus(id))
    } catch {
      setLive([])
    } finally {
      setLiveLoading(false)
    }
  }

  const hasGitHub = Boolean(contribution?.currentRevision.evidence.some((item) => item.gitHub))
  useEffect(() => {
    if (!hasGitHub) return
    let active = true
    contributionApi
      .gitHubStatus(id)
      .then((statuses) => {
        if (active) setLive(statuses)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [id, hasGitHub])

  if (loading && !contribution) {
    return <p className='py-10 text-center text-[13px] text-[#5d6b64]'>Loading contribution…</p>
  }
  if (loadError || !contribution) {
    return <Alert tone='danger' title='Contribution unavailable'>{loadError || 'Not found.'}</Alert>
  }

  const revision = contribution.currentRevision
  const awaitingReview = contribution.status === 'submitted'
  const disputed = contribution.collaborators.filter((item) => item.status === 'disputed')
  const pending = contribution.collaborators.filter((item) => item.status === 'pending')
  const warnings = revision.evidence.flatMap((item) =>
    item.signals.filter((signal) => signal.status === 'warning' || signal.status === 'failed'),
  )

  const submitReview = async (input: ReviewInput) => {
    const result = await run(() => contributionApi.review(contribution.id, input))
    if (result) {
      setData(result)
      setFlash('Review saved. The student has been updated.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      <Link
        to='/contributions'
        className='mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#184b38] hover:underline'
      >
        <ArrowLeft className='size-4' aria-hidden='true' /> Review queue
      </Link>
      <PageHeading
        title={revision.title}
        meta={
          <>
            <ContributionStatusBadge status={contribution.status} />
            <CategoryTag category={revision.category} />
            <span className='inline-flex items-center gap-2 text-[13px] text-[#3d4a44]'>
              <Avatar name={contribution.student.fullName} size='sm' />
              {contribution.student.fullName}
            </span>
            <span className='text-[12px] text-[#8a958f]'>
              Revision {contribution.currentRevisionNumber} · submitted {formatDateTime(contribution.submittedAtUtc)}
            </span>
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
      {awaitingReview && disputed.length ? (
        <Alert tone='danger' className='mb-4' title='Attribution is disputed'>
          {disputed.map((item) => item.name).join(', ')} dispute{disputed.length === 1 ? 's' : ''} their role.
          Validation is blocked until the author answers.
        </Alert>
      ) : null}
      {awaitingReview && (warnings.length || pending.length) ? (
        <Alert tone='warning' className='mb-4' title='Look closer before deciding'>
          {warnings.length ? `${warnings.length} automatic check(s) need attention. ` : ''}
          {pending.length ? `${pending.length} collaborator(s) have not confirmed yet.` : ''}
        </Alert>
      ) : null}

      <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]'>
        <div className='min-w-0 space-y-5'>
          {contribution.comparison ? (
            <RevisionComparisonCard
              comparison={contribution.comparison}
              currentRevision={contribution.currentRevisionNumber}
            />
          ) : null}
          {awaitingReview && contribution.reviews[0]?.feedbackItems.length ? (
            <ReviewResultCard review={contribution.reviews[0]} compact />
          ) : null}
          <ContributionOverview contribution={contribution} />
          <section className={`${card} p-5`}>
            <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
              <h2 className={sectionTitle}>Evidence ({revision.evidence.length})</h2>
              {hasGitHub ? (
                <Button variant='ghost' size='sm' icon={RefreshCw} loading={liveLoading} onClick={() => void loadLive()}>
                  Refresh live GitHub status
                </Button>
              ) : null}
            </div>
            <EvidenceList evidence={revision.evidence} live={live} />
          </section>
          <AttributionPanel contribution={contribution} />
        </div>

        <aside className='space-y-5 lg:sticky lg:top-4 lg:self-start'>
          {awaitingReview ? (
            <ReviewForm contribution={contribution} submitting={busy} onSubmit={(input) => void submitReview(input)} />
          ) : contribution.reviews[0] ? (
            <ReviewResultCard review={contribution.reviews[0]} />
          ) : null}
          {!awaitingReview && contribution.status === 'changesRequested' ? (
            <p className='text-[13px] text-[#5d6b64]'>
              Waiting for the student to revise. {contribution.changeRequestsLimit - contribution.changeRequestsUsed}{' '}
              change request(s) left.
            </p>
          ) : null}
          <ContributionTimeline contribution={contribution} />
        </aside>
      </div>
    </>
  )
}
