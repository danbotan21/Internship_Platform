import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useMessaging } from '../../hooks/useMessaging'
import type { Conversation } from '../../types/messaging'
import Composer from './Composer'
import MessageItem from './MessageItem'

type ThreadPanelProps = {
  conversation: Conversation
  parentId: string
  onClose: () => void
}

export default function ThreadPanel({ conversation, parentId, onClose }: ThreadPanelProps) {
  const { state, sendMessage } = useMessaging()
  const scrollRef = useRef<HTMLDivElement>(null)

  const parent = state.messages.find((message) => message.id === parentId)
  const replies = state.messages
    .filter((message) => message.parentId === parentId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [replies.length])

  if (!parent) return null

  return (
    <aside className="flex w-96 shrink-0 flex-col rounded-2xl bg-white">
      <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <h3 className="font-semibold text-gray-900">Thread</h3>
          <p className="text-xs text-gray-500">#{conversation.name}</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close thread">
          <X className="h-4.5 w-4.5" />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-4">
        <MessageItem message={parent} conversation={conversation} />
        <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
          <span>
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </span>
          <span className="h-px flex-1 bg-gray-100" />
        </div>
        {replies.map((reply, index) => (
          <MessageItem
            key={reply.id}
            message={reply}
            conversation={conversation}
            grouped={replies[index - 1]?.authorId === reply.authorId}
            showStatusLabel={index === replies.length - 1}
          />
        ))}
      </div>

      <footer className="px-5 pb-5">
        <Composer
          placeholder="Reply to thread…"
          disabled={conversation.archived}
          disabledReason="This channel is archived."
          onSend={(body, attachment) => sendMessage(conversation.id, body, { parentId, attachment })}
        />
      </footer>
    </aside>
  )
}
