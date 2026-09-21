import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import * as messagingApi from '../../api/messaging'
import type { MessagingData } from '../../api/messaging'
import { findDirectConversation, messagingReducer, visibleConversations } from '../../hooks/messagingStore'
import type { MessagingState } from '../../hooks/messagingStore'
import { MessagingContext } from '../../hooks/useMessaging'
import type { AnnouncementInput, ChannelInput, MessagingApi } from '../../hooks/useMessaging'
import type { Attachment, ContactInfo, Conversation } from '../../types/messaging'
import { UPDATES_ID } from '../../types/messaging'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: MessagingData }

/** Loads the signed-in user's messaging data, then provides it to the page. */
export default function MessagingProvider({ children }: { children: ReactNode }) {
  const [load, setLoad] = useState<LoadState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  // A failed write re-mounts the store below, so the message it produced has to
  // be held above it to stay on screen.
  const [problem, setProblem] = useState<string | null>(null)

  const reload = useCallback(() => {
    setLoad({ status: 'loading' })
    setAttempt((value) => value + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    messagingApi
      .fetchMessagingData(controller.signal)
      .then((data) => setLoad({ status: 'ready', data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setLoad({ status: 'error', error: error instanceof Error ? error.message : String(error) })
      })
    return () => controller.abort()
  }, [attempt])

  return (
    <>
      {renderLoad()}
      {problem && <ProblemToast message={problem} onDismiss={() => setProblem(null)} />}
    </>
  )

  function renderLoad() {
    if (load.status === 'loading') {
      return <StatusScreen title="Loading messages…" />
    }
    if (load.status === 'error') {
      return (
        <StatusScreen
          title="Messaging isn't connected yet"
          detail={`Conversations, contacts and notifications are loaded from the backend, which couldn't be reached. ${load.error}`}
          onRetry={reload}
        />
      )
    }
    if (!load.data.users.some((user) => user.id === load.data.currentUserId)) {
      return <StatusScreen title="You need to sign in to use messages." />
    }
    return (
      <MessagingStore key={attempt} data={load.data} onReload={reload} onProblem={setProblem}>
        {children}
      </MessagingStore>
    )
  }
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

type MessagingStoreProps = {
  data: MessagingData
  onReload: () => void
  onProblem: (message: string) => void
  children: ReactNode
}

function MessagingStore({ data, onReload, onProblem, children }: MessagingStoreProps) {
  const [state, dispatch] = useReducer(messagingReducer, data, createInitialState)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const me = state.users[state.currentUserId]

  /**
   * Every write goes to the API. When one fails the local state may already
   * have moved on optimistically, so the whole payload is re-fetched rather
   * than guessed at.
   */
  const run = useCallback(
    (work: () => Promise<void>) => {
      void work().catch((error: unknown) => {
        onProblem(error instanceof Error ? error.message : String(error))
        onReload()
      })
    },
    [onReload, onProblem],
  )

  const sendMessage = useCallback(
    (conversationId: string, body: string, options: { parentId?: string; attachment?: Attachment } = {}) => {
      const conversation = stateRef.current.conversations.find((item) => item.id === conversationId)
      if (!conversation || conversation.archived) return

      // The id and timestamp come from the server, so the message is only
      // added once it has been stored.
      run(async () => {
        const message = await messagingApi.sendMessage(conversationId, {
          body: body.trim(),
          parentId: options.parentId,
          attachment: options.attachment,
        })
        dispatch({ type: 'addMessage', message })
      })
    },
    [run],
  )

  const openDirectWith = useCallback(
    (userId: string) => {
      const existing = findDirectConversation(stateRef.current, userId)
      if (existing) {
        dispatch({ type: 'openConversation', conversationId: existing.id })
        return
      }
      run(async () => {
        const conversation = await messagingApi.startDirect(userId)
        if (!stateRef.current.conversations.some((item) => item.id === conversation.id)) {
          dispatch({ type: 'addConversation', conversation })
        }
        dispatch({ type: 'openConversation', conversationId: conversation.id })
      })
    },
    [run],
  )

  const createChannel = useCallback(
    (input: ChannelInput) => {
      run(async () => {
        const conversation = await messagingApi.createChannel(input)
        dispatch({ type: 'addConversation', conversation })
        dispatch({ type: 'openConversation', conversationId: conversation.id })
      })
    },
    [run],
  )

  const updateChannel = useCallback(
    (conversationId: string, patch: Partial<Conversation>) => {
      dispatch({ type: 'updateChannel', conversationId, patch })
      run(async () => {
        const conversation = await messagingApi.updateChannel(conversationId, patch)
        // The server decides the final member list, so reconcile with it.
        dispatch({ type: 'updateChannel', conversationId, patch: conversation })
      })
    },
    [run],
  )

  const joinChannel = useCallback(
    (conversationId: string) => {
      dispatch({ type: 'joinChannel', conversationId, userId: stateRef.current.currentUserId })
      run(async () => {
        const conversation = await messagingApi.joinChannel(conversationId)
        dispatch({ type: 'updateChannel', conversationId, patch: conversation })
      })
    },
    [run],
  )

  const removeMember = useCallback(
    (conversationId: string, userId: string) => {
      dispatch({ type: 'leaveChannel', conversationId, userId })
      run(() => messagingApi.removeMember(conversationId, userId))
    },
    [run],
  )

  const sendAnnouncement = useCallback(
    (input: AnnouncementInput) => {
      run(async () => {
        const notification = await messagingApi.sendAnnouncement(input)
        dispatch({ type: 'addNotification', notification })
      })
    },
    [run],
  )

  const updateMyContact = useCallback(
    (contact: ContactInfo) => {
      const userId = stateRef.current.currentUserId
      dispatch({ type: 'updateContact', userId, contact })
      run(async () => {
        const user = await messagingApi.updateMyContact(contact)
        dispatch({ type: 'updateContact', userId, contact: user.contact })
      })
    },
    [run],
  )

  const api = useMemo<MessagingApi>(
    () => ({
      state,
      me,
      openConversation: (conversationId) => dispatch({ type: 'openConversation', conversationId }),
      openDirectWith,
      sendMessage,
      markConversationRead: (conversationId) => {
        dispatch({ type: 'markConversationRead', conversationId, userId: state.currentUserId })
        run(() => messagingApi.markConversationRead(conversationId))
      },
      createChannel,
      updateChannel,
      deleteChannel: (conversationId) => {
        dispatch({ type: 'deleteChannel', conversationId })
        run(() => messagingApi.deleteChannel(conversationId))
      },
      joinChannel,
      leaveChannel: (conversationId) => removeMember(conversationId, state.currentUserId),
      removeMember,
      updateMyContact,
      sendAnnouncement,
      markNotificationsRead: (ids) => {
        dispatch({ type: 'markNotificationsRead', ids, userId: state.currentUserId })
        run(() => messagingApi.markNotificationsRead(ids))
      },
    }),
    [
      state,
      me,
      run,
      openDirectWith,
      sendMessage,
      createChannel,
      updateChannel,
      joinChannel,
      removeMember,
      updateMyContact,
      sendAnnouncement,
    ],
  )

  return <MessagingContext.Provider value={api}>{children}</MessagingContext.Provider>
}

function ProblemToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-red-600 px-4 py-2.5 text-sm text-white shadow-lg">
      <span>{message}</span>
      <button onClick={onDismiss} className="font-medium text-red-100 hover:text-white">
        Dismiss
      </button>
    </div>
  )
}
