import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import AdminHeader from '../../../components/admin/AdminHeader'
import { fetchAdminDashboard } from '../../../api/adminDashboard'
import type { AdminDashboard } from '../../../types/adminDashboard'
import { formatLongDate } from '../format'

const MS_PER_DAY = 24 * 60 * 60 * 1000

const todayLabel = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / MS_PER_DAY))
}

function waitingLabel(iso: string): string {
  const days = daysSince(iso)
  return days === 0 ? 'Waiting since today' : days === 1 ? 'Waiting 1 day' : `Waiting ${days} days`
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}

type Response = { dashboard: AdminDashboard } | { error: true }

export default function AdminDashboardPage() {
  const [response, setResponse] = useState<Response | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchAdminDashboard(controller.signal)
      .then((dashboard) => setResponse({ dashboard }))
      .catch(() => {
        if (!controller.signal.aborted) {
          setResponse({ error: true })
        }
      })
    return () => controller.abort()
  }, [])

  const header = <AdminHeader crumbs={[{ label: 'Admin' }, { label: 'Overview' }]} />

  if (response === null || 'error' in response) {
    return (
      <>
        {header}
        <div className="m-8 rounded-xl border border-[#e2e8e4] bg-white p-10 text-center text-[13px] text-[#718078]">
          {response === null
            ? 'Loading overview…'
            : "Couldn't load the overview. Check that the API is running and try again."}
        </div>
      </>
    )
  }

  const { users, companies, verification } = response.dashboard
  const waiting = verification.pending

  return (
    <>
      {header}

      <div className="flex flex-col gap-5 p-8">
        <section className="flex flex-wrap items-center gap-6 rounded-2xl bg-[#1b4332] px-6 py-7 text-white">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="text-[10px] font-bold tracking-wide text-[#b5ccbe] uppercase">
              {todayLabel.format(new Date())}
            </p>
            <h1 className="text-[34px] leading-tight font-bold">
              {waiting === 0 ? 'Nothing waiting' : plural(waiting, 'decision waiting', 'decisions waiting')}
            </h1>
            <p className="text-[13px] text-[#cfe0d6]">
              {verification.oldestPendingSubmittedAt
                ? `The oldest has waited ${plural(daysSince(verification.oldestPendingSubmittedAt), 'day', 'days')}.`
                : 'Every verification request has been decided.'}
            </p>
          </div>
          <Link
            to="/admin/verification"
            className="flex h-10.5 items-center rounded-[9px] bg-[#315c47] px-5 text-[13px] font-bold hover:bg-[#3b6b53]"
          >
            Open verification queue
          </Link>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard to="/admin/users" label="Active users" value={users.active}>
            Users, mentors, recruiters, owners, admins
          </StatCard>
          <StatCard to="/admin/companies" label="Companies" value={companies.total}>
            {companies.suspended === 0 ? 'None suspended' : `${companies.suspended} suspended`}
          </StatCard>
          <StatCard to="/admin/verification" label="Pending verification" value={verification.pending}>
            Requests awaiting a decision
          </StatCard>
          <StatCard to="/admin/users?status=Deactivated" label="Deactivated accounts" value={users.deactivated}>
            {users.deactivatedLast7Days} in the last 7 days
          </StatCard>
        </div>

        <section className="flex flex-col gap-3 rounded-[14px] border border-[#e2e8e4] bg-white p-5.5 xl:max-w-[62%]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold">Needs your attention</h2>
            {waiting > verification.oldestPending.length && (
              <Link to="/admin/verification" className="text-xs font-bold text-[#1b4332] hover:underline">
                All {waiting} requests →
              </Link>
            )}
          </div>

          {verification.oldestPending.length === 0 ? (
            <p className="rounded-[10px] bg-[#f8f9fa] px-4 py-6 text-center text-[13px] text-[#718078]">
              Nothing needs a decision right now.
            </p>
          ) : (
            verification.oldestPending.map((item) => (
              <Link
                key={item.id}
                to={`/admin/verification/${item.id}`}
                className="flex flex-col gap-1 rounded-[10px] bg-[#f8f9fa] px-3 py-3 hover:bg-[#eef1ef]"
              >
                <p className="text-[9px] font-bold tracking-wide text-[#1b4332] uppercase">
                  Company verification <span className="mx-1">•</span> {waitingLabel(item.submittedAt)}
                </p>
                <p className="text-[13px] font-semibold">{item.legalName} · verification request</p>
                <p className="text-[11px] text-[#718078]">
                  Requested by {item.requesterName} · submitted {formatLongDate(item.submittedAt)} · Open request →
                </p>
              </Link>
            ))
          )}

          <p className="text-[11px] text-[#718078]">Every item links straight to the screen where it can be resolved.</p>
        </section>
      </div>
    </>
  )
}

type StatCardProps = {
  to: string
  label: string
  value: number
  children: ReactNode
}

function StatCard({ to, label, value, children }: StatCardProps) {
  return (
    <Link
      to={to}
      className="flex flex-col gap-1 rounded-[14px] border border-[#e2e8e4] bg-white p-5 transition-colors hover:border-[#b5ccbe]"
    >
      <p className="text-xs text-[#718078]">{label}</p>
      <p className="text-[26px] font-bold">{value}</p>
      <p className="text-[10px] text-[#718078]">{children}</p>
    </Link>
  )
}
