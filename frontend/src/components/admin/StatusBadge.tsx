import type { UserStatus } from '../../types/adminUsers'

const styles: Record<UserStatus, string> = {
  Active: 'bg-[#eaf3ed] text-[#1b4332]',
  Deactivated: 'bg-[#fff0e3] text-[#a54a00]',
}

type StatusBadgeProps = {
  status: UserStatus
  size?: 'sm' | 'lg'
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const sizing = size === 'lg' ? 'h-9 w-full rounded-lg text-xs' : 'h-7 min-w-24 rounded-md px-3 text-[11px]'

  return (
    <span className={`inline-flex items-center justify-center gap-2 font-semibold ${sizing} ${styles[status]}`}>
      {size === 'lg' && <span aria-hidden="true">●</span>}
      {status === 'Active' ? 'Active' : 'Deactivated'}
      {size === 'lg' && ' account'}
    </span>
  )
}
