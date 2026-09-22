import type { User } from '../../types/messaging'

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
}

type AvatarProps = {
  user?: User
  label?: string
  color?: string
  size?: keyof typeof sizes
  showPresence?: boolean
}

export default function Avatar({ user, label, color, size = 'md', showPresence = false }: AvatarProps) {
  return (
    <div className="relative shrink-0">
      <div
        className={`flex items-center justify-center rounded-full font-semibold text-white ${sizes[size]}`}
        style={{ backgroundColor: color ?? user?.color ?? '#1e3a2c' }}
      >
        {label ?? user?.initials}
      </div>
      {showPresence && user?.online && (
        <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
      )}
    </div>
  )
}
