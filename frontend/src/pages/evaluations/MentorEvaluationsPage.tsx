import {
  CalendarClock,
  CircleCheckBig,
  ClipboardList,
  FilePen,
  ListChecks,
  Plus,
  Search,
  SendHorizontal,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { evaluationApi } from '../../api/evaluations'
import EvaluationListCard from '../../components/evaluations/EvaluationListCard'
import EvaluationStatusBadge from '../../components/evaluations/EvaluationStatusBadge'
import { evaluationTypes, formatScore, typeMeta } from '../../components/evaluations/evaluationLabels'
import Alert from '../../components/ui/Alert'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import PageHeading from '../../components/ui/PageHeading'
import PageLoader from '../../components/ui/PageLoader'
import StatCard from '../../components/ui/StatCard'
import Tabs from '../../components/ui/Tabs'
import { card, filterControl, sectionTitle } from '../../components/ui/styles'
import type { EvaluationType } from '../../types/evaluation'
import { useLoadedData } from '../usePageData'

type ListTab = 'active' | 'finalized' | 'all'

export default function MentorEvaluationsPage() {
  const navigate = useNavigate()
  const { data, error, loading } = useLoadedData(
    () => Promise.all([evaluationApi.listForMentor(), evaluationApi.mentorStudents(), evaluationApi.getRubric()]),
    'mentor-evaluations',
  )
  const [tab, setTab] = useState<ListTab>('active')
  const [search, setSearch] = useState('')
  const [type, setType] = useState<EvaluationType | 'all'>('all')

  const [evaluations, students, rubric] = data ?? [[], [], null]
  const hasRubric = Boolean(rubric?.published)
  const term = search.trim().toLowerCase()
  const visible = evaluations.filter(
    (item) =>
      (tab === 'all' || (tab === 'finalized' ? item.status === 'finalized' : item.status !== 'finalized')) &&
      (type === 'all' || item.type === type) &&
      item.student.fullName.toLowerCase().includes(term),
  )
  const count = (predicate: (item: (typeof evaluations)[number]) => boolean) => evaluations.filter(predicate).length

  return (
    <>
      <PageHeading
        eyebrow='Evaluation · Mentor'
        title='Evaluations'
        description='Period-based evaluations of the students assigned to you: score each rubric criterion, give structured feedback and finalize.'
        actions={
          <>
            <Button variant='secondary' icon={ListChecks} onClick={() => navigate('/evaluation/rubric')}>
              Rubric & criteria
            </Button>
            <Button icon={Plus} disabled={!hasRubric} onClick={() => navigate('/evaluation/new')}>
              New evaluation
            </Button>
          </>
        }
      />

      {error ? <Alert tone='danger' className='mb-5'>{error}</Alert> : null}
      {!loading && !hasRubric ? (
        <Alert
          tone='warning'
          className='mb-5'
          title='Publish your evaluation rubric first'
          action={
            <Link to='/evaluation/rubric' className='shrink-0 text-[13px] font-semibold hover:underline'>
              Set up rubric
            </Link>
          }
        >
          Evaluations are scored against a published rubric. Students also see its criteria before being evaluated.
        </Alert>
      ) : null}

      <div className='mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard title='In draft' count={count((item) => item.status === 'draft')} caption='need scoring' icon={FilePen} />
        <StatCard
          title='Ready to finalize'
          count={count((item) => item.status === 'readyForReview')}
          caption='your action'
          icon={SendHorizontal}
          highlight={count((item) => item.status === 'readyForReview') > 0}
        />
        <StatCard
          title='Due soon / overdue'
          count={count((item) => item.isDueSoon || item.isOverdue)}
          caption='period ending'
          icon={CalendarClock}
        />
        <StatCard title='Finalized' count={count((item) => item.status === 'finalized')} caption='visible to students' icon={CircleCheckBig} />
      </div>

      <section className='mb-8'>
        <h2 className={`${sectionTitle} mb-3`}>Your students</h2>
        {students.length ? (
          <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
            {students.map((overview) => (
              <div key={overview.student.userId} className={`${card} p-4`}>
                <Link
                  to={`/evaluation/students/${overview.student.userId}`}
                  className='flex items-center gap-3 hover:text-[#184b38]'
                >
                  <Avatar name={overview.student.fullName} />
                  <div className='min-w-0'>
                    <p className='truncate text-[14px] font-semibold'>{overview.student.fullName}</p>
                    <p className='text-[12px] text-[#8a958f]'>
                      {overview.validatedContributionCount} validated contribution
                      {overview.validatedContributionCount === 1 ? '' : 's'}
                      {overview.latestFinalScore !== null && overview.latestFinalScore !== undefined
                        ? ` · last score ${formatScore(overview.latestFinalScore)}`
                        : ''}
                    </p>
                  </div>
                </Link>
                <ul className='mt-3 space-y-1.5'>
                  {evaluationTypes.map((evaluationType) => {
                    const evaluation = overview.evaluations.find((item) => item.type === evaluationType)
                    return (
                      <li key={evaluationType} className='flex items-center justify-between gap-2 rounded-lg bg-[#f7f9f8] px-3 py-2'>
                        <span className='text-[12px] font-medium text-[#3d4a44]'>{typeMeta[evaluationType].short}</span>
                        {evaluation ? (
                          <Link to={`/evaluation/${evaluation.id}`} className='flex items-center gap-2'>
                            {evaluation.status === 'finalized' ? (
                              <span className='text-[13px] font-bold tabular-nums'>{formatScore(evaluation.finalScore)}</span>
                            ) : null}
                            <EvaluationStatusBadge status={evaluation.status} upcoming={evaluation.isUpcoming} />
                          </Link>
                        ) : hasRubric ? (
                          <Link
                            to={`/evaluation/new?studentId=${overview.student.userId}&type=${evaluationType}`}
                            className='inline-flex items-center gap-1 text-[12px] font-semibold text-[#184b38] hover:underline'
                          >
                            <Plus className='size-3.5' aria-hidden='true' /> Create
                          </Link>
                        ) : (
                          <span className='text-[12px] text-[#8a958f]'>Not created</span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        ) : loading ? null : (
          <EmptyState icon={ClipboardList} title='No students assigned to you yet' />
        )}
      </section>

      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <Tabs<ListTab>
          label='Evaluation status'
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'active', label: 'In progress', count: count((item) => item.status !== 'finalized') },
            { value: 'finalized', label: 'Finalized', count: count((item) => item.status === 'finalized') },
            { value: 'all', label: 'All', count: evaluations.length },
          ]}
        />
        <div className='flex flex-wrap gap-2'>
          <label className='relative'>
            <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a958f]' aria-hidden='true' />
            <input
              className={`${filterControl} w-56 pl-9`}
              placeholder='Search student…'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label='Search by student'
            />
          </label>
          <select
            className={filterControl}
            value={type}
            onChange={(event) => setType(event.target.value as EvaluationType | 'all')}
            aria-label='Filter by type'
          >
            <option value='all'>All types</option>
            {evaluationTypes.map((value) => (
              <option key={value} value={value}>
                {typeMeta[value].short}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <PageLoader label='Loading evaluations…' />
      ) : visible.length ? (
        <div className='space-y-3'>
          {visible.map((item) => (
            <EvaluationListCard key={item.id} item={item} to={`/evaluation/${item.id}`} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title={evaluations.length ? 'Nothing matches these filters' : 'No evaluations yet'}
          description={
            evaluations.length
              ? undefined
              : 'Create an evaluation for a student and period. It uses your current published rubric.'
          }
        />
      )}
    </>
  )
}
