import {
  ArrowRight,
  CircleCheckBig,
  FilePen,
  FolderGit2,
  Hourglass,
  MessageSquareWarning,
  Plus,
  Search,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { contributionApi } from '../../api/contributions'
import ContributionListCard from '../../components/contributions/ContributionListCard'
import { categories, categoryMeta, statusMeta } from '../../components/contributions/contributionLabels'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import PageHeading from '../../components/ui/PageHeading'
import StatCard from '../../components/ui/StatCard'
import Tabs from '../../components/ui/Tabs'
import { filterControl } from '../../components/ui/styles'
import type { ContributionListItem, ContributionStatus } from '../../types/contribution'
import { useLoadedData } from './contributionHooks'

type ListTab = 'mine' | 'shared'

type AttentionItem = { key: string; text: string; to: string; tone: 'warning' | 'danger' | 'info' }

function attentionItems(mine: ContributionListItem[], shared: ContributionListItem[]): AttentionItem[] {
  return [
    ...mine
      .filter((item) => item.status === 'changesRequested')
      .map((item) => ({
        key: `changes-${item.id}`,
        text: `Your mentor requested changes on “${item.title}”.`,
        to: `/contributions/${item.id}`,
        tone: 'warning' as const,
      })),
    ...mine
      .filter((item) => item.disputedCollaboratorCount > 0)
      .map((item) => ({
        key: `dispute-${item.id}`,
        text: `A collaborator disputes their role on “${item.title}”.`,
        to: `/contributions/${item.id}`,
        tone: 'danger' as const,
      })),
    ...shared
      .filter((item) => item.myCollaboratorStatus === 'pending' && item.status !== 'validated' && item.status !== 'rejected')
      .map((item) => ({
        key: `confirm-${item.id}`,
        text: `${item.student.fullName} credited you on “${item.title}”. Confirm or dispute it.`,
        to: `/contributions/shared/${item.id}`,
        tone: 'info' as const,
      })),
  ]
}

export default function StudentContributionsPage() {
  const navigate = useNavigate()
  const { data, error, loading } = useLoadedData(
    () => Promise.all([contributionApi.listMine(), contributionApi.listAttributed()]),
    'mine',
  )
  const [tab, setTab] = useState<ListTab>('mine')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ContributionStatus | 'all'>('all')
  const [category, setCategory] = useState('all')

  const [mine, shared] = data ?? [[], []]
  const attention = useMemo(() => attentionItems(mine, shared), [mine, shared])
  const source = tab === 'mine' ? mine : shared
  const filtered = source.filter(
    (item) =>
      item.title.toLowerCase().includes(search.trim().toLowerCase()) &&
      (status === 'all' || item.status === status) &&
      (category === 'all' || item.category === category),
  )
  const count = (value: ContributionStatus) => mine.filter((item) => item.status === value).length

  return (
    <>
      <PageHeading
        eyebrow='Contribution management'
        title='My contributions'
        description='Record the work you delivered, prove it with verifiable evidence and track the mentor review.'
        actions={
          <Button icon={Plus} onClick={() => navigate('/contributions/new')}>
            New contribution
          </Button>
        }
      />

      {error ? <Alert tone='danger' className='mb-5'>{error}</Alert> : null}

      <div className='mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard title='Drafts' count={count('draft')} caption='not submitted' icon={FilePen} />
        <StatCard title='In review' count={count('submitted')} caption='waiting for mentor' icon={Hourglass} />
        <StatCard
          title='Changes requested'
          count={count('changesRequested')}
          caption='your action'
          icon={MessageSquareWarning}
          highlight={count('changesRequested') > 0}
        />
        <StatCard title='Validated' count={count('validated')} caption='accepted work' icon={CircleCheckBig} />
      </div>

      {attention.length ? (
        <section className='mb-6'>
          <h2 className='mb-3 text-[15px] font-semibold text-[#14211b]'>Needs your attention</h2>
          <div className='space-y-2'>
            {attention.map((item) => (
              <Alert
                key={item.key}
                tone={item.tone}
                action={
                  <Link
                    to={item.to}
                    className='inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold hover:underline'
                  >
                    Open <ArrowRight className='size-3.5' aria-hidden='true' />
                  </Link>
                }
              >
                {item.text}
              </Alert>
            ))}
          </div>
        </section>
      ) : null}

      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <Tabs<ListTab>
          label='Contribution lists'
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'mine', label: 'My contributions', count: mine.length },
            { value: 'shared', label: 'Credited to me', count: shared.length },
          ]}
        />
        <div className='flex flex-wrap gap-2'>
          <label className='relative'>
            <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a958f]' aria-hidden='true' />
            <input
              className={`${filterControl} w-56 pl-9`}
              placeholder='Search by title…'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label='Search contributions'
            />
          </label>
          <select
            className={filterControl}
            value={status}
            onChange={(event) => setStatus(event.target.value as ContributionStatus | 'all')}
            aria-label='Filter by status'
          >
            <option value='all'>All statuses</option>
            {Object.entries(statusMeta).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </select>
          <select
            className={filterControl}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label='Filter by category'
          >
            <option value='all'>All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {categoryMeta[value].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className='py-10 text-center text-[13px] text-[#5d6b64]'>Loading contributions…</p>
      ) : filtered.length ? (
        <div className='space-y-3'>
          {filtered.map((item) => (
            <ContributionListCard
              key={item.id}
              item={item}
              to={tab === 'mine' ? `/contributions/${item.id}` : `/contributions/shared/${item.id}`}
              showStudent={tab === 'shared'}
            />
          ))}
        </div>
      ) : source.length ? (
        <EmptyState icon={Search} title='Nothing matches these filters' />
      ) : tab === 'mine' ? (
        <EmptyState
          icon={FolderGit2}
          title='No contributions yet'
          description='Record your first piece of work — link the commits or pull requests that prove it.'
          action={
            <Button icon={Plus} onClick={() => navigate('/contributions/new')}>
              New contribution
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={FolderGit2}
          title='Nobody credited you yet'
          description='When a teammate lists you as a collaborator, you will confirm or dispute it here.'
        />
      )}
    </>
  )
}
