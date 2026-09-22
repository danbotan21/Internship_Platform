import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'

export type AlertTone = 'info' | 'success' | 'warning' | 'danger'

const tones: Record<AlertTone, { box: string; icon: LucideIcon }> = {
  info: { box: 'border-[#cddbf7] bg-[#f1f5fe] text-[#2f4f8f]', icon: Info },
  success: { box: 'border-[#c5e3d2] bg-[#eef8f2] text-[#17603f]', icon: CircleCheck },
  warning: { box: 'border-[#f2d5b3] bg-[#fdf5ea] text-[#8a4a0c]', icon: TriangleAlert },
  danger: { box: 'border-[#efc1bb] bg-[#fdf0ef] text-[#a1332b]', icon: CircleAlert },
}

type AlertProps = {
  tone?: AlertTone
  title?: string
  children?: ReactNode
  action?: ReactNode
  onDismiss?: () => void
  className?: string
}

export default function Alert({
  tone = 'info',
  title,
  children,
  action,
  onDismiss,
  className = '',
}: AlertProps) {
  const { box, icon: Icon } = tones[tone]
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px] ${box} ${className}`}
    >
      <Icon className='mt-0.5 size-4 shrink-0' aria-hidden='true' />
      <div className='min-w-0 flex-1'>
        {title ? <p className='font-semibold'>{title}</p> : null}
        {children ? <div className={title ? 'mt-0.5 opacity-90' : ''}>{children}</div> : null}
      </div>
      {action}
      {onDismiss ? (
        <button
          type='button'
          onClick={onDismiss}
          className='rounded p-0.5 opacity-70 hover:opacity-100'
          aria-label='Dismiss'
        >
          <X className='size-4' aria-hidden='true' />
        </button>
      ) : null}
    </div>
  )
}
