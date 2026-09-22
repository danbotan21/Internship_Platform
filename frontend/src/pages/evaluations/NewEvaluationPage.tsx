import { Lock, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { evaluationApi } from '../../api/evaluations'
import WeightMeter from '../../components/evaluations/WeightMeter'
import { evaluationTypes, typeMeta } from '../../components/evaluations/evaluationLabels'
import Alert from '../../components/ui/Alert'
import BackLink from '../../components/ui/BackLink'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import PageHeading from '../../components/ui/PageHeading'
import PageLoader from '../../components/ui/PageLoader'
import { formatDateTime } from '../../components/ui/formatDateTime'
import { card, inputBase, sectionTitle } from '../../components/ui/styles'
import type { EvaluationType } from '../../types/evaluation'
import { useAction, useLoadedData } from '../usePageData'

function isType(value: string | null): value is EvaluationType {
  return evaluationTypes.some((type) => type === value)
}

export default function NewEvaluationPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { data, error: loadError, loading } = useLoadedData(
    () => Promise.all([evaluationApi.mentorStudents(), evaluationApi.getRubric()]),
    'new-evaluation',
  )
  const { busy, error, run } = useAction()
  const [studentId, setStudentId] = useState(params.get('studentId') ?? '')
  const [type, setType] = useState<EvaluationType | ''>(() => {
    const requested = params.get('type')
    return isType(requested) ? requested : ''
  })
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')

  if (loading && !data) return <PageLoader label='Loading…' />
  if (loadError || !data) return <Alert tone='danger'>{loadError || 'Unavailable.'}</Alert>

  const [students, rubric] = data
  const published = rubric.published
  const selected = students.find((item) => item.student.userId === studentId)
  const taken = new Set(selected?.evaluations.map((item) => item.type) ?? [])
  const periodError = periodStart && periodEnd && periodEnd < periodStart ? 'The period cannot end before it starts.' : null
  const valid = Boolean(published && studentId && type && !taken.has(type) && periodStart && periodEnd && !periodError)

  const create = async () => {
    if (!type) return
    const created = await run(() => evaluationApi.create({ studentId, type, periodStart, periodEnd }))
    if (created) navigate(`/evaluation/${created.id}`)
  }

  return (
    <>
      <BackLink to='/evaluation'>Evaluations</BackLink>
      <PageHeading
        eyebrow='Evaluation · Mentor'
        title='New evaluation'
        description='An evaluation covers one student and one period. It is never created from a task or a pull request.'
      />
      {error ? <Alert tone='danger' className='mb-5'>{error}</Alert> : null}
      {!published ? (
        <Alert
          tone='warning'
          className='mb-5'
          title='Creating evaluations is blocked'
          action={
            <Link to='/evaluation/rubric' className='shrink-0 text-[13px] font-semibold hover:underline'>
              Set up rubric
            </Link>
          }
        >
          Publish a valid rubric first. Draft rubrics cannot be attached to evaluations.
        </Alert>
      ) : null}

      <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]'>
        <section className={`${card} space-y-5 p-5`}>
          <Field label='Student' htmlFor='student' required>
            <select id='student' className={inputBase} value={studentId} onChange={(event) => setStudentId(event.target.value)}>
              <option value=''>Choose a student assigned to you…</option>
              {students.map((item) => (
                <option key={item.student.userId} value={item.student.userId}>
                  {item.student.fullName} · {item.student.email}
                </option>
              ))}
            </select>
          </Field>

          <fieldset>
            <legend className='text-[13px] font-semibold text-[#14211b]'>
              Evaluation type <span className='text-[#a1332b]'>*</span>
            </legend>
            <div className='mt-2 grid gap-2 sm:grid-cols-3'>
              {evaluationTypes.map((value) => {
                const exists = taken.has(value)
                return (
                  <label key={value} className={exists ? 'cursor-not-allowed' : 'cursor-pointer'}>
                    <input
                      type='radio'
                      name='type'
                      className='peer sr-only'
                      checked={type === value}
                      disabled={exists}
                      onChange={() => setType(value)}
                    />
                    <span className='block h-full rounded-xl border border-[#e3e8e5] p-3 transition peer-checked:border-[#184b38] peer-checked:bg-[#f2f8f5] peer-disabled:opacity-50 peer-focus-visible:ring-2 peer-focus-visible:ring-[#2b6a50]/30'>
                      <span className='block text-[14px] font-semibold text-[#14211b]'>{typeMeta[value].label}</span>
                      <span className='block text-[12px] text-[#5d6b64]'>
                        {exists ? 'Already created for this student.' : typeMeta[value].meaning}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div className='grid gap-4 sm:grid-cols-2'>
            <Field label='Period start' htmlFor='period-start' required error={periodError}>
              <input id='period-start' type='date' className={inputBase} value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} />
            </Field>
            <Field label='Period end' htmlFor='period-end' required hint='Validated contributions from this period are shown as context.'>
              <input
                id='period-end'
                type='date'
                className={inputBase}
                min={periodStart || undefined}
                value={periodEnd}
                onChange={(event) => setPeriodEnd(event.target.value)}
              />
            </Field>
          </div>

          <div className='flex justify-end'>
            <Button icon={Plus} loading={busy} disabled={!valid} onClick={() => void create()}>
              Create draft evaluation
            </Button>
          </div>
        </section>

        <aside className={`${card} h-fit space-y-4 p-5`}>
          <h2 className={sectionTitle}>Rubric that will be attached</h2>
          {published ? (
            <>
              <p className='text-[13px] text-[#5d6b64]'>
                {published.title} · v{published.versionNumber} · published {formatDateTime(published.publishedAtUtc)}
              </p>
              <WeightMeter criteria={published.criteria} />
              <p className='flex gap-2 rounded-lg bg-[#f7f9f8] p-3 text-[12px] text-[#2b3833]'>
                <Lock className='mt-0.5 size-3.5 shrink-0 text-[#2b6a50]' aria-hidden='true' />
                The evaluation keeps v{published.versionNumber} even if you publish a newer rubric later.
              </p>
            </>
          ) : (
            <p className='text-[13px] text-[#a3530f]'>No published rubric available.</p>
          )}
        </aside>
      </div>
    </>
  )
}
