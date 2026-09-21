import type { ChatNotification, Conversation, Message, User } from '../types/messaging'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5080'

/** Everything the Messages page needs for the signed-in user. */
export type MessagingData = {
  currentUserId: string
  users: User[]
  conversations: Conversation[]
  messages: Message[]
  notifications: ChatNotification[]
}

export async function fetchMessagingData(signal?: AbortSignal): Promise<MessagingData> {
  const response = await fetch(`${API_URL}/api/messaging`, { signal, credentials: 'include' }).catch((error) => {
    if (signal?.aborted) throw error
    throw new Error(`No response from ${API_URL}. Is the API running?`)
  })
  if (!response.ok) throw new Error(`The messaging service responded with ${response.status}.`)
  return response.json()
}
