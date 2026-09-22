import type { NotificationCategory, Role } from '../../types/messaging'

const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

/** Compact relative time for the conversation list: "now", "2m", "1h", "Yesterday", "Mon", "12 Sep". */
export function formatListTime(iso: string) {
  const date = new Date(iso)
  const diff = Date.now() - date.getTime()
  if (diff < MINUTE) return 'now'
  if (diff < 60 * MINUTE) return `${Math.floor(diff / MINUTE)}m`
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY)
  if (days === 0) return `${Math.floor(diff / (60 * MINUTE))}h`
  if (days === 1) return 'Yesterday'
  if (days < 7) return date.toLocaleDateString('en-GB', { weekday: 'short' })
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export const formatClock = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

export function formatDayLabel(iso: string) {
  const date = new Date(iso)
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / DAY)
  const label = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
  if (days === 0) return `Today, ${label}`
  if (days === 1) return `Yesterday, ${label}`
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

export const isSameDay = (a: string, b: string) => startOfDay(new Date(a)) === startOfDay(new Date(b))

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export function formatLastSeen(iso: string) {
  const time = formatListTime(iso)
  return time === 'now' ? 'Active now' : `Last seen ${/^\d/.test(time) ? `${time} ago` : time}`
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const roleLabel: Record<Role, string> = {
  intern: 'Intern',
  mentor: 'Mentor',
  coordinator: 'Coordinator',
  admin: 'Admin',
}

export const categoryLabel: Record<NotificationCategory, string> = {
  deadline: 'Deadline',
  task: 'Task',
  event: 'Event',
  message: 'Message',
  announcement: 'Announcement',
}
