import { useState } from 'react'
import type { Collaborator, ContributionCategory } from '../../../types/contribution'
import Alert from '../../ui/Alert'
import Button from '../../ui/Button'
import Field from '../../ui/Field'
import Modal from '../../ui/Modal'
import { inputBase, textareaBase } from '../../ui/styles'
import { categories, categoryMeta } from '../contributionLabels'

type CollaboratorEditorModalProps = {
  collaborator: Collaborator
  saving: boolean
  onClose: () => void
  onSave: (input: { area: ContributionCategory; roleDescription: string; resolutionNote: string | null }) => void
}

// Edit what a collaborator did; for a disputed attribution this is the answer.
export default function CollaboratorEditorModal({
  collaborator,
  saving,
  onClose,
  onSave,
}: CollaboratorEditorModalProps) {
  const [area, setArea] = useState(collaborator.area)
  const [roleDescription, setRoleDescription] = useState(collaborator.roleDescription)
  const [resolutionNote, setResolutionNote] = useState('')
  const disputed = collaborator.status === 'disputed'
  const valid =
    roleDescription.trim().length >= 10 && (!disputed || resolutionNote.trim().length >= 10)

  return (
    <Modal
      title={disputed ? `Answer ${collaborator.name}'s dispute` : `Edit ${collaborator.name}'s role`}
      description='Changing the role asks the collaborator to confirm again.'
      onClose={onClose}
      footer={
        <>
          <Button variant='secondary' onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={saving}
            disabled={!valid}
            onClick={() =>
              onSave({
                area,
                roleDescription: roleDescription.trim(),
                resolutionNote: disputed ? resolutionNote.trim() : null,
              })
            }
          >
            {disputed ? 'Send answer' : 'Save role'}
          </Button>
        </>
      }
    >
      <div className='space-y-4'>
        {disputed ? (
          <Alert tone='danger' title={`${collaborator.name} disputes this attribution`}>
            {collaborator.disputeReason}
          </Alert>
        ) : null}
        <Field label='Area of work' htmlFor='edit-area'>
          <select
            id='edit-area'
            className={inputBase}
            value={area}
            onChange={(event) => setArea(event.target.value as ContributionCategory)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {categoryMeta[category].label}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label='What did they do?'
          htmlFor='edit-role'
          required
          counter={{ value: roleDescription.trim().length, min: 10, max: 300 }}
        >
          <textarea
            id='edit-role'
            className={`${textareaBase} min-h-20`}
            maxLength={300}
            value={roleDescription}
            onChange={(event) => setRoleDescription(event.target.value)}
          />
        </Field>
        {disputed ? (
          <Field
            label={`Message to ${collaborator.name}`}
            htmlFor='edit-resolution'
            required
            counter={{ value: resolutionNote.trim().length, min: 10, max: 1000 }}
            hint='Explain what you changed. If they were not involved at all, remove them instead.'
          >
            <textarea
              id='edit-resolution'
              className={`${textareaBase} min-h-20`}
              maxLength={1000}
              value={resolutionNote}
              onChange={(event) => setResolutionNote(event.target.value)}
            />
          </Field>
        ) : null}
      </div>
    </Modal>
  )
}
