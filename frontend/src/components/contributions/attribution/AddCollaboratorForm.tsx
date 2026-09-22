import { Sparkles, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { contributionApi } from '../../../api/contributions'
import type { CollaboratorInput, ContributionCategory, ContributionDetails } from '../../../types/contribution'
import type { InternshipMember } from '../../../types/user'
import Alert from '../../ui/Alert'
import Button from '../../ui/Button'
import Field from '../../ui/Field'
import { inputBase, textareaBase } from '../../ui/styles'
import { categories, categoryMeta } from '../contributionLabels'

type AddCollaboratorFormProps = {
  contribution: ContributionDetails
  adding: boolean
  onAdd: (input: CollaboratorInput) => Promise<boolean>
}

// Collaborators come from the mentor's team; GitHub co-authors are suggested.
export default function AddCollaboratorForm({ contribution, adding, onAdd }: AddCollaboratorFormProps) {
  const [team, setTeam] = useState<InternshipMember[]>([])
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [area, setArea] = useState<ContributionCategory>(contribution.currentRevision.category)
  const [roleDescription, setRoleDescription] = useState('')

  useEffect(() => {
    contributionApi
      .teamMembers()
      .then(setTeam)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Team unavailable.'))
  }, [])

  const listed = new Set(contribution.collaborators.map((item) => item.userId))
  const available = team.filter((member) => !listed.has(member.userId))
  const suggestions = contribution.suggestedCollaborators.filter((member) => !listed.has(member.userId))

  const submit = async () => {
    const added = await onAdd({ userId, area, roleDescription: roleDescription.trim() })
    if (added) {
      setUserId('')
      setRoleDescription('')
    }
  }

  return (
    <div className='space-y-4 rounded-xl border border-[#e3e8e5] bg-[#fafbfa] p-4'>
      <div className='flex items-center gap-2'>
        <UserPlus className='size-4 text-[#184b38]' aria-hidden='true' />
        <p className='text-[14px] font-semibold text-[#14211b]'>Add a teammate</p>
      </div>
      {error ? <Alert tone='warning'>{error}</Alert> : null}

      {suggestions.length ? (
        <div className='flex flex-wrap items-center gap-2'>
          <span className='inline-flex items-center gap-1 text-[12px] font-semibold text-[#6b3fa0]'>
            <Sparkles className='size-3.5' aria-hidden='true' />
            Found in your GitHub evidence:
          </span>
          {suggestions.map((member) => (
            <button
              key={member.userId}
              type='button'
              onClick={() => setUserId(member.userId)}
              className={`rounded-full border px-2.5 py-1 text-[12px] font-medium ${
                userId === member.userId
                  ? 'border-[#6b3fa0] bg-[#f3eafc] text-[#6b3fa0]'
                  : 'border-[#e0d4f0] bg-white text-[#6b3fa0] hover:bg-[#f7f1fd]'
              }`}
            >
              {member.fullName}
              {member.gitHubUsername ? ` (@${member.gitHubUsername})` : ''}
            </button>
          ))}
        </div>
      ) : null}

      <div className='grid gap-3 sm:grid-cols-2'>
        <Field label='Teammate' htmlFor='collaborator-member' required>
          <select
            id='collaborator-member'
            className={inputBase}
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          >
            <option value=''>Choose a student of your team…</option>
            {available.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.fullName}
                {member.gitHubUsername ? ` (@${member.gitHubUsername})` : ''}
              </option>
            ))}
          </select>
        </Field>
        <Field label='Area of work' htmlFor='collaborator-area'>
          <select
            id='collaborator-area'
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
      </div>
      <Field
        label='What did they do?'
        htmlFor='collaborator-role'
        required
        counter={{ value: roleDescription.trim().length, min: 10, max: 300 }}
        hint='Be specific — they will be asked to confirm exactly this.'
      >
        <textarea
          id='collaborator-role'
          className={`${textareaBase} min-h-20`}
          maxLength={300}
          value={roleDescription}
          onChange={(event) => setRoleDescription(event.target.value)}
          placeholder='e.g. Wrote the integration tests for the review endpoint'
        />
      </Field>
      <div className='flex justify-end'>
        <Button
          icon={UserPlus}
          loading={adding}
          disabled={!userId || roleDescription.trim().length < 10}
          onClick={() => void submit()}
        >
          Add collaborator
        </Button>
      </div>
    </div>
  )
}
