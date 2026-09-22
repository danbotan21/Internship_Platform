import { MessageSquareReply, Pencil, Trash2 } from 'lucide-react'
import type { Collaborator } from '../../../types/contribution'
import Avatar from '../../ui/Avatar'
import Button from '../../ui/Button'
import { categoryMeta, collaboratorStatusMeta } from '../contributionLabels'

type CollaboratorCardProps = {
  collaborator: Collaborator
  isViewer?: boolean
  canEdit?: boolean
  canAnswerDispute?: boolean
  busy?: boolean
  onEdit?: () => void
  onRemove?: () => void
}

export default function CollaboratorCard({
  collaborator,
  isViewer,
  canEdit,
  canAnswerDispute,
  busy,
  onEdit,
  onRemove,
}: CollaboratorCardProps) {
  const status = collaboratorStatusMeta[collaborator.status]
  const disputed = collaborator.status === 'disputed'
  const AreaIcon = categoryMeta[collaborator.area].icon
  const showActions = canEdit || (disputed && canAnswerDispute)

  return (
    <li
      className={`rounded-xl border p-4 ${
        disputed ? 'border-[#efc1bb] bg-[#fffafa]' : isViewer ? 'border-[#b9cfc3] bg-[#f7fbf9]' : 'border-[#e3e8e5]'
      }`}
    >
      <div className='flex flex-wrap items-start gap-3'>
        <Avatar name={collaborator.name} />
        <div className='min-w-0 flex-1'>
          <p className='text-[14px] font-semibold text-[#14211b]'>
            {collaborator.name}
            {isViewer ? <span className='ml-1.5 text-[12px] font-medium text-[#2b6a50]'>(you)</span> : null}
          </p>
          <p className='text-[12px] text-[#8a958f]'>
            {collaborator.gitHubUsername ? `@${collaborator.gitHubUsername} · ` : ''}
            {collaborator.email}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${status.tone}`}>{status.label}</span>
      </div>

      <div className='mt-3 flex gap-2 rounded-lg bg-[#f7f9f8] px-3 py-2.5'>
        <AreaIcon className='mt-0.5 size-4 shrink-0 text-[#2b6a50]' aria-hidden='true' />
        <p className='text-[13px] text-[#2b3833]'>
          <span className='font-semibold'>{categoryMeta[collaborator.area].label}:</span>{' '}
          {collaborator.roleDescription}
        </p>
      </div>

      {collaborator.disputeReason && disputed ? (
        <p className='mt-3 text-[13px] text-[#a1332b]'>
          <span className='font-semibold'>Dispute:</span> {collaborator.disputeReason}
        </p>
      ) : null}
      {collaborator.resolutionNote && !disputed ? (
        <div className='mt-3 space-y-1 text-[12px] text-[#5d6b64]'>
          {collaborator.disputeReason ? <p>Previously disputed: “{collaborator.disputeReason}”</p> : null}
          <p className='flex gap-1.5'>
            <MessageSquareReply className='mt-0.5 size-3.5 shrink-0 text-[#2b6a50]' aria-hidden='true' />
            Author's answer: {collaborator.resolutionNote}
          </p>
        </div>
      ) : null}

      {showActions ? (
        <div className='mt-3 flex flex-wrap justify-end gap-2'>
          <Button variant='secondary' size='sm' icon={disputed ? MessageSquareReply : Pencil} disabled={busy} onClick={onEdit}>
            {disputed ? 'Answer dispute' : 'Edit role'}
          </Button>
          <Button variant='danger' size='sm' icon={Trash2} disabled={busy} onClick={onRemove}>
            Remove
          </Button>
        </div>
      ) : null}
    </li>
  )
}
