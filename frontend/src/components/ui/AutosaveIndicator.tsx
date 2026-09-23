import { CircleAlert, CircleCheck, CircleDot, LoaderCircle } from 'lucide-react'

type AutosaveIndicatorProps = {
  status: 'idle' | 'pending' | 'saving' | 'saved' | 'failed'
  error?: string
}

// Quiet save state next to a form that saves itself.
export default function AutosaveIndicator({ status, error }: AutosaveIndicatorProps) {
  if (status === 'idle') return null

  const content = {
    pending: { icon: CircleDot, text: 'Unsaved changes', tone: 'text-[#8a958f]' },
    saving: { icon: LoaderCircle, text: 'Saving…', tone: 'text-[#5d6b64]' },
    saved: { icon: CircleCheck, text: 'All changes saved', tone: 'text-[#17603f]' },
    failed: { icon: CircleAlert, text: `Not saved — ${error || 'try again'}`, tone: 'text-[#a3530f]' },
  }[status]
  const Icon = content.icon

  return (
    <span className={`inline-flex max-w-xs items-center gap-1.5 text-[12px] font-medium ${content.tone}`} role='status'>
      <Icon className={`size-3.5 shrink-0 ${status === 'saving' ? 'animate-spin' : ''}`} aria-hidden='true' />
      <span className='truncate' title={content.text}>
        {content.text}
      </span>
    </span>
  )
}
