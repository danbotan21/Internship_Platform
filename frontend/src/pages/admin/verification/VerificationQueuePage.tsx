import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import AdminHeader from '../../../components/admin/AdminHeader'
import Pagination from '../../../components/admin/Pagination'
import TableMessage from '../../../components/admin/TableMessage'
import VerificationStatusBadge from '../../../components/admin/VerificationStatusBadge'
import { fetchVerificationQueue } from '../../../api/adminVerification'
import { useSearchParamsUpdater } from '../../../hooks/useSearchParamsUpdater'
import type {
  VerificationCounts,
  VerificationQueueQuery,
  VerificationQueueResult,
  VerificationQueueSort,
  VerificationStatus,
} from '../../../types/adminVerification'
import { formatTimestamp } from '../format'

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 300

const tabs: { value: VerificationStatus; label: string; count: keyof VerificationCounts }[] = [
  { value: 'Pending', label: 'Pending', count: 'pending' },
  { value: 'Approved', label: 'Approved', count: 'approved' },
  { value: 'Rejected', label: 'Rejected', count: 'rejected' },
]

type Response =
  | { key: string; result: VerificationQueueResult }
  | { key: string; error: true }

export default function VerificationQueuePage() {
  const [searchParams, updateParams] = useSearchParamsUpdater()

  const status: VerificationStatus = tabs.find((t) => t.value === searchParams.get('status'))?.value ?? 'Pending'
  const sort: VerificationQueueSort = searchParams.get('sort') === 'NewestFirst' ? 'NewestFirst' : 'OldestFirst'
  const search = searchParams.get('search') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const [searchDraft, setSearchDraft] = useState(search)
  const [response, setResponse] = useState<Response | null>(null)

  const query = useMemo<VerificationQueueQuery>(
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
    fetchVerificationQueue(query, controller.signal)
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

  const requests = lastResult?.requests
  const counts = lastResult?.counts
  const totalPages = requests ? Math.max(1, Math.ceil(requests.totalCount / requests.pageSize)) : 1
  const firstShown = requests && requests.totalCount > 0 ? (requests.page - 1) * requests.pageSize + 1 : 0
  const lastShown = requests && requests.items.length > 0 ? firstShown + requests.items.length - 1 : 0

  return (
    <>
      <AdminHeader crumbs={[{ label: 'Admin' }, { label: 'Company verification' }]} />

      <div className="flex flex-col gap-6 p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[30px] leading-11 font-bold">Company verification</h1>
          <p className="text-[13px] text-[#718078]">Approve companies before they can post opportunities.</p>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Request status">
          {tabs.map((tab) => {
            const selected = tab.value === status
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => updateParams({ status: tab.value === 'Pending' ? undefined : tab.value })}
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
            <span className="sr-only">Search company or requester</span>
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#718078]" aria-hidden="true" />
            <input
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search company or requester…"
              className="h-full w-full rounded-[9px] bg-transparent pr-3 pl-10 text-[13px] outline-none placeholder:text-[#718078] focus:ring-2 focus:ring-[#1b4332]/30"
            />
          </label>

          <button
            type="button"
            onClick={() => updateParams({ sort: sort === 'OldestFirst' ? 'NewestFirst' : undefined })}
            className="text-xs font-medium text-[#718078] hover:text-[#172c23]"
          >
            Sort: {sort === 'OldestFirst' ? 'Oldest first' : 'Newest first'}
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#e2e8e4] bg-white">
          <table className={`w-full table-fixed text-left transition-opacity ${isLoading && requests ? 'opacity-60' : ''}`}>
            <thead className="bg-[#f8f9fa] text-[10px] font-bold tracking-wide text-[#718078] uppercase">
              <tr>
                <th scope="col" className="w-[36%] px-5 py-3.5">Company</th>
                <th scope="col" className="w-[16%] px-4 py-3.5">Status</th>
                <th scope="col" className="w-[18%] px-4 py-3.5">Requested by</th>
                <th scope="col" className="w-[14%] px-4 py-3.5">Domain check</th>
                <th scope="col" className="w-[16%] px-4 py-3.5">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {requests?.items.map((request) => (
                <tr key={request.id} className="border-t border-[#e2e8e4] hover:bg-[#f8f9fa]">
                  <td className="px-5 py-3.5">
                    <Link to={`/admin/verification/${request.id}`} className="group flex flex-col gap-0.75">
                      <span className="truncate text-[13px] font-semibold group-hover:underline">
                        {request.legalName}
                      </span>
                      <span className="truncate text-[10px] text-[#718078]">IDNO {request.registrationNumber}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <VerificationStatusBadge status={request.status} />
                  </td>
                  <td className="truncate px-4 py-3.5 text-[11px] font-medium text-[#718078]">
                    {request.requesterName}
                  </td>
                  <td
                    className={`px-4 py-3.5 text-[11px] font-medium ${
                      request.emailDomainMatchesWebsite ? 'text-[#718078]' : 'text-[#a54a00]'
                    }`}
                  >
                    {request.emailDomainMatchesWebsite ? 'Match' : 'No match'}
                  </td>
                  <td className="px-4 py-3.5 text-[11px] font-medium text-[#718078]">
                    {formatTimestamp(request.submittedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!requests && isLoading && <TableMessage>Loading requests…</TableMessage>}
          {failed && <TableMessage>Couldn't load requests. Check that the API is running and try again.</TableMessage>}
          {requests && requests.items.length === 0 && !isLoading && (
            <TableMessage>
              {status === 'Pending' && !search ? 'Nothing to review — the queue is empty.' : 'No requests match.'}
            </TableMessage>
          )}

          {requests && requests.totalCount > 0 && (
            <div className="flex items-center gap-4 border-t border-[#e2e8e4] px-5 py-2">
              <p className="text-[11px] text-[#718078]">
                Showing {firstShown}–{lastShown} of {requests.totalCount} requests
              </p>
              <Pagination
                page={requests.page}
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
