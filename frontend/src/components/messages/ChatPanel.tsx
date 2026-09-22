import { Fragment, useEffect, useRef } from 'react'
import { Archive, Info } from 'lucide-react'
import { useMessaging } from '../../hooks/useMessaging'
import { otherMember, unreadCount } from '../../hooks/messagingStore'
import type { Conversation, Message } from '../../types/messaging'
import Avatar from './Avatar'
import Composer from './Composer'
import { formatDayLabel, formatLastSeen, isSameDay, roleLabel } from './format'
import MessageItem from './MessageItem'

const GROUP_WINDOW_MS = 5 * 60_000

type ChatPanelProps = {
  conversation: Conversation
  detailsOpen: boolean
  onToggleDetails: () => void
  onOpenThread: (messageId: string) => void
}

export default function ChatPanel({ conversation, detailsOpen, onToggleDetails, onOpenThread }: ChatPanelProps) {
  const { state, me, sendMessage, markConversationRead } = useMessaging()
  const scrollRef = useRef<HTMLDivElement>(null)

  const all = state.messages
    .filter((message) => message.conversationId === conversation.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const topLevel = all.filter((message) => !message.parentId)
  const repliesByParent = new Map<string, Message[]>()
  for (const message of all) {
    if (message.parentId) repliesByParent.set(message.parentId, [...(repliesByParent.get(message.parentId) ?? []), message])
  }
  const lastOwnId = [...topLevel].reverse().find((message) => message.authorId === me.id)?.id

  const unread = unreadCount(state, conversation.id)
  useEffect(() => {
    if (unread > 0) markConversationRead(conversation.id)
  }, [unread, conversation.id, markConversationRead])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [conversation.id, topLevel.length])

  const isChannel = conversation.type === 'channel'
  const other = isChannel ? undefined : otherMember(state, conversation)
  const title = isChannel ? conversation.name : other?.name
  const subtitle = other
    ? `${roleLabel[other.role]} · ${other.organization} · ${formatLastSeen(other.lastSeenAt)}`
    : `${conversation.kind === 'team' ? 'Team' : 'Topic'} channel · ${conversation.memberIds.length} members${
        conversation.description ? ` · ${conversation.description}` : ''
      }`

  return (
    <section className="flex min-w-0 flex-1 flex-col rounded-2xl bg-white">
      <header className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
        {other ? (
          <Avatar user={other} showPresence />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-lg font-semibold text-white">#</span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold text-gray-900">{title}</h2>
          <p className="truncate text-xs text-gray-500">{subtitle}</p>
        </div>
        <button
          onClick={onToggleDetails}
          title={isChannel ? 'Channel details' : 'Contact details'}
          aria-pressed={detailsOpen}
          className={`rounded-full p-2 ${detailsOpen ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <Info className="h-5 w-5" />
        </button>
      </header>

      {conversation.archived && (
        <div className="flex items-center gap-2 bg-amber-50 px-6 py-2 text-xs text-amber-800">
          <Archive className="h-3.5 w-3.5" />
          This channel is archived. Messages are read-only.
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-4">
        {topLevel.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-gray-700">Start the conversation</p>
            <p className="mt-1 text-xs text-gray-400">
              {isChannel ? 'Posts here are visible to every channel member.' : `Messages to ${other?.name} are private.`}
            </p>
          </div>
        )}

        {topLevel.map((message, index) => {
          const previous = topLevel[index - 1]
          const newDay = !previous || !isSameDay(previous.createdAt, message.createdAt)
          const grouped =
            !newDay &&
            previous.authorId === message.authorId &&
            !repliesByParent.has(previous.id) &&
            new Date(message.createdAt).getTime() - new Date(previous.createdAt).getTime() < GROUP_WINDOW_MS

          return (
            <Fragment key={message.id}>
              {newDay && (
                <p className="mt-5 mb-1 text-center text-xs text-gray-400">{formatDayLabel(message.createdAt)}</p>
              )}
              <MessageItem
                message={message}
                conversation={conversation}
                grouped={grouped}
                showStatusLabel={message.id === lastOwnId}
                replies={repliesByParent.get(message.id)}
                onOpenThread={isChannel ? () => onOpenThread(message.id) : undefined}
              />
            </Fragment>
          )
        })}
      </div>

      <footer className="px-6 pb-5">
        <Composer
          placeholder={`Write a message to ${isChannel ? `#${title}` : title}…`}
          disabled={conversation.archived}
          disabledReason="This channel is archived."
          onSend={(body, attachment) => sendMessage(conversation.id, body, { attachment })}
        />
      </footer>
    </section>
  )
}
