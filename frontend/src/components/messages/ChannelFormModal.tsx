import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMessaging } from '../../hooks/useMessaging'
import type { ChannelInput } from '../../hooks/useMessaging'
import type { Conversation } from '../../types/messaging'
import Avatar from './Avatar'
import Field from './Field'
import { roleLabel } from './format'
import Modal from './Modal'
import { inputClass, primaryButton, secondaryButton } from './styles'

type ChannelFormModalProps = {
  onClose: () => void
  /** When given, the form edits this channel instead of creating a new one. */
  channel?: Conversation
}

export default function ChannelFormModal({ onClose, channel }: ChannelFormModalProps) {
  const { state, me, createChannel, updateChannel } = useMessaging()
  const [form, setForm] = useState<ChannelInput>({
    name: channel?.name ?? '',
    description: channel?.description ?? '',
    kind: channel?.kind ?? 'team',
    visibility: channel?.visibility ?? 'private',
    memberIds: channel?.memberIds.filter((id) => id !== me.id) ?? [],
  })
  const [memberQuery, setMemberQuery] = useState('')

  const nameTaken = state.conversations.some(
    (conversation) =>
      conversation.type === 'channel' &&
      conversation.id !== channel?.id &&
      conversation.name?.toLowerCase() === form.name.trim().toLowerCase(),
  )
  const valid = form.name.trim().length >= 3 && !nameTaken

  const candidates = Object.values(state.users)
    .filter((user) => user.id !== me.id)
    .filter((user) => user.name.toLowerCase().includes(memberQuery.trim().toLowerCase()))
    .sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name))

  const toggleMember = (userId: string) =>
    setForm((current) => ({
      ...current,
      memberIds: current.memberIds.includes(userId)
        ? current.memberIds.filter((id) => id !== userId)
        : [...current.memberIds, userId],
    }))

  const selectMyInterns = () =>
    setForm((current) => ({
      ...current,
      memberIds: Array.from(
        new Set([
          ...current.memberIds,
          ...Object.values(state.users)
            .filter((user) => user.mentorId === me.id)
            .map((user) => user.id),
        ]),
      ),
    }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!valid) return
    if (channel) {
      // Keep the owner in the channel even if they unticked themselves elsewhere.
      const memberIds = Array.from(new Set([me.id, channel.ownerId ?? me.id, ...form.memberIds]))
      updateChannel(channel.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        kind: form.kind,
        visibility: form.visibility,
        memberIds,
      })
    } else {
      createChannel(form)
    }
    onClose()
  }

  return (
    <Modal
      title={channel ? 'Channel settings' : 'Create a group channel'}
      description={channel ? undefined : 'Organise discussions by team or topic.'}
      onClose={onClose}
      footer={
        <>
          <button className={secondaryButton} onClick={onClose}>
            Cancel
          </button>
          <button className={primaryButton} type="submit" form="channel-form" disabled={!valid}>
            {channel ? 'Save changes' : 'Create channel'}
          </button>
        </>
      }
    >
      <form id="channel-form" onSubmit={submit} className="space-y-4">
        <Field
          label="Channel name"
          error={nameTaken ? 'A channel with this name already exists' : undefined}
        >
          <input
            autoFocus
            className={inputClass}
            placeholder="e.g. TechNova · UTM-03 or react-help"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Description">
          <textarea
            rows={2}
            className={`${inputClass} resize-none`}
            placeholder="What is this channel about?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Organised by">
            <select
              className={inputClass}
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value as ChannelInput['kind'] })}
            >
              <option value="team">Team</option>
              <option value="topic">Topic</option>
            </select>
          </Field>
          <Field label="Who can join">
            <select
              className={inputClass}
              value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value as ChannelInput['visibility'] })}
            >
              <option value="private">Invited members only</option>
              <option value="public">Anyone can join</option>
            </select>
          </Field>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Members ({form.memberIds.length + 1})</span>
            {me.role === 'mentor' && (
              <button type="button" onClick={selectMyInterns} className="text-xs font-medium text-[#1e3a2c] hover:underline">
                Add all my interns
              </button>
            )}
          </div>
          <input
            className={`${inputClass} mb-2`}
            placeholder="Search people"
            value={memberQuery}
            onChange={(e) => setMemberQuery(e.target.value)}
          />
          <ul className="max-h-48 space-y-0.5 overflow-y-auto rounded-lg border border-gray-100 p-1">
            {candidates.map((user) => (
              <li key={user.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    className="accent-[#1e3a2c]"
                    checked={form.memberIds.includes(user.id)}
                    disabled={user.id === channel?.ownerId}
                    onChange={() => toggleMember(user.id)}
                  />
                  <Avatar user={user} size="xs" />
                  <span className="flex-1 text-sm text-gray-800">{user.name}</span>
                  <span className="text-xs text-gray-400">
                    {roleLabel[user.role]} · {user.organization}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </form>
    </Modal>
  )
}
