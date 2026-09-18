import { useEffect, useRef, useState } from 'react'
import { contributionApi } from '../api/contributions'
import { makeContribution } from './contributionPreviewData'
import {
  Badge,
  ContributionDetails,
  EvidenceList,
  Heading,
  Stat,
} from '../components/ContributionUi'
import { RevisionHistory } from '../components/RevisionHistory'
import ContributionRevisionPage from './ContributionRevisionPage'
import { useWorkspaceRole } from '../components/WorkspaceRoleContext'
import ContributionAttributionPanel from '../components/ContributionAttributionPanel'
import type { Category, Contribution } from '../types/contribution'
import ContributionDecisionDialog, {
  type ContributionDecisionKind,
} from '../components/ContributionDecisionDialog'

type Screen =
  | 'list'
  | 'revision'
  | 'details'
  | 'evidence'
  | 'review'
  | 'student-detail'
  | 'queue'
  | 'mentor-detail'

const rejectionReasons = [
  'Evidence cannot be verified',
  'Work is outside the internship scope',
  'Contribution is duplicated',
  'Attribution cannot be verified',
  'Other',
] as const
const card = 'rounded-[10px] border border-[#d9e0dc] bg-white'
const field =
  'mt-2 w-full rounded-lg border border-[#d9e0dc] bg-white px-3 py-3 text-[13px] text-[#14211b] outline-none focus:border-[#2b6a50] focus:ring-2 focus:ring-[#2b6a50]/15'
const filterField =
  'rounded-lg border border-[#d9e0dc] bg-white px-3 py-3 text-[13px] text-[#14211b] outline-none focus:border-[#2b6a50]'
const label =
  'block text-[10px] font-semibold uppercase tracking-wide text-[#6f7c76]'
const primary =
  'rounded-lg bg-[#184b38] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#245c47] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#184b38]'
const secondary =
  'rounded-lg border border-[#d9e0dc] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#184b38] hover:bg-[#f5f7f6]'
const categories = [
  'Development',
  'UI / UX design',
  'Testing',
  'Documentation',
  'Research',
  'Other',
]

function formatDate(value?: string) {
  return value
    ? new Date(value).toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—'
}
function isValidUrl(value: string) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}
function issuesFor(item: Contribution) {
  const issues: string[] = []
  if (!item.title.trim()) issues.push('Add a title.')
  if (!item.workPeriod.trim()) issues.push('Add the work period.')
  if (!item.description.trim()) issues.push('Describe what you contributed.')
  if (!item.ownRole.trim()) issues.push('Describe your role.')
  if (!item.evidence.length) issues.push('Add at least one evidence item.')
  if (item.status === 'Changes requested' && !item.revisionNote?.trim()) {
    issues.push('Explain what you changed in this revision.')
  }
  return issues
}

function hasDisputedAttribution(item: Contribution) {
  return item.collaborators.some((collaborator) => collaborator.status === 'Disputed')
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'The contribution service is unavailable. Please try again.'
}

export default function ContributionWorkspace() {
  const { role } = useWorkspaceRole()
  const [items, setItems] = useState<Contribution[]>([])
  const [screen, setScreen] = useState<Screen>(() =>
    role === 'student' ? 'list' : 'queue',
  )
  const [working, setWorking] = useState<Contribution | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [linkName, setLinkName] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [mentorFeedback, setMentorFeedback] = useState('')
  const [decisionKind, setDecisionKind] =
    useState<ContributionDecisionKind | null>(null)
  const [validationNote, setValidationNote] = useState('')
  const [rejectionReason, setRejectionReason] = useState<string>(
    rejectionReasons[0],
  )
  const [rejectionExplanation, setRejectionExplanation] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const selected = items.find((item) => item.id === selectedId)
  const go = (next: Screen) => {
    setMessage('')
    setScreen(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const update = (changes: Partial<Contribution>) =>
    setWorking((current) => (current ? { ...current, ...changes } : current))

  const closeDecisionDialog = () => {
    if (busy) return
    setDecisionKind(null)
    setValidationNote('')
    setRejectionReason(rejectionReasons[0])
    setRejectionExplanation('')
  }

  useEffect(() => {
    let active = true
    const request =
      role === 'student'
        ? contributionApi.listStudent()
        : contributionApi.listMentor()
    request
      .then((data) => {
        if (active) {
          setItems(data)
        }
      })
      .catch((error: unknown) => {
        if (active) setMessage(errorMessage(error))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [role])

  const replaceItem = (item: Contribution) => {
    setItems((current) => [
      item,
      ...current.filter((existing) => existing.id !== item.id),
    ])
    setSelectedId(item.id)
  }
  const run = async <T,>(action: () => Promise<T>): Promise<T | null> => {
    setBusy(true)
    setMessage('')
    try {
      return await action()
    } catch (error) {
      setMessage(errorMessage(error))
      return null
    } finally {
      setBusy(false)
    }
  }
  const openEditor = async (item?: Contribution) => {
    const editable = item
      ? await run(() => contributionApi.getStudent(item.id))
      : makeContribution()
    if (!editable) return
    if (!['Draft', 'Changes requested'].includes(editable.status)) {
      replaceItem(editable)
      go('student-detail')
      return
    }
    setWorking({
      ...editable,
      evidence: [...editable.evidence],
      collaborators: [...editable.collaborators],
    })
    setLinkName('')
    setLinkUrl('')
    go(editable.status === 'Changes requested' ? 'revision' : 'details')
  }
  const persistWorking = async () => {
    if (!working) return null
    const saved = await run(() => contributionApi.saveDraft(working))
    if (!saved) return null
    setWorking(saved)
    replaceItem(saved)
    return saved
  }
  const saveDraft = async () => {
    const saved = await persistWorking()
    if (saved) {
      setWorking(null)
      go('list')
    }
  }
  const submit = async () => {
    if (!working) return
    const issues = issuesFor(working)
    if (issues.length) {
      setMessage(issues.join(' '))
      return
    }
    const saved = await persistWorking()
    if (!saved) return
    const submitted = await run(() => contributionApi.submit(saved))
    if (!submitted) return
    replaceItem(submitted)
    setWorking(null)
    go('student-detail')
  }
  const addLink = async () => {
    if (!working) return
    if (!linkName.trim() || !isValidUrl(linkUrl.trim())) {
      setMessage('Enter an evidence name and a valid http(s) URL.')
      return
    }
    const saved = await persistWorking()
    if (!saved) return
    const result = await run(() =>
      contributionApi.addLink(saved.id, linkName.trim(), linkUrl.trim()),
    )
    if (!result) return
    setWorking(result)
    replaceItem(result)
    setLinkName('')
    setLinkUrl('')
  }
  const addFile = async (file?: File) => {
    if (!file || !working) return
    if (file.size > 1024 * 1024) {
      setMessage('Choose a file smaller than 1 MB.')
      return
    }
    const saved = await persistWorking()
    if (!saved) return
    const result = await run(() => contributionApi.addFile(saved.id, file))
    if (!result) return
    setWorking(result)
    replaceItem(result)
  }
  const removeEvidence = async (evidenceId: string) => {
    if (!working?.id) return
    const result = await run(() =>
      contributionApi.removeEvidence(working.id, evidenceId),
    )
    if (!result) return
    setWorking(result)
    replaceItem(result)
  }
  const openStudentDetail = async (id: string) => {
    const result = await run(() => contributionApi.getStudent(id))
    if (!result) return
    replaceItem(result)
    go('student-detail')
  }
  const openMentorDetail = async (id: string) => {
    const result = await run(() => contributionApi.getMentor(id))
    if (!result) return
    replaceItem(result)
    setMentorFeedback('')
    go('mentor-detail')
  }
  const requestChanges = async () => {
    if (!selected || !mentorFeedback.trim()) {
      setMessage('Add clear feedback before requesting changes.')
      return
    }
    const result = await run(() =>
      contributionApi.requestChanges(selected.id, mentorFeedback.trim()),
    )
    if (!result) return
    setItems((current) => current.filter((item) => item.id !== result.id))
    setSelectedId(null)
    setMentorFeedback('')
    go('queue')
  }

  const addCollaborator = async (
    contributionId: string,
    input: { name: string; email: string; role: string },
  ) => {
    if (!contributionId) {
      setMessage('Save the contribution before adding attribution details.')
      return
    }

    const result = await run(() =>
      contributionApi.addCollaborator(contributionId, input),
    )
    if (!result) return
    setWorking((current) =>
      current?.id === contributionId ? { ...current, collaborators: result.collaborators } : current,
    )
    replaceItem(result)
    setMessage('Collaborator added. They must confirm their participation.')
  }

  const updateCollaboratorRole = async (
    contributionId: string,
    collaboratorId: string,
    role: string,
  ) => {
    const result = await run(() =>
      contributionApi.updateCollaboratorRole(contributionId, collaboratorId, role),
    )
    if (!result) return
    setWorking((current) =>
      current?.id === contributionId ? { ...current, collaborators: result.collaborators } : current,
    )
    replaceItem(result)
  }

  const confirmParticipation = async (
    contributionId: string,
    collaboratorId: string,
  ) => {
    const result = await run(() =>
      contributionApi.confirmParticipation(contributionId, collaboratorId),
    )
    if (!result) return
    replaceItem(result)
    setMessage('Participation confirmed for this collaborator.')
  }

  const disputeParticipation = async (
    contributionId: string,
    collaboratorId: string,
    reason: string,
  ) => {
    const result = await run(() =>
      contributionApi.disputeParticipation(contributionId, collaboratorId, reason),
    )
    if (!result) return
    replaceItem(result)
    setMessage('Participation dispute submitted. The author must resolve it.')
  }

  const resolveDispute = async (
    contributionId: string,
    collaboratorId: string,
    note: string,
  ) => {
    const result = await run(() =>
      contributionApi.resolveAttribution(contributionId, collaboratorId, note),
    )
    if (!result) return
    replaceItem(result)
    setMessage('Attribution dispute resolved. The mentor can review it again.')
  }

  const openDecisionDialog = (kind: ContributionDecisionKind) => {
    if (!selected || selected.status !== 'Submitted' || busy) return
    if (kind === 'validate' && hasDisputedAttribution(selected)) {
      setMessage('Resolve all attribution disputes before validating this contribution.')
      return
    }
    setDecisionKind(kind)
    setValidationNote('')
    setRejectionReason(rejectionReasons[0])
    setRejectionExplanation('')
  }

  const recordDecision = async () => {
    if (!selected || !decisionKind) return
    if (selected.status !== 'Submitted') {
      setMessage('Only submitted contributions can receive a mentor decision.')
      return
    }

    if (decisionKind === 'validate' && hasDisputedAttribution(selected)) {
      setMessage('Resolve all attribution disputes before validating this contribution.')
      return
    }

    if (decisionKind === 'reject' && !rejectionExplanation.trim()) {
      setMessage('Add a clear explanation before rejecting the contribution.')
      return
    }

    const result = await run(() =>
      decisionKind === 'validate'
        ? contributionApi.validate(selected.id, validationNote)
        : contributionApi.reject(
            selected.id,
            rejectionReason,
            rejectionExplanation,
          ),
    )
    if (!result) return

    replaceItem(result)
    closeDecisionDialog()
    setSelectedId(null)
    go('queue')
  }
  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === 'All' || item.status === statusFilter) &&
      (categoryFilter === 'All' || item.category === categoryFilter),
  )
  const queue = items.filter(
    (item) =>
      item.status === 'Submitted' &&
      item.title.toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter === 'All' || item.category === categoryFilter),
  )
  return (
    <div className='w-full'>
          {loading && (
            <div className='mb-5 rounded-lg border border-[#d9e0dc] bg-white p-4 text-[12px] text-[#6f7c76]'>
              Loading contributions...
            </div>
          )}
          {message && (
            <div
              role='alert'
              className='mb-5 rounded-lg border border-[#efc1bb] bg-[#fde8e7] p-4 text-[12px] text-[#a1332b]'
            >
              {message}
            </div>
          )}
          {screen === 'list' && role === 'student' && (
            <>
              <Heading
                eyebrow='Student workspace · Contributions'
                title='My contributions'
                description='Record your work, attach evidence and track its review status.'
                right={
                  <button
                    type='button'
                    className={primary}
                    onClick={() => openEditor()}
                  >
                    + New contribution
                  </button>
                }
              />
              <div className='mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                <Stat
                  title='Drafts'
                  count={items.filter((x) => x.status === 'Draft').length}
                  caption='editable'
                />
                <Stat
                  title='Submitted'
                  count={items.filter((x) => x.status === 'Submitted').length}
                  caption='awaiting review'
                />
                <Stat
                  title='Changes requested'
                  count={
                    items.filter((x) => x.status === 'Changes requested').length
                  }
                  caption='can resubmit'
                />
                <Stat
                  title='Validated'
                  count={items.filter((x) => x.status === 'Validated').length}
                  caption='accepted evidence'
                />
              </div>
              <div className={`${card} mb-4 flex flex-wrap gap-3 p-3`}>
                <input
                  className={`${filterField} min-w-[190px] flex-1 sm:max-w-80`}
                  aria-label='Search contributions'
                  placeholder='Search contributions...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className={filterField}
                  aria-label='Filter by status'
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {[
                    'All',
                    'Draft',
                    'Submitted',
                    'Changes requested',
                    'Validated',
                    'Rejected',
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
                <select
                  className={filterField}
                  aria-label='Filter by category'
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {['All', ...categories].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </div>
              <div className={`${card} overflow-x-auto p-4`}>
                <table className='w-full min-w-[730px] text-left text-[11px]'>
                  <thead className='text-[10px] uppercase text-[#6f7c76]'>
                    <tr>
                      {[
                        'Contribution',
                        'Category',
                        'Evidence',
                        'Status',
                        'Updated',
                        'Action',
                      ].map((x) => (
                        <th key={x} className='pb-4 font-semibold'>
                          {x}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id} className='border-t border-[#e5eae7]'>
                        <td className='py-5 pr-4 font-semibold'>
                          {item.title || 'Untitled draft'}
                        </td>
                        <td className='pr-4'>{item.category}</td>
                        <td className='pr-4'>{item.evidence.length} item(s)</td>
                        <td className='pr-4'>
                          <Badge status={item.status} />
                        </td>
                        <td className='pr-4'>{formatDate(item.updatedAt)}</td>
                        <td>
                          <button
                            type='button'
                            className={
                              item.status === 'Changes requested'
                                ? primary
                                : secondary
                            }
                            disabled={busy}
                            onClick={() => {
                              if (
                                item.status === 'Submitted' ||
                                item.status === 'Validated' ||
                                item.status === 'Rejected'
                              ) {
                                void openStudentDetail(item.id)
                              } else {
                                void openEditor(item)
                              }
                            }}
                          >
                            {item.status === 'Submitted' ||
                            item.status === 'Validated' ||
                            item.status === 'Rejected'
                              ? 'View'
                              : item.status === 'Draft'
                                ? 'Edit'
                                : 'Revise'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filtered.length && (
                  <p className='py-8 text-center text-[12px] text-[#6f7c76]'>
                    No contributions match these filters.
                  </p>
                )}
              </div>
            </>
          )}
          {screen === 'revision' && working && (
            <>
              <ContributionRevisionPage
                item={working}
                linkName={linkName}
                linkUrl={linkUrl}
                onLinkName={setLinkName}
                onLinkUrl={setLinkUrl}
                onUpdate={update}
                onRemoveEvidence={removeEvidence}
                onAddLink={addLink}
                onUpload={addFile}
                onSave={saveDraft}
                onReview={() => go('review')}
                onEditDetails={() => go('details')}
              />
              <ContributionAttributionPanel
                item={working}
                mode='author'
                editable
                onAddCollaborator={(input) => addCollaborator(working.id, input)}
                onUpdateRole={(collaboratorId, roleValue) =>
                  updateCollaboratorRole(working.id, collaboratorId, roleValue)
                }
              />
            </>
          )}
          {screen === 'details' && working && (
            <>
              <Heading
                eyebrow='Contribution management · Student'
                title={
                  working.title
                    ? `Edit contribution${working.status === 'Changes requested' ? ' · Revision' : ''}`
                    : 'Record a contribution'
                }
                description='Describe the work you personally completed. Save a draft at any time.'
                right={<Badge status={working.status} />}
              />
              {working.mentorFeedback && (
                <div className='mb-5 rounded-lg bg-[#fde8e7] p-4 text-[12px]'>
                  <strong>Mentor feedback</strong>
                  <p className='mt-1'>{working.mentorFeedback}</p>
                </div>
              )}
              <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_245px]'>
                <section className={`${card} p-5`}>
                  <h2 className='text-[17px] font-bold'>
                    Contribution details
                  </h2>
                  <p className='mb-5 mt-1 text-[11px] text-[#6f7c76]'>
                    Required details can be completed before submission.
                  </p>
                  <label className={label}>
                    Title *
                    <input
                      className={field}
                      value={working.title}
                      onChange={(e) => update({ title: e.target.value })}
                      placeholder='What did you deliver?'
                    />
                  </label>
                  <div className='mt-4 grid gap-4 sm:grid-cols-2'>
                    <label className={label}>
                      Category
                      <select
                        className={field}
                        value={working.category}
                        onChange={(e) =>
                          update({ category: e.target.value as Category })
                        }
                      >
                        {categories.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                    <label className={label}>
                      Work period *
                      <input
                        className={field}
                        value={working.workPeriod}
                        onChange={(e) => update({ workPeriod: e.target.value })}
                        placeholder='e.g. 9–10 Sep 2026'
                      />
                    </label>
                  </div>
                  <label className={`${label} mt-4`}>
                    What did you contribute? *
                    <textarea
                      className={`${field} min-h-28 resize-y`}
                      value={working.description}
                      onChange={(e) => update({ description: e.target.value })}
                      placeholder='Describe concrete work, not a score or evaluation.'
                    />
                  </label>
                  <label className={`${label} mt-4`}>
                    Your role *
                    <input
                      className={field}
                      value={working.ownRole}
                      onChange={(e) => update({ ownRole: e.target.value })}
                      placeholder='What part did you personally own?'
                    />
                  </label>
                  <label className={`${label} mt-4`}>
                    Linked internship task (optional)
                    <input
                      className={field}
                      value={working.linkedTask}
                      onChange={(e) => update({ linkedTask: e.target.value })}
                      placeholder='Task reference'
                    />
                  </label>
                  <div className='mt-5 rounded-lg bg-[#e8f2ed] p-4 text-[11px]'>
                    <strong>Draft behavior</strong>
                    <p className='mt-1 text-[#6f7c76]'>
                      Drafts remain editable and are hidden from the mentor
                      review queue.
                    </p>
                  </div>
                  <div className='mt-5 flex flex-wrap justify-end gap-3'>
                    <button
                      type='button'
                      className={secondary}
                      onClick={saveDraft}
                    >
                      {working.status === 'Changes requested'
                        ? 'Save revision'
                        : 'Save draft'}
                    </button>
                    <button
                      type='button'
                      className={primary}
                      onClick={() => go('evidence')}
                    >
                      Continue to evidence
                    </button>
                  </div>
                </section>
                <aside className={`${card} h-fit p-5`}>
                  <h2 className='text-[16px] font-bold'>Creation progress</h2>
                  {['Details', 'Evidence', 'Review & submit'].map((x, i) => (
                    <div
                      key={x}
                      className='mt-5 flex items-center gap-3 text-[11px]'
                    >
                      <span className='flex size-7 items-center justify-center rounded-full bg-[#e8f2ed]'>
                        {i + 1}
                      </span>
                      {x}
                    </div>
                  ))}
                </aside>
              </div>
              <ContributionAttributionPanel
                item={working}
                mode='author'
                editable
                onAddCollaborator={(input) => addCollaborator(working.id, input)}
                onUpdateRole={(collaboratorId, roleValue) =>
                  updateCollaboratorRole(working.id, collaboratorId, roleValue)
                }
              />
            </>
          )}
          {screen === 'evidence' && working && (
            <>
              <Heading
                eyebrow='Contribution management · Student'
                title='Add supporting evidence'
                description='Attach a traceable link or a small file so a mentor can inspect the work.'
                right={<Badge status={working.status} />}
              />
              <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_245px]'>
                <section className={`${card} p-5`}>
                  <h2 className='text-[17px] font-bold'>Evidence</h2>
                  <p className='mb-5 mt-1 text-[11px] text-[#6f7c76]'>
                    At least one evidence item is needed to submit.
                  </p>
                  <EvidenceList
                    items={working.evidence}
                    onRemove={removeEvidence}
                  />
                  <div className='mt-6 grid gap-3 sm:grid-cols-[1fr_1.4fr_auto]'>
                    <label className={label}>
                      Link name
                      <input
                        className={field}
                        value={linkName}
                        onChange={(e) => setLinkName(e.target.value)}
                        placeholder='e.g. Pull request'
                      />
                    </label>
                    <label className={label}>
                      URL
                      <input
                        className={field}
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder='https://...'
                      />
                    </label>
                    <button
                      type='button'
                      className={`${secondary} self-end`}
                      onClick={addLink}
                    >
                      Add link
                    </button>
                  </div>
                  <div className='mt-4'>
                    <input
                      ref={fileInput}
                      className='hidden'
                      type='file'
                      onChange={(e) => {
                        addFile(e.target.files?.[0])
                        e.target.value = ''
                      }}
                    />
                    <button
                      type='button'
                      className={secondary}
                      onClick={() => fileInput.current?.click()}
                    >
                      Upload file (max 1 MB)
                    </button>
                    <p className='mt-2 text-[11px] text-[#6f7c76]'>
                      Files are uploaded to the server and retained as evidence.
                    </p>
                  </div>
                  <label className={`${label} mt-5`}>
                    Evidence note (optional)
                    <textarea
                      className={`${field} min-h-20`}
                      value={working.evidenceNote}
                      onChange={(e) => update({ evidenceNote: e.target.value })}
                      placeholder='How does this show your work?'
                    />
                  </label>
                  <div className='mt-6 flex flex-wrap justify-end gap-3'>
                    <button
                      type='button'
                      className={secondary}
                      onClick={() => go('details')}
                    >
                      Back to details
                    </button>
                    <button
                      type='button'
                      className={secondary}
                      onClick={saveDraft}
                    >
                      Save
                    </button>
                    <button
                      type='button'
                      className={primary}
                      onClick={() => go('review')}
                    >
                      Review submission
                    </button>
                  </div>
                </section>
                <aside className={`${card} h-fit p-5 text-[11px]`}>
                  <h2 className='text-[16px] font-bold'>Evidence rules</h2>
                  <p className='mt-4 rounded-lg bg-[#e8f2ed] p-4'>
                    A link or file is required. Evidence is not an automatic
                    evaluation score.
                  </p>
                </aside>
              </div>
            </>
          )}
          {screen === 'review' && working && (
            <>
              <Heading
                eyebrow='Contribution management · Student'
                title={
                  issuesFor(working).length
                    ? 'Contribution cannot be submitted'
                    : working.status === 'Changes requested'
                      ? 'Review resubmission'
                      : 'Review before submission'
                }
                description={
                  issuesFor(working).length
                    ? 'Fix the blocking fields before this contribution can enter mentor review.'
                    : 'Check the work and evidence before sending it to mentor review.'
                }
                right={<Badge status={working.status} />}
              />
              <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]'>
                <section className={`${card} p-5`}>
                  <h2 className='text-[17px] font-bold'>Submission summary</h2>
                  {(
                    [
                      ['Title', working.title || 'Missing'],
                      ['Category', working.category],
                      ['Work period', working.workPeriod || 'Missing'],
                      ['Your role', working.ownRole || 'Missing'],
                      ['Linked task', working.linkedTask || 'None'],
                      ...(working.status === 'Changes requested'
                        ? [['Revision note', working.revisionNote || 'Missing']]
                        : []),
                    ] as const
                  ).map(([name, value]) => (
                    <div
                      key={name}
                      className='grid grid-cols-2 gap-4 border-b border-[#d9e0dc] py-4 text-[12px]'
                    >
                      <span className='text-[#6f7c76]'>{name}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                  <p className='mt-5 text-[12px]'>
                    {working.description || 'Description missing'}
                  </p>
                  <h3 className='mb-3 mt-6 text-[13px] font-bold'>
                    Evidence · {working.evidence.length}
                  </h3>
                  <EvidenceList items={working.evidence} />
                </section>
                <aside className={`${card} h-fit p-5 text-[12px]`}>
                  <h2 className='text-[16px] font-bold'>Submission checks</h2>
                  {issuesFor(working).length ? (
                    <ul className='mt-4 list-inside list-disc space-y-2 text-[#a1332b]'>
                      {issuesFor(working).map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className='mt-4 rounded-lg bg-[#e8f2ed] p-3 text-[#184b38]'>
                      Ready to submit.
                    </p>
                  )}
                  <p
                    className={`mt-5 rounded-lg p-3 text-[11px] ${issuesFor(working).length ? 'border border-[#efc1bb] bg-[#fde8e7] text-[#a1332b]' : 'bg-[#eaf0ff] text-[#3057a6]'}`}
                  >
                    {issuesFor(working).length
                      ? 'The lifecycle remains unchanged until every required check passes.'
                      : 'Submitting locks editing and puts the contribution in the mentor queue.'}
                  </p>
                  <div className='mt-5 flex flex-wrap gap-2'>
                    <button
                      type='button'
                      className={secondary}
                      onClick={() =>
                        go(
                          working.status === 'Changes requested'
                            ? 'revision'
                            : 'evidence',
                        )
                      }
                    >
                      Back
                    </button>
                    {issuesFor(working).length ? (
                      <button
                        type='button'
                        className={primary}
                        onClick={() =>
                          go(
                            working.status === 'Changes requested'
                              ? 'revision'
                              : !working.evidence.length
                                ? 'evidence'
                                : 'details',
                          )
                        }
                      >
                        Fix blocking items
                      </button>
                    ) : (
                      <button
                        type='button'
                        className={primary}
                        onClick={submit}
                      >
                        {working.status === 'Changes requested'
                          ? 'Resubmit for review'
                          : 'Submit for review'}
                      </button>
                    )}
                  </div>
                </aside>
              </div>
            </>
          )}
          {screen === 'student-detail' && selected && (
            <>
              <Heading
                eyebrow='Contribution management · Student'
                title={selected.title}
                description={`${selected.category} · ${selected.workPeriod} · Submitted ${formatDate(selected.submittedAt)}`}
                right={<Badge status={selected.status} />}
              />
              <div
                className={`mb-5 rounded-lg p-4 text-[12px] ${
                  selected.status === 'Validated'
                    ? 'bg-[#e8f2ed] text-[#184b38]'
                    : selected.status === 'Rejected'
                      ? 'bg-[#fde8e7] text-[#a1332b]'
                      : 'bg-[#eaf0ff] text-[#3057a6]'
                }`}
              >
                <strong>
                  {selected.status === 'Validated'
                    ? 'Contribution validated'
                    : selected.status === 'Rejected'
                      ? 'Contribution rejected'
                      : 'Pending mentor review'}
                </strong>
                <p className='mt-1'>
                  {selected.status === 'Validated'
                    ? 'The mentor verified the work and evidence. This contribution is now trusted read-only context.'
                    : selected.status === 'Rejected'
                      ? 'This submitted revision is locked. Create a new contribution if the work needs to be documented again.'
                      : 'This contribution is submitted and read-only while the mentor reviews it.'}
                </p>
              </div>
              {selected.reviewDecision?.note ? (
                <div className='mb-5 rounded-lg border border-[#d9e0dc] bg-white p-4 text-[12px]'>
                  <strong>
                    {selected.status === 'Rejected'
                      ? 'Mentor explanation'
                      : 'Validation note'}
                  </strong>
                  <p className='mt-1 text-[#6f7c76]'>
                    {selected.reviewDecision.note}
                  </p>
                  {selected.reviewDecision.reason ? (
                    <p className='mt-2 text-[11px] text-[#6f7c76]'>
                      Reason: {selected.reviewDecision.reason}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <ContributionDetails item={selected} />
              <ContributionAttributionPanel
                item={selected}
                mode='author'
                allowResolve={selected.status === 'Submitted'}
                showConfirmationPreview={selected.status !== 'Validated' && selected.status !== 'Rejected'}
                onResolveDispute={(collaboratorId, note) =>
                  resolveDispute(selected.id, collaboratorId, note)
                }
                onConfirmParticipation={(collaboratorId) =>
                  confirmParticipation(selected.id, collaboratorId)
                }
                onDisputeParticipation={(collaboratorId, reason) =>
                  disputeParticipation(selected.id, collaboratorId, reason)
                }
              />
              {selected.history?.length ? (
                <div className='mt-4'>
                  <RevisionHistory item={selected} />
                </div>
              ) : null}
              <button
                type='button'
                className={`${secondary} mt-5`}
                onClick={() => go('list')}
              >
                Back to contributions
              </button>
              {selected.status === 'Rejected' ? (
                <button
                  type='button'
                  className={`${primary} ml-2 mt-5`}
                  onClick={() => void openEditor()}
                >
                  Create new contribution
                </button>
              ) : null}
            </>
          )}
          {screen === 'queue' && role === 'mentor' && (
            <>
              <Heading
                eyebrow='Contribution management · Mentor'
                title='Contribution review queue'
                description='View submitted student contributions and their supporting evidence.'
              />
              <div className='mb-5 grid gap-3 sm:grid-cols-2'>
                <Stat
                  title='Awaiting review'
                  count={items.filter((x) => x.status === 'Submitted').length}
                  caption='submitted'
                />
                <Stat
                  title='Changes requested'
                  count={
                    items.filter((x) => x.status === 'Changes requested').length
                  }
                  caption='student action'
                />
              </div>
              <div className={`${card} mb-4 flex flex-wrap gap-3 p-3`}>
                <input
                  className={`${filterField} min-w-[190px] flex-1 sm:max-w-80`}
                  aria-label='Search review queue'
                  placeholder='Search contributions...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className={filterField}
                  aria-label='Filter queue by category'
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {['All', ...categories].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </div>
              <div className={`${card} overflow-x-auto p-4`}>
                <table className='w-full min-w-[730px] text-left text-[11px]'>
                  <thead className='text-[10px] uppercase text-[#6f7c76]'>
                    <tr>
                      {[
                        'Student',
                        'Contribution',
                        'Category',
                        'Evidence',
                        'Submitted',
                        'Action',
                      ].map((x) => (
                        <th key={x} className='pb-4 font-semibold'>
                          {x}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((item) => (
                      <tr key={item.id} className='border-t border-[#e5eae7]'>
                        <td className='py-5 pr-4'>
                          {item.studentDisplayName || 'Demo student'}
                        </td>
                        <td className='pr-4 font-semibold'>{item.title}</td>
                        <td className='pr-4'>{item.category}</td>
                        <td className='pr-4'>{item.evidence.length} item(s)</td>
                        <td className='pr-4'>{formatDate(item.submittedAt)}</td>
                        <td>
                          <button
                            type='button'
                            className={primary}
                            disabled={busy}
                            onClick={() => void openMentorDetail(item.id)}
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!queue.length && (
                  <p className='py-8 text-center text-[12px] text-[#6f7c76]'>
                    No submitted contributions match this search.
                  </p>
                )}
              </div>
            </>
          )}
          {screen === 'mentor-detail' && selected && (
            <>
              <Heading
                eyebrow='Contribution management · Mentor'
                title={selected.title}
                description={`${selected.studentDisplayName || 'Demo student'} · ${selected.category} · Submitted ${formatDate(selected.submittedAt)}`}
                right={<Badge status={selected.status} />}
              />
              <button
                type='button'
                className={`${secondary} mb-4`}
                onClick={() => go('queue')}
              >
                Back to queue
              </button>
              <ContributionDetails item={selected} />
              <ContributionAttributionPanel item={selected} mode='mentor' />
              {selected.status === 'Submitted' ? (
                <section className={`${card} mt-5 p-5`}>
                  <div className='flex flex-wrap items-start justify-between gap-4'>
                    <div>
                      <h2 className='text-[16px] font-bold'>Review decision</h2>
                      <p className='mt-1 text-[11px] text-[#6f7c76]'>
                        Record one clear outcome for this submitted contribution.
                        The decision is saved with your note and timestamp.
                      </p>
                    </div>
                    <Badge status='Submitted' />
                  </div>
                  <label className={`${label} mt-5`}>
                    Request changes feedback
                    <textarea
                      className={`${field} min-h-24 resize-y`}
                      value={mentorFeedback}
                      onChange={(event) => setMentorFeedback(event.target.value)}
                      placeholder='Explain concretely what the student must update before resubmitting.'
                      disabled={busy}
                    />
                  </label>
                  <div className='mt-4 flex flex-wrap justify-end gap-2'>
                    <button
                      type='button'
                      className='rounded-lg border border-[#efc1bb] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#a1332b] hover:bg-[#fde8e7] disabled:cursor-not-allowed disabled:opacity-60'
                      disabled={busy}
                      onClick={() => openDecisionDialog('reject')}
                    >
                      Reject
                    </button>
                    <button
                      type='button'
                      className={secondary}
                      disabled={busy}
                      onClick={() => void requestChanges()}
                    >
                      {busy ? 'Saving...' : 'Request changes'}
                    </button>
                    <button
                      type='button'
                      className={primary}
                      disabled={busy || hasDisputedAttribution(selected)}
                      onClick={() => openDecisionDialog('validate')}
                    >
                      Validate
                    </button>
                  </div>
                </section>
              ) : (
                <section className={`${card} mt-5 p-5`}>
                  <h2 className='text-[16px] font-bold'>Decision recorded</h2>
                  <p className='mt-1 text-[12px] text-[#6f7c76]'>
                    This contribution is {selected.status.toLowerCase()} and
                    read-only. No further mentor decision can be recorded for
                    this revision.
                  </p>
                </section>
              )}
            </>
          )}
          {decisionKind && selected ? (
            <ContributionDecisionDialog
              item={selected}
              kind={decisionKind}
              validationNote={validationNote}
              rejectionReason={rejectionReason}
              rejectionExplanation={rejectionExplanation}
              rejectionReasons={rejectionReasons}
              busy={busy}
              onValidationNoteChange={setValidationNote}
              onRejectionReasonChange={setRejectionReason}
              onRejectionExplanationChange={setRejectionExplanation}
              onCancel={closeDecisionDialog}
              onConfirm={() => void recordDecision()}
            />
          ) : null}
    </div>
  )
}
