export type Role = 'intern' | 'mentor' | 'coordinator' | 'admin'

export type ContactInfo = {
  email: string
  phone: string
  location: string
  availability: string
  preferredChannel: 'Chat' | 'Email' | 'Phone'
}

export type User = {
  id: string
  name: string
  initials: string
  role: Role
  organization: string
  color: string
  online: boolean
  lastSeenAt: string
  contact: ContactInfo
  /** Set for interns: the mentor they are assigned to. */
  mentorId?: string
}

export type ChannelKind = 'team' | 'topic'

export type Conversation = {
  id: string
  type: 'direct' | 'channel'
  memberIds: string[]
  createdAt: string
  // Channel-only fields
  name?: string
  description?: string
  kind?: ChannelKind
  visibility?: 'public' | 'private'
  ownerId?: string
  archived?: boolean
}

export type Attachment = {
  name: string
  size: number
}

export type Message = {
  id: string
  conversationId: string
  authorId: string
  body: string
  createdAt: string
  /** Replies within a channel thread point at their parent message. */
  parentId?: string
  attachment?: Attachment
  deliveredTo: string[]
  readBy: string[]
}

export type DeliveryStatus = 'sent' | 'delivered' | 'read'

export type NotificationCategory = 'deadline' | 'task' | 'event' | 'message' | 'announcement'

export type ChatNotification = {
  id: string
  category: NotificationCategory
  title: string
  body: string
  createdAt: string
  source: 'system' | 'coordinator'
  senderId?: string
  recipientIds: string[]
  readBy: string[]
  dueAt?: string
  conversationId?: string
}

export const UPDATES_ID = 'updates'
