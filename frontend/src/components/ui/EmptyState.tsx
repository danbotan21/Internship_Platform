import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center gap-2 rounded-xl border border-dashed border-[#d3dbd6] bg-white/60 px-6 py-10 text-center'>
      <div className='flex size-11 items-center justify-center rounded-full bg-[#e8f2ed] text-[#184b38]'>
        <Icon className='size-5' aria-hidden='true' />
      </div>
      <p className='mt-1 text-[15px] font-semibold text-[#14211b]'>{title}</p>
      {description ? <p className='max-w-md text-[13px] text-[#5d6b64]'>{description}</p> : null}
      {action ? <div className='mt-3'>{action}</div> : null}
    </div>
  )
}
