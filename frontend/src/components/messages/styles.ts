import { AlarmClock, CalendarDays, ListChecks, Megaphone, MessageSquare } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { NotificationCategory } from '../../types/messaging'

export const categoryStyle: Record<NotificationCategory, { icon: LucideIcon; tone: string }> = {
  deadline: { icon: AlarmClock, tone: 'bg-orange-100 text-orange-600' },
  task: { icon: ListChecks, tone: 'bg-emerald-100 text-emerald-700' },
  event: { icon: CalendarDays, tone: 'bg-sky-100 text-sky-700' },
  message: { icon: MessageSquare, tone: 'bg-violet-100 text-violet-700' },
  announcement: { icon: Megaphone, tone: 'bg-amber-100 text-amber-700' },
}

export const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#1e3a2c] focus:ring-2 focus:ring-[#1e3a2c]/10'

export const primaryButton =
  'rounded-lg bg-[#1e3a2c] px-4 py-2 text-sm font-medium text-white hover:bg-[#28503c] disabled:cursor-not-allowed disabled:opacity-40'

export const secondaryButton =
  'rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
