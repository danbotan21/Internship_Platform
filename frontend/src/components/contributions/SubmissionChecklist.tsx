import { CircleCheck, CircleDashed } from 'lucide-react'
import type { SubmissionCheck } from '../../types/contribution'

// Requirements computed by the backend; the same rules block the submit call.
export default function SubmissionChecklist({ checks }: { checks: SubmissionCheck[] }) {
  const passed = checks.filter((check) => check.passed).length
  return (
    <div>
      <div className='flex items-center justify-between gap-3'>
        <p className='text-[13px] font-semibold text-[#14211b]'>Ready to submit?</p>
        <span className='text-[12px] tabular-nums text-[#5d6b64]'>
          {passed} / {checks.length}
        </span>
      </div>
      <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-[#eef1ef]'>
        <div
          className='h-full rounded-full bg-[#2c8a5a] transition-all'
          style={{ width: `${checks.length ? (passed / checks.length) * 100 : 0}%` }}
        />
      </div>
      <ul className='mt-4 space-y-2.5'>
        {checks.map((check) => (
          <li key={check.code} className='flex gap-2.5'>
            {check.passed ? (
              <CircleCheck className='mt-0.5 size-4 shrink-0 text-[#2c8a5a]' aria-label='Done' />
            ) : (
              <CircleDashed className='mt-0.5 size-4 shrink-0 text-[#c07a2c]' aria-label='Missing' />
            )}
            <div>
              <p className={`text-[13px] ${check.passed ? 'text-[#5d6b64]' : 'font-medium text-[#14211b]'}`}>
                {check.label}
              </p>
              {!check.passed && check.detail ? (
                <p className='text-[12px] text-[#a3530f]'>{check.detail}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
