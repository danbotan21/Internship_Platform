import { useState } from 'react'
import { Archive, ArchiveRestore, Globe, Lock, LogOut, MessageSquare, Settings, ShieldAlert, Trash2, UserMinus, X } from 'lucide-react'
import { useMessaging } from '../../hooks/useMessaging'
import { canManageChannel, canViewContact, otherMember } from '../../hooks/messagingStore'
import type { Conversation } from '../../types/messaging'
import Avatar from './Avatar'
import ChannelFormModal from './ChannelFormModal'
import ContactCard from './ContactCard'
import ContactsModal from './ContactsModal'
import { roleLabel } from './format'

type DetailsPanelProps = {
  conversation: Conversation
  onClose: () => void
}

export default function DetailsPanel({ conversation, onClose }: DetailsPanelProps) {
  return (
    <aside className="flex w-80 shrink-0 flex-col rounded-2xl bg-white">
      <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h3 className="font-semibold text-gray-900">{conversation.type === 'channel' ? 'Channel details' : 'Contact details'}</h3>
        <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close details">
          <X className="h-4.5 w-4.5" />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {conversation.type === 'channel' ? <ChannelDetails channel={conversation} /> : <DirectDetails conversation={conversation} />}
      </div>
    </aside>
  )
}

function DirectDetails({ conversation }: { conversation: Conversation }) {
  const { state, me } = useMessaging()
  const [editingMine, setEditingMine] = useState(false)
  const other = otherMember(state, conversation)

  return (
    <>
      {canViewContact(me, other) ? (
        <ContactCard user={other} compact />
      ) : (
        <div>
          <div className="flex items-center gap-3">
            <Avatar user={other} size="lg" showPresence />
            <div>
              <p className="font-semibold text-gray-900">{other.name}</p>
              <p className="text-xs text-gray-500">
                {roleLabel[other.role]} · {other.organization}
              </p>
            </div>
          </div>
          <p className="mt-4 flex gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
            <ShieldAlert className="h-4 w-4 shrink-0 text-gray-400" />
            Contact details are only shared between interns, their mentor and coordinators.
          </p>
        </div>
      )}

      <div className="mt-6 border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-500">Are your own details up to date?</p>
        <button onClick={() => setEditingMine(true)} className="mt-1 text-sm font-medium text-[#1e3a2c] hover:underline">
          Update my contact information
        </button>
      </div>
      {editingMine && <ContactsModal startEditing onClose={() => setEditingMine(false)} />}
    </>
  )
}

function ChannelDetails({ channel }: { channel: Conversation }) {
  const { state, me, updateChannel, deleteChannel, leaveChannel, removeMember, openDirectWith } = useMessaging()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const canManage = canManageChannel(me, channel)
  const VisibilityIcon = channel.visibility === 'public' ? Globe : Lock

  const members = channel.memberIds
    .map((id) => state.users[id])
    .sort((a, b) => Number(b.id === channel.ownerId) - Number(a.id === channel.ownerId) || a.name.localeCompare(b.name))

  const actionClass = 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'

  return (
    <>
      <p className="text-lg font-semibold text-gray-900">#{channel.name}</p>
      {channel.description && <p className="mt-1 text-sm text-gray-600">{channel.description}</p>}
      <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
        <VisibilityIcon className="h-3.5 w-3.5" />
        {channel.kind === 'team' ? 'Team' : 'Topic'} · {channel.visibility === 'public' ? 'Anyone can join' : 'Invite only'}
        {channel.ownerId && ` · Created by ${state.users[channel.ownerId]?.name}`}
      </p>

      <div className="mt-4 space-y-0.5 border-y border-gray-100 py-2">
        {canManage && (
          <>
            <button className={actionClass} onClick={() => setEditing(true)}>
              <Settings className="h-4 w-4 text-gray-400" /> Edit channel & members
            </button>
            <button className={actionClass} onClick={() => updateChannel(channel.id, { archived: !channel.archived })}>
              {channel.archived ? (
                <>
                  <ArchiveRestore className="h-4 w-4 text-gray-400" /> Unarchive channel
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 text-gray-400" /> Archive channel
                </>
              )}
            </button>
            {confirmDelete ? (
              <div className="rounded-lg bg-red-50 p-3 text-sm">
                <p className="text-red-700">Delete #{channel.name} and all its messages?</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => deleteChannel(channel.id)} className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700">
                    Delete
                  </button>
                  <button onClick={() => setConfirmDelete(false)} className="rounded-md px-3 py-1 text-xs text-gray-600 hover:bg-white">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button className={`${actionClass} text-red-600`} onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" /> Delete channel
              </button>
            )}
          </>
        )}
        {channel.ownerId !== me.id && (
          <button className={actionClass} onClick={() => leaveChannel(channel.id)}>
            <LogOut className="h-4 w-4 text-gray-400" /> Leave channel
          </button>
        )}
      </div>

      <h4 className="mt-4 mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">Members ({members.length})</h4>
      <ul className="space-y-1">
        {members.map((member) => (
          <li key={member.id} className="group flex items-center gap-3 rounded-lg px-1 py-1.5">
            <Avatar user={member} size="sm" showPresence />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-gray-900">
                {member.name}
                {member.id === me.id && <span className="text-gray-400"> (you)</span>}
              </p>
              <p className="text-[11px] text-gray-400">
                {member.id === channel.ownerId ? 'Owner' : roleLabel[member.role]} · {member.organization}
              </p>
            </div>
            {member.id !== me.id && (
              <button
                title={`Message ${member.name}`}
                onClick={() => openDirectWith(member.id)}
                className="rounded p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-700 focus:opacity-100"
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </button>
            )}
            {canManage && member.id !== me.id && member.id !== channel.ownerId && (
              <button
                title={`Remove ${member.name}`}
                onClick={() => removeMember(channel.id, member.id)}
                className="rounded p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 focus:opacity-100"
              >
                <UserMinus className="h-3.5 w-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {editing && <ChannelFormModal channel={channel} onClose={() => setEditing(false)} />}
    </>
  )
}
