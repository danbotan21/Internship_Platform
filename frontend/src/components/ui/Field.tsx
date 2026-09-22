import type { ReactNode } from 'react'
import { label as labelClass } from './styles'

type FieldProps = {
  label: string
  htmlFor?: string
  required?: boolean
  hint?: ReactNode
  error?: string | null
  counter?: { value: number; min?: number; max?: number }
  children: ReactNode
  className?: string
}

// Label, control, hint and validation message in one consistent block.
export default function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  counter,
  children,
  className = '',
}: FieldProps) {
  const counterTone =
    counter && counter.min && counter.value < counter.min ? 'text-[#a3530f]' : 'text-[#8a958f]'

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className='flex items-baseline justify-between gap-3'>
        <label htmlFor={htmlFor} className={labelClass}>
          {label}
          {required ? <span className='ml-0.5 text-[#a1332b]'>*</span> : null}
        </label>
        {counter ? (
          <span className={`text-[12px] tabular-nums ${counterTone}`}>
            {counter.value}
            {counter.max ? ` / ${counter.max}` : ''}
            {counter.min && counter.value < counter.min ? ` (min ${counter.min})` : ''}
          </span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p className='text-[12px] text-[#a1332b]' role='alert'>
          {error}
        </p>
      ) : hint ? (
        <p className='text-[12px] text-[#5d6b64]'>{hint}</p>
      ) : null}
    </div>
  )
}
