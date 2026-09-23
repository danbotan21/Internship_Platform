import { ArrowRight, CalendarClock, CircleCheckBig, ClipboardList, Hourglass, ListChecks } from 'lucide-react'
import { Link } from 'react-router-dom'
import { evaluationApi } from '../../api/evaluations'
import EvaluationListCard from '../../components/evaluations/EvaluationListCard'
import ScoreTrend from '../../components/evaluations/ScoreTrend'
import { typeMeta } from '../../components/evaluations/evaluationLabels'
import Alert from '../../components/ui/Alert'
import EmptyState from '../../components/ui/EmptyState'
import PageHeading from '../../components/ui/PageHeading'
import PageLoader from '../../components/ui/PageLoader'
import StatCard from '../../components/ui/StatCard'
import { card, sectionTitle } from '../../components/ui/styles'
import { useLoadedData } from '../usePageData'

export default function StudentEvaluationsPage() {
  const { data, error, loading } = useLoadedData(
    () => Promise.all([evaluationApi.listMine(), evaluationApi.myCriteria()]),
    'my-evaluations',
  )
  const [evaluations, criteria] = data ?? [[], null]
  const toAcknowledge = evaluations.filter((item) => item.status === 'finalized' && !item.acknowledgedAtUtc)
  const upcoming = evaluations.filter((item) => item.isUpcoming && item.status !== 'finalized').length
  const inProgress = evaluations.filter((item) => !item.isUpcoming && item.status !== 'finalized').length
  const finalized = evaluations.filter((item) => item.status === 'finalized').length

  return (
    <>
      <PageHeading
        eyebrow='Evaluation'
        title='My evaluations'
        description='Your mentor evaluates your internship performance per period. Scores and feedback become visible once an evaluation is finalized.'
      />
      {error ? <Alert tone='danger' className='mb-5'>{error}</Alert> : null}

      {toAcknowledge.map((item) => (
        <Alert
          key={item.id}
          tone='info'
          className='mb-3'
          title={`Your ${typeMeta[item.type].label.toLowerCase()} result is available`}
          action={
            <Link to={`/evaluation/${item.id}`} className='inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold hover:underline'>
              Read it <ArrowRight className='size-3.5' aria-hidden='true' />
            </Link>
          }
        >
          Read the feedback and confirm that you have seen it.
        </Alert>
      ))}

      <div className='mb-6 mt-2 grid gap-3 sm:grid-cols-3'>
        <StatCard title='Upcoming' count={upcoming} caption='criteria visible now' icon={CalendarClock} />
        <StatCard title='In progress' count={inProgress} caption='mentor is working' icon={Hourglass} />
        <StatCard title='Finalized' count={finalized} caption='results available' icon={CircleCheckBig} />
      </div>

      <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]'>
        <div className='min-w-0'>
          <h2 className={`${sectionTitle} mb-3`}>Evaluations</h2>
          {loading ? (
            <PageLoader label='Loading evaluations…' />
          ) : evaluations.length ? (
            <div className='space-y-3'>
              {evaluations.map((item) => (
                <EvaluationListCard key={item.id} item={item} to={`/evaluation/${item.id}`} studentView />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ClipboardList}
              title='No evaluations yet'
              description='Your mentor creates an initial, a mid-term and a final evaluation during the internship.'
            />
          )}
        </div>
        <aside className='space-y-5'>
          <Link to='/evaluation/criteria' className={`${card} group block p-5 transition hover:border-[#b9cfc3]`}>
            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-lg bg-[#e8f2ed] text-[#184b38]'>
                <ListChecks className='size-5' aria-hidden='true' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-[14px] font-semibold text-[#14211b] group-hover:text-[#184b38]'>What you are evaluated on</p>
                <p className='text-[12px] text-[#5d6b64]'>
                  {criteria?.criteria.length
                    ? `${criteria.criteria.length} criteria · rubric v${criteria.rubricVersionNumber}`
                    : 'Your mentor has not published criteria yet'}
                </p>
              </div>
              <ArrowRight className='size-4 text-[#b3bdb8] group-hover:text-[#184b38]' aria-hidden='true' />
            </div>
          </Link>
          {finalized ? <ScoreTrend evaluations={evaluations} /> : null}
        </aside>
      </div>
    </>
  )
}
