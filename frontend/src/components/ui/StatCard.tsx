import type { LucideIcon } from 'lucide-react'
import { card } from './styles'

type StatCardProps = {
  title: string
  count: number
  caption: string
  icon?: LucideIcon
  highlight?: boolean
}

export default function StatCard({ title, count, caption, icon: Icon, highlight }: StatCardProps) {
  return (
    <div className={`${card} flex items-center gap-4 px-4 py-4 ${highlight ? 'ring-2 ring-[#f2d5b3]' : ''}`}>
      {Icon ? (
        <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#e8f2ed] text-[#184b38]'>
          <Icon className='size-5' aria-hidden='true' />
        </div>
      ) : null}
      <div className='min-w-0'>
        <p className='text-[13px] text-[#5d6b64]'>{title}</p>
        <p className='flex items-baseline gap-2'>
          <strong className='text-[22px] tabular-nums text-[#14211b]'>{count}</strong>
          <span className='truncate text-[12px] text-[#8a958f]'>{caption}</span>
        </p>
      </div>
    </div>
  )
}
