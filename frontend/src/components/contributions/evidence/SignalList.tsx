import { CircleCheck, CircleX, Info, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { SignalStatus, VerificationSignal } from '../../../types/contribution'

const signalMeta: Record<SignalStatus, { icon: LucideIcon; tone: string }> = {
  passed: { icon: CircleCheck, tone: 'text-[#17603f]' },
  info: { icon: Info, tone: 'text-[#2f5aa8]' },
  warning: { icon: TriangleAlert, tone: 'text-[#a3530f]' },
  failed: { icon: CircleX, tone: 'text-[#a1332b]' },
}

// Automatic checks the platform ran on a piece of evidence.
export default function SignalList({ signals }: { signals: VerificationSignal[] }) {
  if (!signals.length) return null
  return (
    <ul className='flex flex-wrap gap-x-4 gap-y-1.5' aria-label='Automatic verification'>
      {signals.map((signal) => {
        const { icon: Icon, tone } = signalMeta[signal.status]
        return (
          <li key={signal.code} className={`inline-flex items-center gap-1.5 text-[12px] ${tone}`}>
            <Icon className='size-3.5 shrink-0' aria-hidden='true' />
            {signal.label}
          </li>
        )
      })}
    </ul>
  )
}
