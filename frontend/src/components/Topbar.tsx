import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { getNotifications, markNotificationAsRead, type Notification } from '../api/resources'
import { useAuth } from '../hooks/authContext'

type TopbarProps = {
  notificationsOnly?: boolean
}

export default function Topbar({ notificationsOnly = false }: TopbarProps) {
  const { session } = useAuth()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    void getNotifications().then(setNotifications).catch(() => setNotifications([]))
  }, [])

  const unreadNotifications = notifications.filter((notification) => !notification.isRead).length
  const markAsRead = async (notification: Notification) => {
    if (notification.isRead) return
    await markNotificationAsRead(notification.id)
    setNotifications((current) =>
      current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item),
    )
  }

  return (
    <header className="flex h-24 shrink-0 items-center justify-end gap-6 border-b border-gray-100 bg-white px-8">
      {!notificationsOnly && (
        <label className="flex h-14 w-full max-w-[425px] items-center gap-3 rounded-xl bg-gray-50 px-4 text-gray-500">
          <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <input type="search" placeholder="Search anything..." aria-label="Search anything" className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400" />
          <kbd className="hidden text-xs text-gray-400 sm:inline">Ctrl K</kbd>
        </label>
      )}
      <div className="relative shrink-0">
        <button type="button" className="flex h-14 items-center gap-3 rounded-xl bg-gray-50 px-7 text-sm font-semibold text-gray-800 hover:bg-gray-100" aria-label="View notifications" aria-expanded={isNotificationsOpen} onClick={() => setIsNotificationsOpen((open) => !open)}>
          <span>Notifications</span>
          <span className={`h-1.5 w-1.5 rounded-full ${unreadNotifications ? 'bg-[#1e3a2c]' : 'bg-gray-300'}`} />
        </button>
        {isNotificationsOpen && (
          <div className="absolute right-0 top-full z-10 mt-3 w-80 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
              <span className="text-xs text-gray-400">{unreadNotifications} unread</span>
            </div>
            {notifications.length === 0 && <p className="px-5 py-4 text-xs text-gray-400">No notifications</p>}
            {notifications.map((notification) => (
              <button key={notification.id} type="button" onClick={() => void markAsRead(notification)} className="flex w-full items-start gap-3 border-b border-gray-50 px-5 py-4 text-left hover:bg-gray-50">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.isRead ? 'bg-gray-200' : 'bg-[#1e3a2c]'}`} />
                <span>
                  <span className="block text-sm text-gray-800">{notification.title}</span>
                  <span className="mt-1 block text-xs text-gray-400">{notification.message}</span>
                  <span className="mt-1 block text-xs text-gray-400">{new Date(notification.createdAt).toLocaleString()}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      {!notificationsOnly && (
        <button type="button" className="flex h-14 items-center gap-3 rounded-xl bg-gray-50 px-3 text-left hover:bg-gray-100" aria-label="Open profile">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3a2c] text-xs font-semibold text-white">
            {session?.fullName.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block max-w-[140px] truncate text-sm font-semibold text-gray-800">{session?.fullName}</span>
            <span className="block text-xs text-gray-400">{session?.role}</span>
          </span>
        </button>
      )}
    </header>
  )
}
