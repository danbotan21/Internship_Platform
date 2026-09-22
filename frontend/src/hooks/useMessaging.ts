import { createContext, useContext } from 'react'
import type {
  Attachment,
  ChannelKind,
  ContactInfo,
  Conversation,
  NotificationCategory,
  User,
} from '../types/messaging'
import type { MessagingState } from './messagingStore'

export type ChannelInput = {
  name: string
  description: string
  kind: ChannelKind
  visibility: 'public' | 'private'
  memberIds: string[]
}

export type AnnouncementInput = {
  category: Exclude<NotificationCategory, 'message'>
  title: string
  body: string
  audience: 'all' | 'interns' | 'mentors'
  dueAt?: string
}

export type MessagingApi = {
  state: MessagingState
  me: User
  openConversation: (conversationId: string) => void
  openDirectWith: (userId: string) => void
  sendMessage: (conversationId: string, body: string, options?: { parentId?: string; attachment?: Attachment }) => void
  markConversationRead: (conversationId: string) => void
  createChannel: (input: ChannelInput) => void
  updateChannel: (conversationId: string, patch: Partial<Conversation>) => void
  deleteChannel: (conversationId: string) => void
  joinChannel: (conversationId: string) => void
  leaveChannel: (conversationId: string) => void
  removeMember: (conversationId: string, userId: string) => void
  updateMyContact: (contact: ContactInfo) => void
  sendAnnouncement: (input: AnnouncementInput) => void
  markNotificationsRead: (ids: string[]) => void
}

export const MessagingContext = createContext<MessagingApi | null>(null)

export function useMessaging() {
  const api = useContext(MessagingContext)
  if (!api) throw new Error('useMessaging must be used inside <MessagingProvider>')
  return api
}
