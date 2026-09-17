import { useState, useRef, useEffect } from 'react'
import {
  Search,
  Bell,
  CheckCheck,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  X,
} from 'lucide-react'

interface TopBarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
}

interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'success' | 'warning' | 'info' | 'reminder'
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'File Approved by Mentor',
    message: 'Spring_Milestone_2_Report.pdf approved by Dr. Michael Chen.',
    time: '2 hours ago',
    read: false,
    type: 'success',
  },
  {
    id: 'n-2',
    title: 'Action Required: H&S Form',
    message: 'Mandatory Health & Safety compliance agreement requires your signature.',
    time: '5 hours ago',
    read: false,
    type: 'warning',
  },
  {
    id: 'n-3',
    title: 'New Document Uploaded',
    message: 'Institutional_Sign_Off_Agreement.docx uploaded to your documentation vault.',
    time: 'Yesterday',
    read: false,
    type: 'info',
  },
  {
    id: 'n-4',
    title: 'Midterm Evaluation Window',
    message: 'Practicum midterm evaluation checklist is scheduled for sign-off next week.',
    time: '2 days ago',
    read: false,
    type: 'reminder',
  },
  {
    id: 'n-5',
    title: 'Evaluation Stamped',
    message: 'Completed_Practicum_Evaluation.xlsx rubric stamped by University Coordinator.',
    time: '3 days ago',
    read: false,
    type: 'success',
  },
]

export default function TopBar({ searchQuery, onSearchChange }: TopBarProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    )
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'info':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'reminder':
        return <Clock className="h-4 w-4 text-purple-500" />
    }
  }

  return (
    <header className="mb-6 flex items-center justify-between gap-6 border-b border-gray-200 pb-5">
      {/* Search Bar - extended to get closer to notification icon */}
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search documents, templates, requirements..."
          className="w-full rounded-full border border-gray-200 bg-[#EEF2EF]/60 py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 transition-colors focus:border-[#1e3a2c] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1e3a2c]"
        />
      </div>

      {/* Right Controls: Notification bell & User avatar initials without photo */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Interactive Notification Bell with Dropdown */}
        <div className="relative" ref={containerRef}>
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setIsOpen((prev) => !prev)}
            className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
              isOpen
                ? 'border-[#1e3a2c] bg-gray-100 text-gray-900'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFB800] text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Card */}
          {isOpen && (
            <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-2xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-[#FF7A00]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No notifications right now.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleRead(item.id)}
                      className={`flex cursor-pointer items-start gap-3 p-3.5 text-xs transition-colors hover:bg-gray-50/80 ${
                        !item.read ? 'bg-orange-50/20' : 'bg-white'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {getNotificationIcon(item.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`font-semibold ${!item.read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {item.title}
                          </p>
                          {!item.read && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF7A00]" />
                          )}
                        </div>
                        <p className="mt-0.5 text-gray-600 leading-snug">
                          {item.message}
                        </p>
                        <p className="mt-1 text-[10px] text-gray-400 font-medium">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/60 px-4 py-2.5">
                  <span className="text-[11px] text-gray-400">
                    Click an item to mark as read
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Avatar: Initials IP without photo */}
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a2c] text-xs font-semibold text-white shadow-xs select-none"
            title="Ion Popescu (Student)"
          >
            IP
          </div>
        </div>
      </div>
    </header>
  )
}
