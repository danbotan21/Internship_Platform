import { useEffect, useState } from 'react'
import { Megaphone, Plus } from 'lucide-react'
import { useMessaging } from '../../hooks/useMessaging'
import { canSendAnnouncements, isUnreadNotification, notificationsFor } from '../../hooks/messagingStore'
import AnnouncementModal from './AnnouncementModal'
import { categoryLabel, formatClock, formatDateTime, formatDayLabel, isSameDay } from './format'
import { categoryStyle } from './styles'

/** Chat-style feed of system and coordinator notifications (deadlines, tasks, events, announcements). */
export default function UpdatesFeed() {
  const { state, me, markNotificationsRead } = useMessaging()
  const [composing, setComposing] = useState(false)

  const updates = notificationsFor(state)
    .filter((notification) => notification.category !== 'message')
    .reverse()
  const unreadIds = updates
    .filter((notification) => isUnreadNotification(notification, me.id))
    .map((notification) => notification.id)
    .join(',')

  useEffect(() => {
    if (unreadIds) markNotificationsRead(unreadIds.split(','))
  }, [unreadIds, markNotificationsRead])

  return (
    <section className="flex min-w-0 flex-1 flex-col rounded-2xl bg-white">
      <header className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white">
          <Megaphone className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">Internship updates</h2>
          <p className="text-xs text-gray-500">Deadlines, tasks, events and announcements from the platform and coordinators</p>
        </div>
        {canSendAnnouncements(me) && (
          <button
            onClick={() => setComposing(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#1e3a2c] px-3 py-2 text-sm font-medium text-white hover:bg-[#28503c]"
          >
            <Plus className="h-4 w-4" /> New notification
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {updates.length === 0 && (
          <p className="mt-16 text-center text-sm text-gray-400">No deadlines, tasks, events or announcements yet.</p>
        )}
        {updates.map((notification, index) => {
          const { icon: Icon, tone } = categoryStyle[notification.category]
          const newDay = index === 0 || !isSameDay(updates[index - 1].createdAt, notification.createdAt)
          const sender = notification.senderId ? state.users[notification.senderId] : undefined
          const sentByMe = notification.senderId === me.id
          const readCount = notification.readBy.filter((id) => notification.recipientIds.includes(id)).length

          return (
            <div key={notification.id}>
              {newDay && <p className="mt-5 mb-1 text-center text-xs text-gray-400">{formatDayLabel(notification.createdAt)}</p>}
              <article className="mt-3 flex gap-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="max-w-xl flex-1 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="flex items-center gap-2 text-xs text-gray-400">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${tone}`}>{categoryLabel[notification.category]}</span>
                    {sender ? `${sender.name} · Coordinator` : 'System'} · {formatClock(notification.createdAt)}
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-600">{notification.body}</p>
                  {notification.dueAt && (
                    <p className="mt-2 text-xs font-medium text-orange-600">
                      {notification.category === 'deadline' ? 'Due' : 'When'}: {formatDateTime(notification.dueAt)}
                    </p>
                  )}
                  {sentByMe && (
                    <p className="mt-2 text-[11px] text-gray-400">
                      Sent to {notification.recipientIds.length} people · read by {readCount}
                    </p>
                  )}
                </div>
              </article>
            </div>
          )
        })}
      </div>

      {composing && <AnnouncementModal onClose={() => setComposing(false)} />}
    </section>
  )
}
