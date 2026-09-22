import { Globe, Hash, Lock } from 'lucide-react'
import { useMessaging } from '../../hooks/useMessaging'
import Modal from './Modal'
import { primaryButton, secondaryButton } from './styles'

export default function BrowseChannelsModal({ onClose }: { onClose: () => void }) {
  const { state, me, joinChannel, openConversation } = useMessaging()

  const channels = state.conversations
    .filter((conversation) => conversation.type === 'channel' && !conversation.archived)
    .filter((conversation) => conversation.visibility === 'public' || conversation.memberIds.includes(me.id))
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))

  const open = (conversationId: string) => {
    openConversation(conversationId)
    onClose()
  }

  return (
    <Modal title="Browse channels" description="Join group channels to discuss shared topics with other interns." onClose={onClose}>
      <ul className="divide-y divide-gray-100">
        {channels.map((channel) => {
          const joined = channel.memberIds.includes(me.id)
          const VisibilityIcon = channel.visibility === 'public' ? Globe : Lock
          return (
            <li key={channel.id} className="flex items-center gap-3 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                <Hash className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                  {channel.name}
                  <VisibilityIcon className="h-3 w-3 text-gray-400" />
                </p>
                <p className="truncate text-xs text-gray-500">{channel.description}</p>
                <p className="text-[11px] text-gray-400">
                  {channel.kind === 'team' ? 'Team' : 'Topic'} · {channel.memberIds.length} members
                </p>
              </div>
              {joined ? (
                <button className={secondaryButton} onClick={() => open(channel.id)}>
                  Open
                </button>
              ) : (
                <button
                  className={primaryButton}
                  onClick={() => {
                    joinChannel(channel.id)
                    open(channel.id)
                  }}
                >
                  Join
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}
