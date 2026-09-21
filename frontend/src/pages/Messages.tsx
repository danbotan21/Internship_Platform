import { useState } from 'react'
import ChatPanel from '../components/messages/ChatPanel'
import ConversationList from '../components/messages/ConversationList'
import DetailsPanel from '../components/messages/DetailsPanel'
import MessagesTopBar from '../components/messages/MessagesTopBar'
import MessagingProvider from '../components/messages/MessagingProvider'
import ThreadPanel from '../components/messages/ThreadPanel'
import UpdatesFeed from '../components/messages/UpdatesFeed'
import { useMessaging } from '../hooks/useMessaging'

type SidePanel = { conversationId: string; kind: 'details' } | { conversationId: string; kind: 'thread'; messageId: string }

export default function Messages() {
  return (
    <MessagingProvider>
      <MessagesView />
    </MessagingProvider>
  )
}

function MessagesView() {
  const { state } = useMessaging()
  const [sidePanel, setSidePanel] = useState<SidePanel | null>(null)

  const active = state.conversations.find(
    (conversation) =>
      conversation.id === state.activeConversationId && conversation.memberIds.includes(state.currentUserId),
  )
  // A side panel belongs to the conversation it was opened in.
  const panel = active && sidePanel?.conversationId === active.id ? sidePanel : null

  return (
    <div className="flex h-full min-h-0 flex-col">
      <MessagesTopBar />
      <div className="flex min-h-0 flex-1 gap-4">
        <ConversationList />
        {active ? (
          <ChatPanel
            key={active.id}
            conversation={active}
            detailsOpen={panel?.kind === 'details'}
            onToggleDetails={() =>
              setSidePanel(panel?.kind === 'details' ? null : { conversationId: active.id, kind: 'details' })
            }
            onOpenThread={(messageId) => setSidePanel({ conversationId: active.id, kind: 'thread', messageId })}
          />
        ) : (
          <UpdatesFeed />
        )}
        {active && panel?.kind === 'details' && <DetailsPanel conversation={active} onClose={() => setSidePanel(null)} />}
        {active && panel?.kind === 'thread' && (
          <ThreadPanel
            key={panel.messageId}
            conversation={active}
            parentId={panel.messageId}
            onClose={() => setSidePanel(null)}
          />
        )}
      </div>
    </div>
  )
}
