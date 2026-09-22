import { LoaderCircle, type LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  loading?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[#184b38] text-white hover:bg-[#1f5c45] focus-visible:outline-[#184b38]',
  secondary:
    'border border-[#d9e0dc] bg-white text-[#184b38] hover:bg-[#f2f5f3] focus-visible:outline-[#184b38]',
  danger:
    'border border-[#efc1bb] bg-white text-[#a1332b] hover:bg-[#fdf0ef] focus-visible:outline-[#a1332b]',
  ghost: 'text-[#184b38] hover:bg-[#eef3f0] focus-visible:outline-[#184b38]',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'gap-1.5 px-3 py-1.5 text-[13px]',
  md: 'gap-2 px-4 py-2.5 text-[14px]',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-lg font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <LoaderCircle className='size-4 animate-spin' aria-hidden='true' />
      ) : Icon ? (
        <Icon className='size-4' aria-hidden='true' />
      ) : null}
      {children}
    </button>
  )
}
