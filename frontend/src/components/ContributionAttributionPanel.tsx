import {
  CircleCheck,
  Plus,
  ShieldCheck,
  TriangleAlert,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import type {
  Collaborator,
  CollaboratorParticipationStatus,
  Contribution,
} from '../types/contribution'

const card = 'rounded-[10px] border border-[#d9e0dc] bg-white'
const field =
  'mt-2 w-full rounded-lg border border-[#d9e0dc] bg-white px-3 py-2.5 text-[12px] text-[#14211b] outline-none focus:border-[#2b6a50] focus:ring-2 focus:ring-[#2b6a50]/15'
const label =
  'block text-[10px] font-semibold uppercase tracking-wide text-[#6f7c76]'
const primary =
  'rounded-lg bg-[#184b38] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-[#245c47] disabled:cursor-not-allowed disabled:opacity-50'
const secondary =
  'rounded-lg border border-[#d9e0dc] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#184b38] hover:bg-[#f5f7f6] disabled:cursor-not-allowed disabled:opacity-50'

type AddCollaboratorInput = {
  name: string
  email: string
  role: string
}

type ContributionAttributionPanelProps = {
  item: Contribution
  mode: 'author' | 'mentor'
  editable?: boolean
  allowResolve?: boolean
  showConfirmationPreview?: boolean
  onAddCollaborator?: (input: AddCollaboratorInput) => void
  onUpdateRole?: (collaboratorId: string, role: string) => void
  onConfirmParticipation?: (collaboratorId: string) => void
  onDisputeParticipation?: (collaboratorId: string, reason: string) => void
  onResolveDispute?: (collaboratorId: string, note: string) => void
}

const statusStyles: Record<CollaboratorParticipationStatus, string> = {
  'Pending confirmation': 'bg-[#fff1d8] text-[#8a5200]',
  Confirmed: 'bg-[#e8f2ed] text-[#184b38]',
  Disputed: 'bg-[#fde8e7] text-[#a1332b]',
  Resolved: 'bg-[#eaf0ff] text-[#3057a6]',
}

function initials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  )
}

function statusLabel(status: CollaboratorParticipationStatus) {
  return status === 'Pending confirmation' ? 'Pending' : status
}

function attributionSummary(collaborators: Collaborator[]) {
  if (!collaborators.length) {
    return {
      title: 'Individual contribution',
      description: 'Only the contribution author is currently attributed.',
      tone: 'bg-[#f5f7f6] text-[#6f7c76]',
    }
  }

  const disputed = collaborators.filter((item) => item.status === 'Disputed')
  if (disputed.length) {
    return {
      title: `${disputed.length} attribution dispute${disputed.length === 1 ? '' : 's'} need${disputed.length === 1 ? 's' : ''} resolution`,
      description:
        'The mentor can inspect the contribution, but validation stays blocked while participation is disputed.',
      tone: 'bg-[#fde8e7] text-[#a1332b]',
    }
  }

  const pending = collaborators.filter(
    (item) => item.status === 'Pending confirmation',
  )
  if (pending.length) {
    return {
      title: `${pending.length} collaborator${pending.length === 1 ? '' : 's'} awaiting confirmation`,
      description:
        'Pending confirmation does not block submission. Ask each collaborator to confirm their participation.',
      tone: 'bg-[#fff1d8] text-[#8a5200]',
    }
  }

  return {
    title: 'Attribution confirmed',
    description: 'All listed collaborators have confirmed their participation.',
    tone: 'bg-[#e8f2ed] text-[#184b38]',
  }
}

export default function ContributionAttributionPanel({
  item,
  mode,
  editable = false,
  allowResolve = false,
  showConfirmationPreview = false,
  onAddCollaborator,
  onUpdateRole,
  onConfirmParticipation,
  onDisputeParticipation,
  onResolveDispute,
}: ContributionAttributionPanelProps) {
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('')
  const [draftRoles, setDraftRoles] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [confirmationId, setConfirmationId] = useState('')
  const [disputeId, setDisputeId] = useState<string | null>(null)
  const [disputeReason, setDisputeReason] = useState('')
  const [resolutionId, setResolutionId] = useState<string | null>(null)
  const [resolutionNote, setResolutionNote] = useState('')

  const summary = attributionSummary(item.collaborators)
  const selectedForConfirmation = item.collaborators.find(
    (collaborator) => collaborator.id === confirmationId,
  )
  const isLocked = item.status === 'Validated' || item.status === 'Rejected'

  const addCollaborator = () => {
    const name = newName.trim()
    const email = newEmail.trim()
    const role = newRole.trim()
    if (!name || !email || !role) {
      setFormError('Name, email and role are required.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setFormError('Enter a valid collaborator email address.')
      return
    }

    onAddCollaborator?.({ name, email, role })
    setNewName('')
    setNewEmail('')
    setNewRole('')
    setFormError('')
  }

  const startDispute = () => {
    if (!selectedForConfirmation) return
    setDisputeId(selectedForConfirmation.id)
    setDisputeReason('')
  }

  const submitDispute = () => {
    if (!disputeId || !disputeReason.trim()) return
    onDisputeParticipation?.(disputeId, disputeReason.trim())
    setDisputeId(null)
    setDisputeReason('')
  }

  const startResolution = (collaborator: Collaborator) => {
    setResolutionId(collaborator.id)
    setResolutionNote('')
  }

  const submitResolution = () => {
    if (!resolutionId || !resolutionNote.trim()) return
    onResolveDispute?.(resolutionId, resolutionNote.trim())
    setResolutionId(null)
    setResolutionNote('')
  }

  return (
    <section className={`${card} mt-5 p-5`}>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='flex items-start gap-3'>
          <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#e8f2ed] text-[#184b38]'>
            <Users className='size-4' aria-hidden='true' />
          </div>
          <div>
            <h2 className='text-[16px] font-bold'>Contribution attribution</h2>
            <p className='mt-1 text-[11px] text-[#6f7c76]'>
              {mode === 'mentor'
                ? 'Review who participated and what each person owned.'
                : 'Keep shared work transparent by recording every contributor and their role.'}
            </p>
          </div>
        </div>
        <span className='rounded-full bg-[#f5f7f6] px-3 py-1.5 text-[10px] font-semibold text-[#6f7c76]'>
          {item.collaborators.length
            ? `${item.collaborators.length} collaborator${item.collaborators.length === 1 ? '' : 's'}`
            : 'Solo work'}
        </span>
      </div>

      <div className={`mt-4 rounded-lg p-3 text-[11px] ${summary.tone}`}>
        <div className='flex items-start gap-2'>
          {summary.title.includes('dispute') ? (
            <TriangleAlert
              className='mt-0.5 size-3.5 shrink-0'
              aria-hidden='true'
            />
          ) : (
            <ShieldCheck
              className='mt-0.5 size-3.5 shrink-0'
              aria-hidden='true'
            />
          )}
          <div>
            <strong>{summary.title}</strong>
            <p className='mt-1'>{summary.description}</p>
          </div>
        </div>
      </div>

      <div className='mt-5 rounded-lg border border-[#d9e0dc] p-4'>
        <div className='flex items-start gap-3'>
          <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-[#184b38] text-[11px] font-bold text-white'>
            DB
          </div>
          <div className='min-w-0'>
            <p className='text-[12px] font-semibold'>
              {item.studentDisplayName || 'Daniel Botan'}
              <span className='ml-2 rounded-full bg-[#e8f2ed] px-2 py-1 text-[10px] font-medium text-[#184b38]'>
                Author
              </span>
            </p>
            <p className='mt-1 text-[11px] text-[#6f7c76]'>
              The person who recorded this contribution.
            </p>
          </div>
        </div>
      </div>

      <div className='mt-3 space-y-3'>
        {item.collaborators.map((collaborator) => (
          <div
            key={collaborator.id}
            className='rounded-lg border border-[#d9e0dc] p-4'
          >
            <div className='flex flex-wrap items-start justify-between gap-3'>
              <div className='flex min-w-0 items-start gap-3'>
                <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-[#eaf0ff] text-[11px] font-bold text-[#3057a6]'>
                  {initials(collaborator.name)}
                </div>
                <div className='min-w-0'>
                  <p className='truncate text-[12px] font-semibold'>
                    {collaborator.name}
                  </p>
                  <p className='mt-1 truncate text-[11px] text-[#6f7c76]'>
                    {collaborator.email}
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[collaborator.status]}`}
              >
                {statusLabel(collaborator.status)}
              </span>
            </div>

            <div className='mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end'>
              <label className={label}>
                Role in contribution
                {editable && mode === 'author' ? (
                  <input
                    className={field}
                    value={draftRoles[collaborator.id] ?? collaborator.role}
                    onChange={(event) =>
                      setDraftRoles((current) => ({
                        ...current,
                        [collaborator.id]: event.target.value,
                      }))
                    }
                    onBlur={() => {
                      const role = draftRoles[collaborator.id]
                      if (
                        role !== undefined &&
                        role.trim() !== collaborator.role
                      ) {
                        onUpdateRole?.(collaborator.id, role.trim())
                      }
                    }}
                    placeholder='e.g. API integration'
                    aria-label={`Role for ${collaborator.name}`}
                  />
                ) : (
                  <span className='mt-2 block text-[12px] font-medium normal-case tracking-normal text-[#14211b]'>
                    {collaborator.role || 'Role not specified'}
                  </span>
                )}
              </label>
              {mode === 'mentor' ? (
                <span className='inline-flex items-center gap-1 text-[10px] text-[#6f7c76]'>
                  <CircleCheck className='size-3.5' aria-hidden='true' />
                  Attribution visible to mentor
                </span>
              ) : null}
            </div>

            {collaborator.status === 'Disputed' ? (
              <div className='mt-3 rounded-lg bg-[#fde8e7] p-3 text-[11px] text-[#a1332b]'>
                <strong>Participation disputed</strong>
                {collaborator.disputeReason ? (
                  <p className='mt-1'>{collaborator.disputeReason}</p>
                ) : null}
                {allowResolve && mode === 'author' && !isLocked ? (
                  resolutionId === collaborator.id ? (
                    <div className='mt-3'>
                      <label className={label}>
                        Resolution note
                        <textarea
                          className={`${field} min-h-20 resize-y`}
                          value={resolutionNote}
                          onChange={(event) =>
                            setResolutionNote(event.target.value)
                          }
                          placeholder='Explain how the attribution was resolved.'
                        />
                      </label>
                      <div className='mt-2 flex flex-wrap justify-end gap-2'>
                        <button
                          type='button'
                          className={secondary}
                          onClick={() => setResolutionId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type='button'
                          className={primary}
                          disabled={!resolutionNote.trim()}
                          onClick={submitResolution}
                        >
                          Resolve dispute
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type='button'
                      className={`${secondary} mt-3 border-[#efc1bb] text-[#a1332b]`}
                      onClick={() => startResolution(collaborator)}
                    >
                      Resolve attribution
                    </button>
                  )
                ) : null}
              </div>
            ) : null}

            {collaborator.status === 'Resolved' &&
            collaborator.resolutionNote ? (
              <div className='mt-3 rounded-lg bg-[#eaf0ff] p-3 text-[11px] text-[#3057a6]'>
                <strong>Attribution resolved</strong>
                <p className='mt-1'>{collaborator.resolutionNote}</p>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {!item.collaborators.length && mode === 'mentor' ? (
        <p className='mt-4 rounded-lg border border-dashed border-[#d9e0dc] p-4 text-[11px] text-[#6f7c76]'>
          No collaborators were recorded. This contribution is attributed to the
          author only.
        </p>
      ) : null}

      {editable && mode === 'author' && onAddCollaborator ? (
        <div className='mt-5 border-t border-[#d9e0dc] pt-5'>
          <div className='flex items-center gap-2'>
            <Plus className='size-4 text-[#184b38]' aria-hidden='true' />
            <h3 className='text-[13px] font-bold'>Add collaborator</h3>
          </div>
          <p className='mt-1 text-[11px] text-[#6f7c76]'>
            Add a person who shared the work, then record the role they owned.
          </p>
          {!item.id ? (
            <p className='mt-3 rounded-lg bg-[#fff1d8] p-3 text-[11px] text-[#8a5200]'>
              Save this contribution first so the attribution can be attached to
              it.
            </p>
          ) : null}
          <div className='mt-4 grid gap-3 sm:grid-cols-3'>
            <label className={label}>
              Name *
              <input
                className={field}
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder='e.g. Alex Popescu'
              />
            </label>
            <label className={label}>
              Email *
              <input
                className={field}
                type='email'
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                placeholder='alex@example.com'
              />
            </label>
            <label className={label}>
              Role *
              <input
                className={field}
                value={newRole}
                onChange={(event) => setNewRole(event.target.value)}
                placeholder='e.g. UI implementation'
              />
            </label>
          </div>
          {formError ? (
            <p className='mt-3 text-[11px] text-[#a1332b]' role='alert'>
              {formError}
            </p>
          ) : null}
          <div className='mt-3 flex justify-end'>
            <button
              type='button'
              className={primary}
              disabled={
                !item.id ||
                !newName.trim() ||
                !newEmail.trim() ||
                !newRole.trim()
              }
              onClick={addCollaborator}
            >
              Add collaborator
            </button>
          </div>
        </div>
      ) : null}

      {showConfirmationPreview &&
      mode === 'author' &&
      item.collaborators.length ? (
        <div className='mt-5 border-t border-[#d9e0dc] pt-5'>
          <div className='rounded-lg bg-[#f5f7f6] p-4'>
            <h3 className='text-[13px] font-bold'>Collaborator confirmation</h3>
            <p className='mt-1 text-[11px] text-[#6f7c76]'>
              Preview the collaborator view to test confirmation or dispute
              handling. In the connected backend this is performed by the
              collaborator account.
            </p>
            <label className={`${label} mt-4 block`}>
              Collaborator
              <select
                className={field}
                value={confirmationId}
                onChange={(event) => {
                  setConfirmationId(event.target.value)
                  setDisputeId(null)
                }}
                disabled={isLocked}
              >
                <option value=''>Select a collaborator...</option>
                {item.collaborators.map((collaborator) => (
                  <option key={collaborator.id} value={collaborator.id}>
                    {collaborator.name} · {statusLabel(collaborator.status)}
                  </option>
                ))}
              </select>
            </label>
            {selectedForConfirmation && !isLocked ? (
              <div className='mt-3 flex flex-wrap justify-end gap-2'>
                <button
                  type='button'
                  className={secondary}
                  disabled={selectedForConfirmation.status === 'Confirmed'}
                  onClick={() => {
                    onConfirmParticipation?.(selectedForConfirmation.id)
                    setDisputeId(null)
                  }}
                >
                  Confirm participation
                </button>
                <button
                  type='button'
                  className='rounded-lg border border-[#efc1bb] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#a1332b] hover:bg-[#fde8e7] disabled:cursor-not-allowed disabled:opacity-50'
                  disabled={selectedForConfirmation.status === 'Disputed'}
                  onClick={startDispute}
                >
                  Dispute participation
                </button>
              </div>
            ) : null}
            {disputeId ? (
              <div className='mt-3 rounded-lg border border-[#efc1bb] bg-white p-3'>
                <label className={label}>
                  Why do you dispute this attribution? *
                  <textarea
                    className={`${field} min-h-20 resize-y`}
                    value={disputeReason}
                    onChange={(event) => setDisputeReason(event.target.value)}
                    placeholder='Explain what is inaccurate.'
                  />
                </label>
                <div className='mt-2 flex justify-end gap-2'>
                  <button
                    type='button'
                    className={secondary}
                    onClick={() => setDisputeId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    className={primary}
                    disabled={!disputeReason.trim()}
                    onClick={submitDispute}
                  >
                    Submit dispute
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
