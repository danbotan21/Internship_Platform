import type {
  ChatNotification,
  ContactInfo,
  Conversation,
  DeliveryStatus,
  Message,
  User,
} from '../types/messaging'
import { UPDATES_ID } from '../types/messaging'

export type MessagingState = {
  currentUserId: string
  activeConversationId: string
  users: Record<string, User>
  conversations: Conversation[]
  messages: Message[]
  notifications: ChatNotification[]
}

export type MessagingAction =
  | { type: 'openConversation'; conversationId: string }
  | { type: 'addMessage'; message: Message }
  | { type: 'markConversationRead'; conversationId: string; userId: string }
  | { type: 'markConversationDelivered'; conversationId: string; userIds: string[] }
  | { type: 'addConversation'; conversation: Conversation }
  | { type: 'updateChannel'; conversationId: string; patch: Partial<Conversation> }
  | { type: 'deleteChannel'; conversationId: string }
  | { type: 'joinChannel'; conversationId: string; userId: string }
  | { type: 'leaveChannel'; conversationId: string; userId: string }
  | { type: 'updateContact'; userId: string; contact: ContactInfo }
  | { type: 'addNotification'; notification: ChatNotification }
  | { type: 'markNotificationsRead'; ids: string[]; userId: string }

const addUnique = (list: string[], id: string) => (list.includes(id) ? list : [...list, id])

export function messagingReducer(state: MessagingState, action: MessagingAction): MessagingState {
  switch (action.type) {
    case 'openConversation':
      return { ...state, activeConversationId: action.conversationId }
    case 'addMessage':
      return { ...state, messages: [...state.messages, action.message] }
    case 'markConversationRead': {
      const { conversationId, userId } = action
      const isUnreadMessage = (message: Message) =>
        message.conversationId === conversationId && message.authorId !== userId && !message.readBy.includes(userId)
      const isUnreadAlert = (notification: ChatNotification) =>
        notification.conversationId === conversationId && isUnreadNotification(notification, userId)

      if (!state.messages.some(isUnreadMessage) && !state.notifications.some(isUnreadAlert)) return state

      return {
        ...state,
        messages: state.messages.map((message) =>
          isUnreadMessage(message)
            ? { ...message, readBy: [...message.readBy, userId], deliveredTo: addUnique(message.deliveredTo, userId) }
            : message,
        ),
        notifications: state.notifications.map((notification) =>
          isUnreadAlert(notification) ? { ...notification, readBy: [...notification.readBy, userId] } : notification,
        ),
      }
    }
    case 'markConversationDelivered': {
      const { conversationId, userIds } = action
      const pending = (message: Message) =>
        message.conversationId === conversationId &&
        userIds.some((userId) => userId !== message.authorId && !message.deliveredTo.includes(userId))

      if (!state.messages.some(pending)) return state

      return {
        ...state,
        messages: state.messages.map((message) =>
          pending(message)
            ? {
                ...message,
                deliveredTo: userIds
                  .filter((userId) => userId !== message.authorId)
                  .reduce(addUnique, message.deliveredTo),
              }
            : message,
        ),
      }
    }
    case 'addConversation':
      return { ...state, conversations: [...state.conversations, action.conversation] }
    case 'updateChannel':
      return {
        ...state,
        conversations: state.conversations.map((conversation) =>
          conversation.id === action.conversationId ? { ...conversation, ...action.patch } : conversation,
        ),
      }
    case 'deleteChannel': {
      const next = {
        ...state,
        conversations: state.conversations.filter((conversation) => conversation.id !== action.conversationId),
        messages: state.messages.filter((message) => message.conversationId !== action.conversationId),
      }
      return {
        ...next,
        activeConversationId:
          state.activeConversationId === action.conversationId
            ? (visibleConversations(next)[0]?.id ?? UPDATES_ID)
            : state.activeConversationId,
      }
    }
    case 'joinChannel':
    case 'leaveChannel': {
      const next = {
        ...state,
        conversations: state.conversations.map((conversation) =>
          conversation.id !== action.conversationId
            ? conversation
            : {
                ...conversation,
                memberIds:
                  action.type === 'joinChannel'
                    ? addUnique(conversation.memberIds, action.userId)
                    : conversation.memberIds.filter((id) => id !== action.userId),
              },
        ),
      }
      const leftActive =
        action.type === 'leaveChannel' &&
        action.userId === state.currentUserId &&
        state.activeConversationId === action.conversationId
      return leftActive ? { ...next, activeConversationId: visibleConversations(next)[0]?.id ?? UPDATES_ID } : next
    }
    case 'updateContact':
      return {
        ...state,
        users: {
          ...state.users,
          [action.userId]: { ...state.users[action.userId], contact: action.contact },
        },
      }
    case 'addNotification':
      return { ...state, notifications: [action.notification, ...state.notifications] }
    case 'markNotificationsRead':
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          action.ids.includes(notification.id)
            ? { ...notification, readBy: addUnique(notification.readBy, action.userId) }
            : notification,
        ),
      }
  }
}

// ---------- Selectors & permission rules ----------

export const currentUser = (state: MessagingState) => state.users[state.currentUserId]

export function visibleConversations(state: MessagingState) {
  return state.conversations
    .filter((conversation) => conversation.memberIds.includes(state.currentUserId))
    .sort((a, b) => lastActivity(state, b) - lastActivity(state, a))
}

export function lastActivity(state: MessagingState, conversation: Conversation) {
  const last = lastMessage(state, conversation.id)
  return new Date(last?.createdAt ?? conversation.createdAt).getTime()
}

export function lastMessage(state: MessagingState, conversationId: string) {
  let latest: Message | undefined
  for (const message of state.messages) {
    if (message.conversationId === conversationId && (!latest || message.createdAt > latest.createdAt)) {
      latest = message
    }
  }
  return latest
}

export function unreadCount(state: MessagingState, conversationId: string, userId = state.currentUserId) {
  return state.messages.filter(
    (message) =>
      message.conversationId === conversationId && message.authorId !== userId && !message.readBy.includes(userId),
  ).length
}

export function otherMember(state: MessagingState, conversation: Conversation) {
  const otherId = conversation.memberIds.find((id) => id !== state.currentUserId) ?? state.currentUserId
  return state.users[otherId]
}

export function conversationTitle(state: MessagingState, conversation: Conversation) {
  return conversation.type === 'channel' ? (conversation.name ?? 'Channel') : otherMember(state, conversation).name
}

export function deliveryStatus(message: Message, conversation: Conversation): DeliveryStatus {
  const recipients = conversation.memberIds.filter((id) => id !== message.authorId)
  if (recipients.length > 0 && recipients.every((id) => message.readBy.includes(id))) return 'read'
  if (message.deliveredTo.length > 0) return 'delivered'
  return 'sent'
}

export function notificationsFor(state: MessagingState, userId = state.currentUserId) {
  return state.notifications
    .filter((notification) => notification.recipientIds.includes(userId) || notification.senderId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export const isUnreadNotification = (notification: ChatNotification, userId: string) =>
  notification.recipientIds.includes(userId) && !notification.readBy.includes(userId)

export const canCreateChannels = (user: User) => user.role !== 'intern'

export const canManageChannel = (user: User, conversation: Conversation) =>
  user.role === 'admin' || user.role === 'coordinator' || conversation.ownerId === user.id

export const canSendAnnouncements = (user: User) => user.role === 'coordinator' || user.role === 'admin'

/**
 * Contact details are shared between an intern and their mentor, and
 * coordinators/admins can see and be seen by everyone.
 */
export function canViewContact(viewer: User, target: User) {
  if (viewer.id === target.id) return true
  const staff = (user: User) => user.role === 'coordinator' || user.role === 'admin'
  if (staff(viewer) || staff(target)) return true
  if (viewer.role === 'intern') return viewer.mentorId === target.id
  if (viewer.role === 'mentor') return target.mentorId === viewer.id
  return false
}

/** People whose contact card the viewer is entitled to see, for the Contacts directory. */
export function contactsFor(state: MessagingState) {
  const viewer = currentUser(state)
  return Object.values(state.users).filter((user) => user.id !== viewer.id && canViewContact(viewer, user))
}

export function findDirectConversation(state: MessagingState, userId: string) {
  return state.conversations.find(
    (conversation) =>
      conversation.type === 'direct' &&
      conversation.memberIds.includes(state.currentUserId) &&
      conversation.memberIds.includes(userId),
  )
}

export const createId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
