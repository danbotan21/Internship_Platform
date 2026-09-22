import type {
  Attachment,
  ChatNotification,
  ContactInfo,
  Conversation,
  Message,
  User,
} from '../types/messaging'
import type { AnnouncementInput, ChannelInput } from '../hooks/useMessaging'
import { apiGet, apiSend } from './client'

/** Everything the Messages page needs for the signed-in user. */
export type MessagingData = {
  currentUserId: string
  users: User[]
  conversations: Conversation[]
  messages: Message[]
  notifications: ChatNotification[]
}

export const fetchMessagingData = (signal?: AbortSignal) =>
  apiGet<MessagingData>('/api/messaging', signal)

// ---------- Conversations ----------

export const startDirect = (userId: string) =>
  apiSend<Conversation>('POST', '/api/messaging/conversations/direct', { userId })

export const sendMessage = (
  conversationId: string,
  payload: { body: string; parentId?: string; attachment?: Attachment },
) => apiSend<Message>('POST', `/api/messaging/conversations/${conversationId}/messages`, payload)

export const markConversationRead = (conversationId: string) =>
  apiSend<void>('POST', `/api/messaging/conversations/${conversationId}/read`)

// ---------- Channels ----------

export const createChannel = (input: ChannelInput) =>
  apiSend<Conversation>('POST', '/api/messaging/channels', input)

/** Only the channel fields the API accepts are forwarded from a patch. */
export function updateChannel(conversationId: string, patch: Partial<Conversation>) {
  const { name, description, kind, visibility, archived, memberIds } = patch
  return apiSend<Conversation>('PATCH', `/api/messaging/channels/${conversationId}`, {
    name,
    description,
    kind,
    visibility,
    archived,
    memberIds,
  })
}

export const deleteChannel = (conversationId: string) =>
  apiSend<void>('DELETE', `/api/messaging/channels/${conversationId}`)

export const joinChannel = (conversationId: string) =>
  apiSend<Conversation>('POST', `/api/messaging/channels/${conversationId}/join`)

export const removeMember = (conversationId: string, userId: string) =>
  apiSend<void>('DELETE', `/api/messaging/channels/${conversationId}/members/${userId}`)

// ---------- Contacts & notifications ----------

export const updateMyContact = (contact: ContactInfo) =>
  apiSend<User>('PUT', '/api/messaging/me/contact', contact)

export const sendAnnouncement = (input: AnnouncementInput) =>
  apiSend<ChatNotification>('POST', '/api/messaging/announcements', input)

export const markNotificationsRead = (ids: string[]) =>
  apiSend<void>('POST', '/api/messaging/notifications/read', { ids })
