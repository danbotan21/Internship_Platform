import { useState } from 'react'
import type { ReactNode } from 'react'
import { Contact, Hash, Megaphone, Plus, Search } from 'lucide-react'
import { useMessaging } from '../../hooks/useMessaging'
import {
  canCreateChannels,
  conversationTitle,
  isUnreadNotification,
  lastMessage,
  notificationsFor,
  otherMember,
  unreadCount,
  visibleConversations,
} from '../../hooks/messagingStore'
import type { MessagingState } from '../../hooks/messagingStore'
import type { Conversation, User } from '../../types/messaging'
import { UPDATES_ID } from '../../types/messaging'
import Avatar from './Avatar'
import BrowseChannelsModal from './BrowseChannelsModal'
import ChannelFormModal from './ChannelFormModal'
import ContactsModal from './ContactsModal'
import { formatListTime } from './format'

type Filter = 'all' | 'people' | 'team' | 'unread'

function conversationTag(me: User, state: MessagingState, conversation: Conversation) {
  if (conversation.type === 'channel') {
    return conversation.kind === 'team'
      ? { label: 'Team', className: 'bg-gray-500 text-white' }
      : { label: 'Channel', className: 'bg-gray-200 text-gray-700' }
  }
  const other = otherMember(state, conversation)
  const strong = 'bg-[#2f5d47] text-white'
  if (other.role === 'mentor') return { label: 'Mentor', className: strong }
  if (other.role === 'coordinator') return { label: 'Coordinator', className: strong }
  if (other.role === 'admin') return { label: 'Admin', className: strong }
  if (me.role !== 'intern' && (other.mentorId === me.id || me.role === 'coordinator')) {
    return { label: 'Intern', className: strong }
  }
  return { label: 'Peer', className: 'bg-gray-400 text-white' }
}

export default function ConversationList() {
  const { state, me, openConversation } = useMessaging()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState<'contacts' | 'browse' | 'create' | null>(null)

  const peopleLabel = me.role === 'intern' ? 'Mentors' : me.role === 'mentor' ? 'Interns' : 'Direct'
  const term = query.trim().toLowerCase()

  const conversations = visibleConversations(state).filter((conversation) => {
    if (term && !conversationTitle(state, conversation).toLowerCase().includes(term)) return false
    if (filter === 'team') return conversation.type === 'channel'
    if (filter === 'unread') return unreadCount(state, conversation.id) > 0
    if (filter === 'people') {
      if (conversation.type !== 'direct') return false
      const tag = conversationTag(me, state, conversation).label
      return me.role === 'intern' ? tag === 'Mentor' : me.role === 'mentor' ? tag === 'Intern' : true
    }
    return true
  })

  const updates = notificationsFor(state).filter((notification) => notification.category !== 'message')
  const updatesUnread = updates.filter((notification) => isUnreadNotification(notification, me.id)).length
  const showUpdates =
    updates.length > 0 && !term && (filter === 'all' || (filter === 'unread' && updatesUnread > 0))

  const tabs: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'people', label: peopleLabel },
    { id: 'team', label: 'Team' },
    { id: 'unread', label: 'Unread' },
  ]

  const iconButton = 'rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900'

  return (
    <section className="flex w-80 shrink-0 flex-col rounded-2xl bg-white">
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <div className="flex items-center gap-0.5">
            <button className={iconButton} title="Contacts" onClick={() => setModal('contacts')}>
              <Contact className="h-4.5 w-4.5" />
            </button>
            <button className={iconButton} title="Browse channels" onClick={() => setModal('browse')}>
              <Hash className="h-4.5 w-4.5" />
            </button>
            {canCreateChannels(me) && (
              <button className={iconButton} title="Create channel" onClick={() => setModal('create')}>
                <Plus className="h-4.5 w-4.5" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex gap-1" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={filter === tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                filter === tab.id ? 'bg-[#1e3a2c] text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search conversations"
            className="w-full rounded-lg bg-gray-100 py-2 pr-3 pl-8 text-xs outline-none placeholder:text-gray-400 focus:bg-gray-50 focus:ring-1 focus:ring-gray-200"
          />
        </div>
      </div>

      <ul className="mt-2 flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
        {showUpdates && (
          <li>
            <ListRow
              active={state.activeConversationId === UPDATES_ID}
              onClick={() => openConversation(UPDATES_ID)}
              avatar={
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white">
                  <Megaphone className="h-4.5 w-4.5" />
                </span>
              }
              title="Internship updates"
              time={formatListTime(updates[0].createdAt)}
              preview={updates[0].title}
              tag={{ label: 'Notifications', className: 'bg-orange-100 text-orange-700' }}
              unread={updatesUnread}
            />
          </li>
        )}

        {conversations.map((conversation) => {
          const last = lastMessage(state, conversation.id)
          const other = conversation.type === 'direct' ? otherMember(state, conversation) : undefined
          const author = last && (last.authorId === me.id ? 'You' : state.users[last.authorId].name.split(' ')[0])
          const text = last ? last.body || `📎 ${last.attachment?.name ?? 'Attachment'}` : 'No messages yet'
          const preview = last && (conversation.type === 'channel' || last.authorId === me.id) ? `${author}: ${text}` : text

          return (
            <li key={conversation.id}>
              <ListRow
                active={state.activeConversationId === conversation.id}
                onClick={() => openConversation(conversation.id)}
                avatar={
                  other ? (
                    <Avatar user={other} showPresence />
                  ) : (
                    <Avatar label={channelInitials(conversation.name ?? '#')} color={conversation.kind === 'team' ? '#d9822b' : '#5b6b63'} />
                  )
                }
                title={conversationTitle(state, conversation)}
                time={formatListTime(last?.createdAt ?? conversation.createdAt)}
                preview={preview}
                tag={conversationTag(me, state, conversation)}
                unread={unreadCount(state, conversation.id)}
                muted={conversation.archived}
              />
            </li>
          )
        })}

        {conversations.length === 0 && !showUpdates && (
          <li className="px-4 py-10 text-center text-sm text-gray-400">No conversations found.</li>
        )}
      </ul>

      {modal === 'contacts' && <ContactsModal onClose={() => setModal(null)} />}
      {modal === 'browse' && <BrowseChannelsModal onClose={() => setModal(null)} />}
      {modal === 'create' && <ChannelFormModal onClose={() => setModal(null)} />}
    </section>
  )
}

const channelInitials = (name: string) =>
  name
    .split(/[\s·-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')

type ListRowProps = {
  active: boolean
  onClick: () => void
  avatar: ReactNode
  title: string
  time: string
  preview: string
  tag: { label: string; className: string }
  unread: number
  muted?: boolean
}

function ListRow({ active, onClick, avatar, title, time, preview, tag, unread, muted }: ListRowProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
        active ? 'bg-gray-100' : 'hover:bg-gray-50'
      } ${muted ? 'opacity-60' : ''}`}
    >
      {avatar}
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className={`truncate text-sm text-gray-900 ${unread ? 'font-bold' : 'font-semibold'}`}>{title}</span>
          <span className="shrink-0 text-[11px] text-gray-400">{time}</span>
        </span>
        <span className={`mt-0.5 block truncate text-xs ${unread ? 'text-gray-800' : 'text-gray-500'}`}>{preview}</span>
        <span className="mt-1.5 flex items-center justify-between">
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${tag.className}`}>
            {muted ? `${tag.label} · Archived` : tag.label}
          </span>
          {unread > 0 && (
            <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white">
              {unread}
            </span>
          )}
        </span>
      </span>
    </button>
  )
}
