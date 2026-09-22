import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import AdminHeader from '../../../components/admin/AdminHeader'
import CompanyStatusBadge from '../../../components/admin/CompanyStatusBadge'
import Pagination from '../../../components/admin/Pagination'
import TableMessage from '../../../components/admin/TableMessage'
import { fetchCompanies } from '../../../api/adminCompanies'
import { useSearchParamsUpdater } from '../../../hooks/useSearchParamsUpdater'
import type {
  CompanyCounts,
  CompanyListQuery,
  CompanyListResult,
  CompanyListSort,
  CompanyStatus,
} from '../../../types/adminCompanies'

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 300

const tabs: { value: CompanyStatus; label: string; count: keyof CompanyCounts }[] = [
  { value: 'Active', label: 'Verified', count: 'active' },
  { value: 'Suspended', label: 'Suspended', count: 'suspended' },
]

type Response =
  | { key: string; result: CompanyListResult }
  | { key: string; error: true }

export default function CompanyListPage() {
  const [searchParams, updateParams] = useSearchParamsUpdater()

  const status: CompanyStatus = searchParams.get('status') === 'Suspended' ? 'Suspended' : 'Active'
  const sort: CompanyListSort = searchParams.get('sort') === 'NameDesc' ? 'NameDesc' : 'NameAsc'
  const search = searchParams.get('search') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const [searchDraft, setSearchDraft] = useState(search)
  const [response, setResponse] = useState<Response | null>(null)

  const query = useMemo<CompanyListQuery>(
    () => ({ status, search: search || undefined, sort, page, pageSize: PAGE_SIZE }),
    [status, search, sort, page],
  )
  const requestKey = JSON.stringify(query)

  useEffect(() => {
    const trimmed = searchDraft.trim()
    if (trimmed === search) {
      return
    }
    const timer = window.setTimeout(() => updateParams({ search: trimmed || undefined }), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchDraft, search, updateParams])

  useEffect(() => {
    const controller = new AbortController()
    fetchCompanies(query, controller.signal)
      .then((result) => setResponse({ key: requestKey, result }))
      .catch(() => {
        if (!controller.signal.aborted) {
          setResponse({ key: requestKey, error: true })
        }
      })
    return () => controller.abort()
  }, [query, requestKey])

  const isLoading = response?.key !== requestKey
  const failed = !isLoading && response !== null && 'error' in response
  const lastResult = response && 'result' in response ? response.result : null

  const companies = lastResult?.companies
  const counts = lastResult?.counts
  const totalPages = companies ? Math.max(1, Math.ceil(companies.totalCount / companies.pageSize)) : 1
  const firstShown = companies && companies.totalCount > 0 ? (companies.page - 1) * companies.pageSize + 1 : 0
  const lastShown = companies && companies.items.length > 0 ? firstShown + companies.items.length - 1 : 0

  return (
    <>
      <AdminHeader crumbs={[{ label: 'Admin' }, { label: 'Companies' }]} />

      <div className="flex flex-col gap-6 p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[30px] leading-11 font-bold">Companies</h1>
          <p className="text-[13px] text-[#718078]">Every company that has been through verification.</p>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Company status">
          {tabs.map((tab) => {
            const selected = tab.value === status
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => updateParams({ status: tab.value === 'Active' ? undefined : tab.value })}
                className={`h-10.5 rounded-[9px] px-5 text-[13px] font-bold transition-colors ${
                  selected ? 'bg-[#1b4332] text-white' : 'bg-white text-[#718078] hover:text-[#172c23]'
                }`}
              >
                {tab.label}
                {counts && <span className="ml-2 font-medium opacity-80">{counts[tab.count]}</span>}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="relative flex h-10.5 w-80 items-center rounded-[9px] bg-white">
            <span className="sr-only">Search company or owner</span>
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#718078]" aria-hidden="true" />
            <input
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search company or owner…"
              className="h-full w-full rounded-[9px] bg-transparent pr-3 pl-10 text-[13px] outline-none placeholder:text-[#718078] focus:ring-2 focus:ring-[#1b4332]/30"
            />
          </label>

          <button
            type="button"
            onClick={() => updateParams({ sort: sort === 'NameAsc' ? 'NameDesc' : undefined })}
            className="text-xs font-medium text-[#718078] hover:text-[#172c23]"
          >
            Sort: Name {sort === 'NameAsc' ? '↑' : '↓'}
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#e2e8e4] bg-white">
          <table className={`w-full table-fixed text-left transition-opacity ${isLoading && companies ? 'opacity-60' : ''}`}>
            <thead className="bg-[#f8f9fa] text-[10px] font-bold tracking-wide text-[#718078] uppercase">
              <tr>
                <th scope="col" className="w-[40%] px-5 py-3.5">Company</th>
                <th scope="col" className="w-[18%] px-4 py-3.5">Status</th>
                <th scope="col" className="w-[24%] px-4 py-3.5">Owner</th>
                <th scope="col" className="w-[18%] px-4 py-3.5">Members</th>
              </tr>
            </thead>
            <tbody>
              {companies?.items.map((company) => (
                <tr key={company.id} className="border-t border-[#e2e8e4] hover:bg-[#f8f9fa]">
                  <td className="px-5 py-3.5">
                    <Link to={`/admin/companies/${company.id}`} className="group flex flex-col gap-0.75">
                      <span className="truncate text-[13px] font-semibold group-hover:underline">
                        {company.legalName}
                      </span>
                      <span className="truncate text-[10px] text-[#718078]">IDNO {company.registrationNumber}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <CompanyStatusBadge status={company.status} />
                  </td>
                  <td className="truncate px-4 py-3.5 text-[11px] font-medium text-[#718078]">
                    {company.ownerName ?? '—'}
                  </td>
                  <td className="px-4 py-3.5 text-[11px] font-medium text-[#718078]">
                    {company.memberCount === 1 ? '1 member' : `${company.memberCount} members`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!companies && isLoading && <TableMessage>Loading companies…</TableMessage>}
          {failed && <TableMessage>Couldn't load companies. Check that the API is running and try again.</TableMessage>}
          {companies && companies.items.length === 0 && !isLoading && (
            <TableMessage>No companies match.</TableMessage>
          )}

          {companies && companies.totalCount > 0 && (
            <div className="flex items-center gap-4 border-t border-[#e2e8e4] px-5 py-2">
              <p className="text-[11px] text-[#718078]">
                Showing {firstShown}–{lastShown} of {companies.totalCount} companies
              </p>
              <Pagination
                page={companies.page}
                totalPages={totalPages}
                onChange={(next) => updateParams({ page: next > 1 ? String(next) : undefined }, false)}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
