import { Users } from 'lucide-react'
import { useState } from 'react'
import type {
  Collaborator,
  CollaboratorInput,
  ContributionCategory,
  ContributionDetails,
} from '../../../types/contribution'
import Avatar from '../../ui/Avatar'
import { card, sectionTitle } from '../../ui/styles'
import AddCollaboratorForm from './AddCollaboratorForm'
import CollaboratorCard from './CollaboratorCard'
import CollaboratorEditorModal from './CollaboratorEditorModal'

type AttributionPanelProps = {
  contribution: ContributionDetails
  viewerId?: string
  // Author may add/edit/remove while editable, and answer disputes while in review.
  canEdit?: boolean
  canAnswerDisputes?: boolean
  busy?: boolean
  onAdd?: (input: CollaboratorInput) => Promise<boolean>
  onUpdate?: (
    collaborator: Collaborator,
    input: { area: ContributionCategory; roleDescription: string; resolutionNote: string | null },
  ) => Promise<boolean>
  onRemove?: (collaborator: Collaborator) => void
}

export default function AttributionPanel({
  contribution,
  viewerId,
  canEdit,
  canAnswerDisputes,
  busy,
  onAdd,
  onUpdate,
  onRemove,
}: AttributionPanelProps) {
  const [editing, setEditing] = useState<Collaborator | null>(null)
  const collaborators = contribution.collaborators
  const confirmed = collaborators.filter((item) => item.status === 'confirmed').length

  return (
    <section className={`${card} p-5`}>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <Users className='size-4 text-[#2b6a50]' aria-hidden='true' />
          <h2 className={sectionTitle}>Attribution</h2>
        </div>
        <span className='text-[12px] text-[#5d6b64]'>
          {collaborators.length
            ? `${confirmed} of ${collaborators.length} collaborator${collaborators.length === 1 ? '' : 's'} confirmed`
            : 'Individual contribution'}
        </span>
      </div>

      <ul className='mt-4 space-y-3'>
        <li className='flex items-center gap-3 rounded-xl border border-[#e3e8e5] p-4'>
          <Avatar name={contribution.student.fullName} />
          <div className='min-w-0 flex-1'>
            <p className='text-[14px] font-semibold text-[#14211b]'>
              {contribution.student.fullName}
              {viewerId === contribution.student.userId ? (
                <span className='ml-1.5 text-[12px] font-medium text-[#2b6a50]'>(you)</span>
              ) : null}
            </p>
            <p className='text-[12px] text-[#8a958f]'>
              Author{contribution.student.gitHubUsername ? ` · @${contribution.student.gitHubUsername}` : ''}
            </p>
          </div>
        </li>
        {collaborators.map((collaborator) => (
          <CollaboratorCard
            key={collaborator.id}
            collaborator={collaborator}
            isViewer={viewerId === collaborator.userId}
            canEdit={canEdit}
            canAnswerDispute={canAnswerDisputes}
            busy={busy}
            onEdit={() => setEditing(collaborator)}
            onRemove={() => onRemove?.(collaborator)}
          />
        ))}
      </ul>

      {canEdit && onAdd ? (
        <div className='mt-4'>
          <AddCollaboratorForm contribution={contribution} adding={Boolean(busy)} onAdd={onAdd} />
        </div>
      ) : null}

      {editing && onUpdate ? (
        <CollaboratorEditorModal
          collaborator={editing}
          saving={Boolean(busy)}
          onClose={() => setEditing(null)}
          onSave={(input) =>
            void onUpdate(editing, input).then((saved) => {
              if (saved) setEditing(null)
            })
          }
        />
      ) : null}
    </section>
  )
}
