import type { CompanyStatus } from '../../types/adminCompanies'

const styles: Record<CompanyStatus, string> = {
  Active: 'bg-[#eaf3ed] text-[#1b4332]',
  Suspended: 'bg-[#fde8e6] text-[#b42318]',
}

const labels: Record<CompanyStatus, string> = {
  Active: 'Verified',
  Suspended: 'Suspended',
}

export default function CompanyStatusBadge({ status }: { status: CompanyStatus }) {
  return (
    <span
      className={`inline-flex h-7 min-w-24 items-center justify-center rounded-md px-3 text-[11px] font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
