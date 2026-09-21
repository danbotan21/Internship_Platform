import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown } from 'lucide-react'
import { useMessaging } from '../../hooks/useMessaging'
import { isUnreadNotification, notificationsFor } from '../../hooks/messagingStore'
import { UPDATES_ID } from '../../types/messaging'
import { categoryLabel, formatListTime } from './format'
import { categoryStyle } from './styles'

export default function NotificationsMenu() {
  const { state, me, openConversation, markNotificationsRead } = useMessaging()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const notifications = notificationsFor(state).filter((notification) => notification.recipientIds.includes(me.id))
  const unread = notifications.filter((notification) => isUnreadNotification(notification, me.id))

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-lg bg-[#1e3a2c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#28503c]"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        Notifications
        {unread.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[11px] font-semibold">
            {unread.length}
          </span>
        )}
        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-96 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            <button
              disabled={unread.length === 0}
              onClick={() => markNotificationsRead(unread.map((notification) => notification.id))}
              className="text-xs font-medium text-[#1e3a2c] hover:underline disabled:text-gray-300 disabled:no-underline"
            >
              Mark all as read
            </button>
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && <li className="px-4 py-8 text-center text-sm text-gray-400">You're all caught up.</li>}
            {notifications.map((notification) => {
              const { icon: Icon, tone } = categoryStyle[notification.category]
              const isUnread = isUnreadNotification(notification, me.id)
              return (
                <li key={notification.id}>
                  <button
                    onClick={() => {
                      markNotificationsRead([notification.id])
                      openConversation(notification.conversationId ?? UPDATES_ID)
                      setOpen(false)
                    }}
                    className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-gray-50 ${isUnread ? 'bg-orange-50/40' : ''}`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-gray-900">{notification.title}</span>
                        <span className="shrink-0 text-[11px] text-gray-400">{formatListTime(notification.createdAt)}</span>
                      </span>
                      <span className="line-clamp-2 text-xs text-gray-500">{notification.body}</span>
                      <span className="mt-1 block text-[11px] text-gray-400">
                        {categoryLabel[notification.category]} ·{' '}
                        {notification.source === 'coordinator' && notification.senderId
                          ? state.users[notification.senderId].name
                          : 'System'}
                      </span>
                    </span>
                    {isUnread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
