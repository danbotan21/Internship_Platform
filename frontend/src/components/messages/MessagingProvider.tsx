import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { fetchMessagingData } from '../../api/messaging'
import type { MessagingData } from '../../api/messaging'
import { createId, findDirectConversation, messagingReducer, visibleConversations } from '../../hooks/messagingStore'
import type { MessagingState } from '../../hooks/messagingStore'
import { MessagingContext } from '../../hooks/useMessaging'
import type { AnnouncementInput, ChannelInput, MessagingApi } from '../../hooks/useMessaging'
import type { Attachment, ContactInfo, Conversation, Message } from '../../types/messaging'
import { UPDATES_ID } from '../../types/messaging'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: MessagingData }

/** Loads the signed-in user's messaging data, then provides it to the page. */
export default function MessagingProvider({ children }: { children: ReactNode }) {
  const [load, setLoad] = useState<LoadState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetchMessagingData(controller.signal)
      .then((data) => setLoad({ status: 'ready', data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setLoad({ status: 'error', error: error instanceof Error ? error.message : String(error) })
      })
    return () => controller.abort()
  }, [attempt])

  if (load.status === 'loading') {
    return <StatusScreen title="Loading messages…" />
  }
  if (load.status === 'error') {
    return (
      <StatusScreen
        title="Messaging isn't connected yet"
        detail={`Conversations, contacts and notifications are loaded from the backend, which couldn't be reached. ${load.error}`}
        onRetry={() => {
          setLoad({ status: 'loading' })
          setAttempt((value) => value + 1)
        }}
      />
    )
  }
  if (!load.data.users.some((user) => user.id === load.data.currentUserId)) {
    return <StatusScreen title="You need to sign in to use messages." />
  }
  return <MessagingStore data={load.data}>{children}</MessagingStore>
}

function StatusScreen({ title, detail, onRetry }: { title: string; detail?: string; onRetry?: () => void }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {detail && <p className="mt-2 text-sm text-gray-500">{detail}</p>}
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-5 rounded-lg bg-[#1e3a2c] px-4 py-2 text-sm font-medium text-white hover:bg-[#28503c]"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}

function createInitialState(data: MessagingData): MessagingState {
  const state: MessagingState = {
    currentUserId: data.currentUserId,
    activeConversationId: UPDATES_ID,
    users: Object.fromEntries(data.users.map((user) => [user.id, user])),
    conversations: data.conversations,
    messages: data.messages,
    notifications: data.notifications,
  }
  return { ...state, activeConversationId: visibleConversations(state)[0]?.id ?? UPDATES_ID }
}

function MessagingStore({ data, children }: { data: MessagingData; children: ReactNode }) {
  const [state, dispatch] = useReducer(messagingReducer, data, createInitialState)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const me = state.users[state.currentUserId]

  const sendMessage = useCallback(
    (conversationId: string, body: string, options: { parentId?: string; attachment?: Attachment } = {}) => {
      const current = stateRef.current
      const conversation = current.conversations.find((item) => item.id === conversationId)
      if (!conversation || conversation.archived) return
      const message: Message = {
        id: createId('m'),
        conversationId,
        authorId: current.currentUserId,
        body: body.trim(),
        createdAt: new Date().toISOString(),
        parentId: options.parentId,
        attachment: options.attachment,
        deliveredTo: [],
        readBy: [],
      }
      dispatch({ type: 'addMessage', message })
    },
    [],
  )

  const openDirectWith = useCallback((userId: string) => {
    const current = stateRef.current
    const existing = findDirectConversation(current, userId)
    if (existing) {
      dispatch({ type: 'openConversation', conversationId: existing.id })
      return
    }
    const conversation: Conversation = {
      id: createId('dm'),
      type: 'direct',
      memberIds: [current.currentUserId, userId],
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'addConversation', conversation })
    dispatch({ type: 'openConversation', conversationId: conversation.id })
  }, [])

  const createChannel = useCallback((input: ChannelInput) => {
    const current = stateRef.current
    const conversation: Conversation = {
      id: createId('ch'),
      type: 'channel',
      name: input.name.trim(),
      description: input.description.trim(),
      kind: input.kind,
      visibility: input.visibility,
      ownerId: current.currentUserId,
      memberIds: Array.from(new Set([current.currentUserId, ...input.memberIds])),
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'addConversation', conversation })
    dispatch({ type: 'openConversation', conversationId: conversation.id })
  }, [])

  const sendAnnouncement = useCallback((input: AnnouncementInput) => {
    const current = stateRef.current
    const recipientIds = Object.values(current.users)
      .filter((user) => user.id !== current.currentUserId)
      .filter((user) =>
        input.audience === 'all'
          ? user.role === 'intern' || user.role === 'mentor'
          : user.role === (input.audience === 'interns' ? 'intern' : 'mentor'),
      )
      .map((user) => user.id)
    dispatch({
      type: 'addNotification',
      notification: {
        id: createId('n'),
        category: input.category,
        title: input.title.trim(),
        body: input.body.trim(),
        dueAt: input.dueAt,
        createdAt: new Date().toISOString(),
        source: 'coordinator',
        senderId: current.currentUserId,
        recipientIds,
        readBy: [],
      },
    })
  }, [])

  const api = useMemo<MessagingApi>(
    () => ({
      state,
      me,
      openConversation: (conversationId) => dispatch({ type: 'openConversation', conversationId }),
      openDirectWith,
      sendMessage,
      markConversationRead: (conversationId) =>
        dispatch({ type: 'markConversationRead', conversationId, userId: state.currentUserId }),
      createChannel,
      updateChannel: (conversationId, patch) => dispatch({ type: 'updateChannel', conversationId, patch }),
      deleteChannel: (conversationId) => dispatch({ type: 'deleteChannel', conversationId }),
      joinChannel: (conversationId) =>
        dispatch({ type: 'joinChannel', conversationId, userId: state.currentUserId }),
      leaveChannel: (conversationId) =>
        dispatch({ type: 'leaveChannel', conversationId, userId: state.currentUserId }),
      removeMember: (conversationId, userId) => dispatch({ type: 'leaveChannel', conversationId, userId }),
      updateMyContact: (contact: ContactInfo) =>
        dispatch({ type: 'updateContact', userId: state.currentUserId, contact }),
      sendAnnouncement,
      markNotificationsRead: (ids) =>
        dispatch({ type: 'markNotificationsRead', ids, userId: state.currentUserId }),
    }),
    [state, me, openDirectWith, sendMessage, createChannel, sendAnnouncement],
  )

  return <MessagingContext.Provider value={api}>{children}</MessagingContext.Provider>
}
