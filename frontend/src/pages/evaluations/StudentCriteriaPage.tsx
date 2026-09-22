import { ListChecks } from 'lucide-react'
import { evaluationApi } from '../../api/evaluations'
import WeightMeter from '../../components/evaluations/WeightMeter'
import Alert from '../../components/ui/Alert'
import BackLink from '../../components/ui/BackLink'
import EmptyState from '../../components/ui/EmptyState'
import PageHeading from '../../components/ui/PageHeading'
import PageLoader from '../../components/ui/PageLoader'
import { formatDateTime } from '../../components/ui/formatDateTime'
import { card } from '../../components/ui/styles'
import { useLoadedData } from '../usePageData'

export default function StudentCriteriaPage() {
  const { data, error, loading } = useLoadedData(() => evaluationApi.myCriteria(), 'my-criteria')

  return (
    <>
      <BackLink to='/evaluation'>My evaluations</BackLink>
      <PageHeading
        eyebrow='Evaluation'
        title='What you are evaluated on'
        description={
          data?.rubricVersionNumber
            ? `${data.rubricTitle} v${data.rubricVersionNumber}, published by ${data.mentorName ?? 'your mentor'} ${formatDateTime(data.publishedAtUtc)}.`
            : 'The criteria your mentor scores in every evaluation.'
        }
      />
      {error ? <Alert tone='danger' className='mb-5'>{error}</Alert> : null}
      {loading ? (
        <PageLoader label='Loading criteria…' />
      ) : data?.criteria.length ? (
        <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]'>
          <ol className='space-y-3'>
            {data.criteria.map((criterion) => (
              <li key={criterion.id} className={`${card} p-5`}>
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div className='min-w-0 flex-1'>
                    <p className='text-[15px] font-semibold text-[#14211b]'>{criterion.name}</p>
                    <p className='mt-1 text-[13px] text-[#2b3833]'>{criterion.description}</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-[18px] font-bold tabular-nums'>{criterion.weight}%</p>
                    <p className='text-[11px] text-[#8a958f]'>rated 1–{criterion.scaleMax}</p>
                  </div>
                </div>
                <p className='mt-3 rounded-lg bg-[#f7f9f8] px-3 py-2 text-[13px] text-[#2b3833]'>
                  <span className='font-semibold'>What good performance looks like: </span>
                  {criterion.guidance}
                </p>
              </li>
            ))}
          </ol>
          <aside className='space-y-4'>
            <div className={`${card} p-5`}>
              <WeightMeter criteria={data.criteria} />
            </div>
            <div className='rounded-xl bg-[#eef3f0] p-4 text-[13px] text-[#2b3833]'>
              <p className='font-semibold'>How your result is created</p>
              <p className='mt-1'>
                Your mentor rates each criterion for the evaluation period and explains every rating. Each rating is
                weighted to a 100-point result. You see scores and feedback only after the evaluation is finalized.
              </p>
            </div>
          </aside>
        </div>
      ) : (
        <EmptyState
          icon={ListChecks}
          title='No published criteria yet'
          description='Your mentor has not published the evaluation rubric. Check back later.'
        />
      )}
    </>
  )
}
