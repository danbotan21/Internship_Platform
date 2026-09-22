import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { contributionApi } from '../../api/contributions'
import { useAuth } from '../../hooks/authContext'
import CategoryTag from '../../components/contributions/CategoryTag'
import ContributionOverview from '../../components/contributions/ContributionOverview'
import ContributionStatusBadge from '../../components/contributions/ContributionStatusBadge'
import ContributionTimeline from '../../components/contributions/ContributionTimeline'
import AttributionPanel from '../../components/contributions/attribution/AttributionPanel'
import ParticipationPanel from '../../components/contributions/attribution/ParticipationPanel'
import EvidenceList from '../../components/contributions/evidence/EvidenceList'
import Alert from '../../components/ui/Alert'
import PageHeading from '../../components/ui/PageHeading'
import { card, sectionTitle } from '../../components/ui/styles'
import type { ContributionDetails } from '../../types/contribution'
import { useAction, useLoadedData } from './contributionHooks'

// A teammate's contribution where the current student is credited.
export default function AttributedContributionPage() {
  const { id = '' } = useParams()
  const { session } = useAuth()
  const { data: contribution, setData, error: loadError, loading } = useLoadedData(
    () => contributionApi.getAttributed(id),
    id,
  )
  const { busy, error, setError, run } = useAction()

  if (loading && !contribution) {
    return <p className='py-10 text-center text-[13px] text-[#5d6b64]'>Loading contribution…</p>
  }
  if (loadError || !contribution) {
    return <Alert tone='danger' title='Contribution unavailable'>{loadError || 'Not found.'}</Alert>
  }

  const mine = contribution.collaborators.find((item) => item.userId === (session?.userId ?? ''))
  const apply = async (action: () => Promise<ContributionDetails>) => {
    const result = await run(action)
    if (result) setData(result)
    return Boolean(result)
  }

  return (
    <>
      <Link
        to='/contributions'
        className='mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#184b38] hover:underline'
      >
        <ArrowLeft className='size-4' aria-hidden='true' /> Back
      </Link>
      <PageHeading
        eyebrow={`Credited by ${contribution.student.fullName}`}
        title={contribution.currentRevision.title}
        meta={
          <>
            <ContributionStatusBadge status={contribution.status} />
            <CategoryTag category={contribution.currentRevision.category} />
          </>
        }
      />
      {error ? (
        <Alert tone='danger' className='mb-4' onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]'>
        <div className='min-w-0 space-y-5'>
          {mine ? (
            <ParticipationPanel
              collaborator={mine}
              authorName={contribution.student.fullName}
              revisionNumber={contribution.currentRevisionNumber}
              status={contribution.status}
              busy={busy}
              onConfirm={() => void apply(() => contributionApi.confirmParticipation(contribution.id))}
              onDispute={(reason) => apply(() => contributionApi.disputeParticipation(contribution.id, reason))}
            />
          ) : null}
          <ContributionOverview contribution={contribution} />
          <section className={`${card} p-5`}>
            <h2 className={`${sectionTitle} mb-4`}>Evidence</h2>
            <EvidenceList evidence={contribution.currentRevision.evidence} />
          </section>
          <AttributionPanel contribution={contribution} viewerId={session?.userId ?? ''} />
        </div>
        <aside>
          <ContributionTimeline contribution={contribution} />
        </aside>
      </div>
    </>
  )
}
