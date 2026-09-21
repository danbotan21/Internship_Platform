import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import AdminHeader from '../../../components/admin/AdminHeader'
import StatusBadge from '../../../components/admin/StatusBadge'
import Pagination from '../../../components/admin/Pagination'
import TableMessage from '../../../components/admin/TableMessage'
import { useSearchParamsUpdater } from '../../../hooks/useSearchParamsUpdater'
import { fetchUserDirectory } from '../../../api/adminUsers'
import type {
  DirectoryRole,
  UserDirectoryCounts,
  UserDirectoryQuery,
  UserDirectoryResult,
  UserDirectoryScope,
  UserDirectorySort,
  UserStatus,
} from '../../../types/adminUsers'
import { directoryRoleLabels, formatLastActive } from '../format'

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 300

const scopes: { value: UserDirectoryScope; label: string; count: keyof UserDirectoryCounts }[] = [
  { value: 'All', label: 'All users', count: 'all' },
  { value: 'CompanyMembers', label: 'Company members', count: 'companyMembers' },
  { value: 'Admins', label: 'Admins', count: 'admins' },
]

const roles: DirectoryRole[] = ['User', 'Admin', 'Owner', 'Recruiter', 'Mentor']
const statuses: UserStatus[] = ['Active', 'Deactivated']

function pick<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return allowed.find((item) => item === value)
}

type Response =
  | { key: string; result: UserDirectoryResult }
  | { key: string; error: true }

export default function UserDirectoryPage() {
  const [searchParams, updateParams] = useSearchParamsUpdater()

  // The URL is the source of truth, so filters survive a reload and the back button.
  const scope = pick(searchParams.get('scope'), scopes.map((s) => s.value)) ?? 'All'
  const role = pick(searchParams.get('role'), roles)
  const status = pick(searchParams.get('status'), statuses)
  const sort: UserDirectorySort = searchParams.get('sort') === 'NameDesc' ? 'NameDesc' : 'NameAsc'
  const search = searchParams.get('search') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const [searchDraft, setSearchDraft] = useState(search)
  const [response, setResponse] = useState<Response | null>(null)

  const query = useMemo<UserDirectoryQuery>(
    () => ({ scope, search: search || undefined, role, status, sort, page, pageSize: PAGE_SIZE }),
    [scope, search, role, status, sort, page],
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
    fetchUserDirectory(query, controller.signal)
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
  // Keep showing the previous page while the next one loads, instead of flashing an empty table.
  const lastResult = response && 'result' in response ? response.result : null

  const users = lastResult?.users
  const counts = lastResult?.counts
  const totalPages = users ? Math.max(1, Math.ceil(users.totalCount / users.pageSize)) : 1
  const firstShown = users && users.totalCount > 0 ? (users.page - 1) * users.pageSize + 1 : 0
  const lastShown = users ? firstShown + users.items.length - Math.min(1, users.items.length) : 0

  return (
    <>
      <AdminHeader crumbs={[{ label: 'Admin' }, { label: 'User directory' }]} />

      <div className="flex flex-col gap-6 p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[30px] leading-11 font-bold">User directory</h1>
          <p className="text-[13px] text-[#718078]">
            Everyone with a registered account. Pending invitations appear on the company they were invited to.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Directory scope">
          {scopes.map((item) => {
            const selected = item.value === scope
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => updateParams({ scope: item.value === 'All' ? undefined : item.value })}
                className={`h-10.5 rounded-[9px] px-5 text-[13px] font-bold transition-colors ${
                  selected ? 'bg-[#1b4332] text-white' : 'bg-white text-[#718078] hover:text-[#172c23]'
                }`}
              >
                {item.label}
                {counts && <span className="ml-2 font-medium opacity-80">{counts[item.count]}</span>}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="relative flex h-10.5 w-80 items-center rounded-[9px] bg-white">
            <span className="sr-only">Search name or email</span>
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#718078]" aria-hidden="true" />
            <input
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search name or email…"
              className="h-full w-full rounded-[9px] bg-transparent pr-3 pl-10 text-[13px] outline-none placeholder:text-[#718078] focus:ring-2 focus:ring-[#1b4332]/30"
            />
          </label>

          <FilterSelect
            label="Role"
            value={role ?? ''}
            onChange={(value) => updateParams({ role: value || undefined })}
            options={roles.map((value) => ({ value, label: directoryRoleLabels[value] }))}
          />

          <FilterSelect
            label="Status"
            value={status ?? ''}
            onChange={(value) => updateParams({ status: value || undefined })}
            options={statuses.map((value) => ({ value, label: value }))}
          />

          <button
            type="button"
            onClick={() => updateParams({ sort: sort === 'NameAsc' ? 'NameDesc' : undefined })}
            className="text-xs font-medium text-[#718078] hover:text-[#172c23]"
          >
            Sort: Name {sort === 'NameAsc' ? '↑' : '↓'}
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#e2e8e4] bg-white">
          <table className={`w-full table-fixed text-left transition-opacity ${isLoading && users ? 'opacity-60' : ''}`}>
            <thead className="bg-[#f8f9fa] text-[10px] font-bold tracking-wide text-[#718078] uppercase">
              <tr>
                <th scope="col" className="w-[38%] px-5 py-3.5">User</th>
                <th scope="col" className="w-[16%] px-4 py-3.5">Status</th>
                <th scope="col" className="w-[11%] px-4 py-3.5">Role</th>
                <th scope="col" className="w-[19%] px-4 py-3.5">Organisation</th>
                <th scope="col" className="w-[16%] px-4 py-3.5">Last active</th>
              </tr>
            </thead>
            <tbody>
              {users?.items.map((user) => (
                <tr key={user.id} className="border-t border-[#e2e8e4] hover:bg-[#f8f9fa]">
                  <td className="px-5 py-3.5">
                    <Link to={`/admin/users/${user.id}`} className="group flex flex-col gap-0.75">
                      <span className="truncate text-[13px] font-semibold group-hover:underline">{user.fullName}</span>
                      <span className="truncate text-[10px] text-[#718078]">{user.email}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={user.status} />
                  </td>
                  <td
                    className={`px-4 py-3.5 text-[11px] font-medium ${
                      user.role === 'Admin' ? 'text-[#a54a00]' : 'text-[#718078]'
                    }`}
                  >
                    {directoryRoleLabels[user.role]}
                  </td>
                  <td className="truncate px-4 py-3.5 text-[11px] font-medium text-[#718078]">
                    {user.organisation ?? '—'}
                  </td>
                  <td className="px-4 py-3.5 text-[11px] font-medium text-[#718078]">
                    {formatLastActive(user.lastActiveAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!users && isLoading && <TableMessage>Loading users…</TableMessage>}
          {failed && (
            <TableMessage>
              Couldn't load users. Check that the API is running and try again.
            </TableMessage>
          )}
          {users && users.items.length === 0 && !isLoading && (
            <TableMessage>No users match these filters.</TableMessage>
          )}

          {users && users.totalCount > 0 && (
            <div className="flex items-center gap-4 border-t border-[#e2e8e4] px-5 py-2">
              <p className="text-[11px] text-[#718078]">
                Showing {firstShown}–{lastShown} of {users.totalCount} users
              </p>
              <Pagination
                page={users.page}
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

type FilterSelectProps = {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="flex h-10.5 items-center gap-1 rounded-[9px] bg-white pl-4 pr-2 text-[13px] font-bold">
      <span>{label}:</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-full cursor-pointer rounded-[9px] bg-transparent pr-1 font-bold outline-none"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
