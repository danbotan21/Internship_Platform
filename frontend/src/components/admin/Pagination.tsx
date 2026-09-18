type PaginationProps = {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

const MAX_PAGE_BUTTONS = 5

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const first = Math.max(1, Math.min(page - Math.floor(MAX_PAGE_BUTTONS / 2), totalPages - MAX_PAGE_BUTTONS + 1))
  const pages = Array.from({ length: Math.min(MAX_PAGE_BUTTONS, totalPages) }, (_, index) => first + index)

  const base = 'h-10.5 rounded-[9px] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <nav aria-label="Pagination" className="ml-auto flex items-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={`${base} w-24.5 bg-[#f8f9fa] text-[#718078]`}
      >
        Previous
      </button>
      {pages.map((number) => (
        <button
          key={number}
          type="button"
          aria-current={number === page ? 'page' : undefined}
          onClick={() => onChange(number)}
          className={`${base} w-10.5 ${number === page ? 'bg-[#1b4332] text-white' : 'bg-[#f8f9fa] text-[#718078]'}`}
        >
          {number}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className={`${base} w-20 bg-[#f8f9fa] text-[#1b4332]`}
      >
        Next
      </button>
    </nav>
  )
}
