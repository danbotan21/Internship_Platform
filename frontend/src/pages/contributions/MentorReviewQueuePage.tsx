import { CircleCheckBig, CircleX, Hourglass, Inbox, MessageSquareWarning, Search } from 'lucide-react'
import { useState } from 'react'
import { contributionApi } from '../../api/contributions'
import { useAuth } from '../../hooks/authContext'
import ContributionListCard from '../../components/contributions/ContributionListCard'
import Alert from '../../components/ui/Alert'
import EmptyState from '../../components/ui/EmptyState'
import PageHeading from '../../components/ui/PageHeading'
import StatCard from '../../components/ui/StatCard'
import Tabs from '../../components/ui/Tabs'
import { filterControl } from '../../components/ui/styles'
import type { ContributionStatus } from '../../types/contribution'
import { useLoadedData } from './contributionHooks'

type QueueTab = Exclude<ContributionStatus, 'draft'>

const emptyTexts: Record<QueueTab, string> = {
  submitted: 'Nothing is waiting for your review.',
  changesRequested: 'No contribution is waiting for student changes.',
  validated: 'No validated contributions yet.',
  rejected: 'No rejected contributions.',
}

export default function MentorReviewQueuePage() {
  const { session } = useAuth()
  const { data, error, loading } = useLoadedData(() => contributionApi.listForMentor(), 'mentor')
  const [tab, setTab] = useState<QueueTab>('submitted')
  const [search, setSearch] = useState('')

  const items = data ?? []
  const count = (status: QueueTab) => items.filter((item) => item.status === status).length
  const term = search.trim().toLowerCase()
  const visible = items.filter(
    (item) =>
      item.status === tab &&
      (item.title.toLowerCase().includes(term) || item.student.fullName.toLowerCase().includes(term)),
  )

  return (
    <>
      <PageHeading
        eyebrow='Contribution management · Mentor'
        title='Review queue'
        description={`Contributions of the students you mentor, ${session?.fullName ?? ''}. Oldest submissions first.`}
      />
      {error ? <Alert tone='danger' className='mb-5'>{error}</Alert> : null}

      <div className='mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          title='Awaiting review'
          count={count('submitted')}
          caption='your action'
          icon={Hourglass}
          highlight={count('submitted') > 0}
        />
        <StatCard title='Changes requested' count={count('changesRequested')} caption='with students' icon={MessageSquareWarning} />
        <StatCard title='Validated' count={count('validated')} caption='accepted' icon={CircleCheckBig} />
        <StatCard title='Rejected' count={count('rejected')} caption='closed' icon={CircleX} />
      </div>

      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <Tabs<QueueTab>
          label='Review status'
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'submitted', label: 'Awaiting review', count: count('submitted') },
            { value: 'changesRequested', label: 'Changes requested', count: count('changesRequested') },
            { value: 'validated', label: 'Validated', count: count('validated') },
            { value: 'rejected', label: 'Rejected', count: count('rejected') },
          ]}
        />
        <label className='relative'>
          <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a958f]' aria-hidden='true' />
          <input
            className={`${filterControl} w-64 pl-9`}
            placeholder='Search title or student…'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label='Search the review queue'
          />
        </label>
      </div>

      {loading ? (
        <p className='py-10 text-center text-[13px] text-[#5d6b64]'>Loading contributions…</p>
      ) : visible.length ? (
        <div className='space-y-3'>
          {visible.map((item) => (
            <ContributionListCard key={item.id} item={item} to={`/contributions/${item.id}`} showStudent showWarnings />
          ))}
        </div>
      ) : (
        <EmptyState icon={Inbox} title={term ? 'Nothing matches this search' : emptyTexts[tab]} />
      )}
    </>
  )
}
