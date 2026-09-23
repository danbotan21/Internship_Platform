import { History } from 'lucide-react'
import { useState } from 'react'
import { evaluationApi } from '../../api/evaluations'
import RubricCriteriaList from '../../components/evaluations/RubricCriteriaList'
import WeightMeter from '../../components/evaluations/WeightMeter'
import { rubricStatusMeta } from '../../components/evaluations/evaluationLabels'
import Alert from '../../components/ui/Alert'
import BackLink from '../../components/ui/BackLink'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import PageHeading from '../../components/ui/PageHeading'
import PageLoader from '../../components/ui/PageLoader'
import { formatDateTime } from '../../components/ui/formatDateTime'
import { card } from '../../components/ui/styles'
import type { RubricVersion } from '../../types/evaluation'
import { useLoadedData } from '../usePageData'

export default function RubricHistoryPage() {
  const { data, error, loading } = useLoadedData(() => evaluationApi.rubricHistory(), 'rubric-history')
  const [viewing, setViewing] = useState<RubricVersion | null>(null)
  const [viewError, setViewError] = useState('')

  const open = async (id: string) => {
    setViewError('')
    try {
      setViewing(await evaluationApi.rubricVersion(id))
    } catch (reason) {
      setViewError(reason instanceof Error ? reason.message : 'Version unavailable.')
    }
  }

  return (
    <>
      <BackLink to='/evaluation/rubric'>Rubric</BackLink>
      <PageHeading
        eyebrow='Evaluation · Rubric'
        title='Rubric version history'
        description='Every evaluation stores the rubric version it was created with. Publishing a new version never recalculates earlier evaluations.'
      />
      {error || viewError ? <Alert tone='danger' className='mb-5'>{error || viewError}</Alert> : null}
      {loading ? (
        <PageLoader label='Loading history…' />
      ) : data?.length ? (
        <div className={`${card} overflow-x-auto`}>
          <table className='w-full min-w-[720px] text-left text-[13px]'>
            <thead className='border-b border-[#eef1ef] text-[11px] uppercase tracking-wider text-[#8a958f]'>
              <tr>
                {['Version', 'Status', 'Published', 'Criteria', 'Used by', 'Changes', ''].map((header) => (
                  <th key={header} className='px-5 py-3 font-semibold'>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-[#eef1ef]'>
              {data.map((version) => (
                <tr key={version.id}>
                  <td className='px-5 py-3 font-semibold'>
                    v{version.versionNumber}
                    <span className='block text-[12px] font-normal text-[#8a958f]'>{version.title}</span>
                  </td>
                  <td className='px-5 py-3'>
                    <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${rubricStatusMeta[version.status].tone}`}>
                      {rubricStatusMeta[version.status].label}
                    </span>
                  </td>
                  <td className='px-5 py-3 text-[#5d6b64]'>{version.publishedAtUtc ? formatDateTime(version.publishedAtUtc) : '—'}</td>
                  <td className='px-5 py-3 text-[#5d6b64]'>
                    {version.criteriaCount} · {version.totalWeight}%
                  </td>
                  <td className='px-5 py-3 text-[#5d6b64]'>{version.usedByEvaluations} evaluation(s)</td>
                  <td className='px-5 py-3 text-[#5d6b64]'>{version.changeNote || '—'}</td>
                  <td className='px-5 py-3 text-right'>
                    <button
                      type='button'
                      onClick={() => void open(version.id)}
                      className='text-[13px] font-semibold text-[#184b38] hover:underline'
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={History} title='No versions yet' />
      )}

      {viewing ? (
        <Modal
          wide
          title={`${viewing.title} · v${viewing.versionNumber}`}
          description={`${rubricStatusMeta[viewing.status].label}${viewing.publishedAtUtc ? ` · published ${formatDateTime(viewing.publishedAtUtc)}` : ''}`}
          onClose={() => setViewing(null)}
        >
          <WeightMeter criteria={viewing.criteria} />
          <div className='mt-4'>
            <RubricCriteriaList criteria={viewing.criteria} />
          </div>
        </Modal>
      ) : null}
    </>
  )
}
