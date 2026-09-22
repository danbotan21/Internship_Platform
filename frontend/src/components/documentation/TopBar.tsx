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
  LogOut,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import ConfirmLogoutModal from '../ConfirmLogoutModal'

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
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

export default function TopBar() {
  const { session, logout } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''

  const handleSearchChange = (val: string) => {
    setSearchParams(
      (prev) => {
        if (val) prev.set('q', val)
        else prev.delete('q')
        return prev
      },
      { replace: true }
    )
  }

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)
  const [isOpen, setIsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length
  const initials = session?.fullName ? getInitials(session.fullName) : 'U'

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
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
        setIsUserMenuOpen(false)
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
    <header className="relative flex items-center justify-between gap-6 bg-gradient-to-r from-[#eff4f1] via-[#e5ede9] to-[#d4e2dc] px-10 py-5">
      {/* Abstract Background Waves (SVG) */}
      <svg className="absolute right-0 top-0 h-full w-[60%] pointer-events-none" preserveAspectRatio="none" viewBox="0 0 800 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.5" d="M800 0H200C350 20 450 100 800 100V0Z" fill="#B4CFC3" />
        <path opacity="0.3" d="M800 0H400C550 40 650 100 800 100V0Z" fill="#7FA995" />
      </svg>
      
      {/* Search Bar - extended to get closer to notification icon */}
      <div className="relative z-10 flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search documents, templates, requirements..."
          className="w-full rounded-full border border-white bg-white py-3 pl-12 pr-4 text-base text-gray-800 placeholder-gray-400 shadow-sm transition-colors focus:border-[#1e3a2c] focus:outline-none focus:ring-1 focus:ring-[#1e3a2c]"
        />
      </div>

      {/* Right Controls: Notification bell & User avatar initials without photo */}
      <div className="relative z-10 flex items-center gap-4 shrink-0">
        {/* Interactive Notification Bell with Dropdown */}
        <div className="relative" ref={containerRef}>
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setIsOpen((prev) => !prev)}
            className={`relative flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-gray-50 ${
              isOpen ? 'text-gray-900 ring-2 ring-[#1e3a2c]/20' : 'text-gray-600'
            }`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFB800] text-xs font-bold text-white shadow-sm animate-in zoom-in-50">
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

        {/* User Avatar & Profile Dropdown: Connected to authenticated user session */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full p-0.5 transition-all hover:ring-2 hover:ring-[#1e3a2c]/30 focus:outline-none"
            title={session ? `${session.fullName} (${session.role})` : 'User profile'}
            aria-label="User profile menu"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1e3a2c] text-sm font-semibold text-white shadow-sm select-none">
              {initials}
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50">
              <div className="border-b border-gray-100 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e3a2c] text-sm font-semibold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {session?.fullName ?? 'User'}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {session?.email ?? ''}
                    </p>
                  </div>
                </div>
                <div className="mt-2.5">
                  <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-600/20 ring-inset">
                    {session?.role ?? 'Student'}
                  </span>
                </div>
              </div>

              <div className="p-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false)
                    setIsLogoutModalOpen(true)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmLogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
      />
    </header>
  )
}
