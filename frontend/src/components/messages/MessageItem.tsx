import { Check, CheckCheck, FileText, MessageSquareReply } from 'lucide-react'
import { useMessaging } from '../../hooks/useMessaging'
import { deliveryStatus } from '../../hooks/messagingStore'
import type { Conversation, Message } from '../../types/messaging'
import Avatar from './Avatar'
import { formatClock, formatFileSize, formatListTime } from './format'

type MessageItemProps = {
  message: Message
  conversation: Conversation
  /** Hide avatar and name when the previous message is from the same author. */
  grouped?: boolean
  /** Show the textual status ("Read", "Delivered") — only on the latest own message. */
  showStatusLabel?: boolean
  replies?: Message[]
  onOpenThread?: () => void
}

export default function MessageItem({
  message,
  conversation,
  grouped = false,
  showStatusLabel = false,
  replies = [],
  onOpenThread,
}: MessageItemProps) {
  const { state, me } = useMessaging()
  const mine = message.authorId === me.id
  const author = state.users[message.authorId]
  const lastReply = replies[replies.length - 1]

  const content = (
    <>
      {message.body && (
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap ${
            mine ? 'bg-[#1e3a2c] text-white' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {message.body}
        </div>
      )}
      {message.attachment && (
        <div
          className={`mt-1 flex items-center gap-3 rounded-xl px-4 py-2.5 ${
            mine ? 'bg-[#1e3a2c] text-white' : 'border border-gray-200 bg-white text-gray-800'
          }`}
        >
          <FileText className={`h-5 w-5 shrink-0 ${mine ? 'text-white/70' : 'text-gray-400'}`} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{message.attachment.name}</p>
            <p className={`text-xs ${mine ? 'text-white/60' : 'text-gray-400'}`}>{formatFileSize(message.attachment.size)}</p>
          </div>
        </div>
      )}
    </>
  )

  const replySummary = replies.length > 0 && onOpenThread && (
    <button onClick={onOpenThread} className="mt-1 flex items-center gap-2 text-xs font-medium text-[#2f6b55] hover:underline">
      <span className="flex -space-x-1.5">
        {Array.from(new Set(replies.map((reply) => reply.authorId)))
          .slice(0, 3)
          .map((id) => (
            <span key={id} className="rounded-full ring-2 ring-white">
              <Avatar user={state.users[id]} size="xs" />
            </span>
          ))}
      </span>
      {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
      <span className="font-normal text-gray-400">Last reply {formatListTime(lastReply.createdAt)}</span>
    </button>
  )

  const replyButton = onOpenThread && !conversation.archived && (
    <button
      onClick={onOpenThread}
      title="Reply in thread"
      className="self-center rounded-lg p-1.5 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-700 focus:opacity-100"
    >
      <MessageSquareReply className="h-4 w-4" />
    </button>
  )

  if (mine) {
    return (
      <div className={`group flex justify-end gap-1 ${grouped ? 'mt-1' : 'mt-4'}`}>
        {replyButton}
        <div className="flex max-w-[70%] flex-col items-end">
          {content}
          <StatusLine message={message} conversation={conversation} showLabel={showStatusLabel} />
          {replySummary}
        </div>
      </div>
    )
  }

  return (
    <div className={`group flex gap-3 ${grouped ? 'mt-1' : 'mt-4'}`}>
      <div className="w-8 shrink-0">{!grouped && <Avatar user={author} size="sm" />}</div>
      <div className="flex max-w-[70%] flex-col items-start">
        {!grouped && (
          <p className="mb-1 text-xs">
            <span className="font-semibold text-gray-900">{author.name}</span>
            <span className="ml-2 text-gray-400">{formatClock(message.createdAt)}</span>
          </p>
        )}
        {content}
        {replySummary}
      </div>
      {replyButton}
    </div>
  )
}

function StatusLine({ message, conversation, showLabel }: { message: Message; conversation: Conversation; showLabel: boolean }) {
  const { state } = useMessaging()
  const status = deliveryStatus(message, conversation)
  const recipients = conversation.memberIds.filter((id) => id !== message.authorId)
  const readers = message.readBy.filter((id) => recipients.includes(id))

  const label =
    status === 'read'
      ? conversation.type === 'direct'
        ? 'Read'
        : 'Seen by everyone'
      : readers.length > 0 && conversation.type === 'channel'
        ? `Seen by ${readers.length} of ${recipients.length}`
        : status === 'delivered'
          ? 'Delivered'
          : 'Sent'

  const tooltip =
    readers.length > 0 ? `Seen by ${readers.map((id) => state.users[id].name).join(', ')}` : label

  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-400" title={tooltip}>
      {formatClock(message.createdAt)}
      {status === 'sent' ? (
        <Check className="h-3.5 w-3.5" aria-label="Sent" />
      ) : (
        <CheckCheck className={`h-3.5 w-3.5 ${status === 'read' ? 'text-orange-500' : ''}`} aria-label={label} />
      )}
      {showLabel && <span>{label}</span>}
    </p>
  )
}
