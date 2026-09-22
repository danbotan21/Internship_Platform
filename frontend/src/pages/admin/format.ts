import type { CompanyRole, DirectoryRole } from '../../types/adminUsers'

const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })
const dayMonth = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const dayMonthYear = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const longDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

const MS_PER_DAY = 24 * 60 * 60 * 1000

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/** "Today · 14:36", "Yesterday · 17:04", "7 Sep · 16:20", "7 Sep 2025 · 16:20". */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / MS_PER_DAY)

  const day =
    daysAgo === 0
      ? 'Today'
      : daysAgo === 1
        ? 'Yesterday'
        : date.getFullYear() === now.getFullYear()
          ? dayMonth.format(date)
          : dayMonthYear.format(date)

  return `${day} · ${time.format(date)}`
}

/** Same as formatTimestamp, but "Never" when the value is missing. */
export function formatLastActive(iso: string | null): string {
  return iso ? formatTimestamp(iso) : 'Never'
}

export function formatLongDate(iso: string): string {
  return longDate.format(new Date(iso))
}

export const directoryRoleLabels: Record<DirectoryRole, string> = {
  User: 'User',
  Admin: 'Admin',
  Owner: 'Owner',
  Recruiter: 'Recruiter',
  Mentor: 'Mentor',
}

export const companyRoleLabels: Record<CompanyRole, string> = {
  Owner: 'Owner',
  Recruiter: 'Recruiter',
  Mentor: 'Mentor',
}
