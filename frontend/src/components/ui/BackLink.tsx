import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

// The "back to the list" link above a detail page.
export default function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className='mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#184b38] hover:underline'
    >
      <ArrowLeft className='size-4' aria-hidden='true' />
      {children}
    </Link>
  )
}
