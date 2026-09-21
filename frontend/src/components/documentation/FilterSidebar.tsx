import type { DocumentCategory, DocumentStatus } from '../../types/documentation'

interface FilterSidebarProps {
  categoryFilters: Record<DocumentCategory, boolean>
  statusFilters: Record<DocumentStatus, boolean>
  mandatoryOnly: boolean
  onToggleCategory: (category: DocumentCategory) => void
  onToggleStatus: (status: DocumentStatus) => void
  onToggleMandatory: () => void
}

const CATEGORIES: DocumentCategory[] = [
  'Reports',
  'Certificates',
  'Evaluations',
  'Agreements',
  'Templates',
  'Other',
]

const STATUSES: DocumentStatus[] = ['Approved', 'Pending', 'Rejected', 'Expiring']

export default function FilterSidebar({
  categoryFilters,
  statusFilters,
  mandatoryOnly,
  onToggleCategory,
  onToggleStatus,
  onToggleMandatory,
}: FilterSidebarProps) {
  return (
    <aside className="w-64 shrink-0 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs">
      {/* Category Section */}
      <div className="mb-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Category
        </h3>
        <div className="space-y-2.5">
          {CATEGORIES.map((cat) => {
            const isChecked = !!categoryFilters[cat]
            return (
              <label
                key={cat}
                className="group flex cursor-pointer items-center gap-2.5 text-sm text-gray-700 transition-colors hover:text-gray-900"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleCategory(cat)}
                  className="h-4.5 w-4.5 rounded-sm border-gray-300 text-[#FF7A00] focus:ring-[#FF7A00] accent-[#FF7A00]"
                />
                <span className="font-normal select-none">{cat}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Status Section */}
      <div className="mb-6 border-t border-gray-100 pt-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Status
        </h3>
        <div className="space-y-2.5">
          {STATUSES.map((status) => {
            const isChecked = !!statusFilters[status]
            return (
              <label
                key={status}
                className="group flex cursor-pointer items-center gap-2.5 text-sm text-gray-700 transition-colors hover:text-gray-900"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleStatus(status)}
                  className="h-4.5 w-4.5 rounded-sm border-gray-300 text-[#FF7A00] focus:ring-[#FF7A00] accent-[#FF7A00]"
                />
                <span className="font-normal select-none">{status}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Mandatory Only Toggle */}
      <div className="border-t border-gray-100 pt-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Mandatory only</span>
          <button
            type="button"
            role="switch"
            aria-checked={mandatoryOnly}
            onClick={onToggleMandatory}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              mandatoryOnly ? 'bg-[#FF7A00]' : 'bg-gray-200'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                mandatoryOnly ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </aside>
  )
}
