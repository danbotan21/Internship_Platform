import type { VerificationStatus } from '../../types/adminVerification'

const styles: Record<VerificationStatus, string> = {
  Pending: 'bg-[#fff0e3] text-[#a54a00]',
  Approved: 'bg-[#eaf3ed] text-[#1b4332]',
  Rejected: 'bg-[#fde8e6] text-[#b42318]',
}

export default function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  return (
    <span
      className={`inline-flex h-7 min-w-24 items-center justify-center rounded-md px-3 text-[11px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  )
}
