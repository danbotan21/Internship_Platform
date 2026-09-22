import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { useMessaging } from '../../hooks/useMessaging'
import { conversationTitle, visibleConversations } from '../../hooks/messagingStore'
import { formatListTime } from './format'
import NotificationsMenu from './NotificationsMenu'

export default function MessagesTopBar() {
  const { state, openConversation } = useMessaging()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const term = query.trim().toLowerCase()
  const conversations = visibleConversations(state)
  const results = term
    ? state.messages
        .filter((message) => message.body.toLowerCase().includes(term))
        .flatMap((message) => {
          const conversation = conversations.find((item) => item.id === message.conversationId)
          return conversation ? [{ message, conversation }] : []
        })
        .sort((a, b) => b.message.createdAt.localeCompare(a.message.createdAt))
        .slice(0, 8)
    : []

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-gray-500">
        Workspace <span className="text-gray-300">/</span> <span className="text-gray-700">Messages</span>
      </p>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 150)}
            placeholder="Search messages…  Ctrl K"
            className="w-64 rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-9 text-sm outline-none placeholder:text-gray-400 focus:border-[#1e3a2c]"
          />
          {focused && term && (
            <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
              {results.length === 0 && <p className="px-4 py-6 text-center text-sm text-gray-400">No messages match “{query}”.</p>}
              {results.map(({ message, conversation }) => (
                <button
                  key={message.id}
                  onClick={() => {
                    openConversation(message.conversationId)
                    setQuery('')
                  }}
                  className="block w-full px-4 py-2.5 text-left hover:bg-gray-50"
                >
                  <span className="flex justify-between gap-2 text-xs text-gray-400">
                    <span className="truncate">
                      {conversationTitle(state, conversation)} · {state.users[message.authorId].name}
                    </span>
                    <span className="shrink-0">{formatListTime(message.createdAt)}</span>
                  </span>
                  <span className="line-clamp-2 text-sm text-gray-800">{message.body}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <NotificationsMenu />
      </div>
    </div>
  )
}
