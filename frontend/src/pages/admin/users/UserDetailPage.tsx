import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminHeader from '../../../components/admin/AdminHeader'
import StatusBadge from '../../../components/admin/StatusBadge'
import { ApiError } from '../../../api/http'
import { changePlatformRole, deactivateUser, fetchUserDetail, reactivateUser } from '../../../api/adminUsers'
import type { PlatformRole, UserDetail } from '../../../types/adminUsers'
import { companyRoleLabels, directoryRoleLabels, formatLastActive, formatLongDate } from '../format'
import { ChangeRoleDialog, DeactivateAccountDialog, ReactivateAccountDialog } from './AccountDialogs'

type OpenDialog = 'deactivate' | 'reactivate' | 'role' | null

type Response =
  | { id: string; user: UserDetail }
  | { id: string; error: 'not-found' | 'failed' }

export default function UserDetailPage() {
  const { userId = '' } = useParams()
  const [response, setResponse] = useState<Response | null>(null)
  const [dialog, setDialog] = useState<OpenDialog>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchUserDetail(userId, controller.signal)
      .then((user) => setResponse({ id: userId, user }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }
        const notFound = error instanceof ApiError && (error.status === 404 || error.status === 400)
        setResponse({ id: userId, error: notFound ? 'not-found' : 'failed' })
      })
    return () => controller.abort()
  }, [userId])

  const reload = useCallback(async () => {
    const user = await fetchUserDetail(userId)
    setResponse({ id: userId, user })
  }, [userId])

  const closeDialog = useCallback(() => setDialog(null), [])

  const crumbs = [
    { label: 'Admin' },
    { label: 'User directory', to: '/admin/users' },
    { label: 'User detail' },
  ]

  if (response?.id !== userId) {
    return (
      <>
        <AdminHeader crumbs={crumbs} />
        <PageMessage>Loading user…</PageMessage>
      </>
    )
  }

  if ('error' in response) {
    return (
      <>
        <AdminHeader crumbs={crumbs} />
        <PageMessage>
          {response.error === 'not-found'
            ? 'This user does not exist or was removed.'
            : "Couldn't load this user. Check that the API is running and try again."}
          <Link to="/admin/users" className="mt-3 block font-bold text-[#1b4332] hover:underline">
            ← Back to the directory
          </Link>
        </PageMessage>
      </>
    )
  }

  const { user } = response
  const lastActive = formatLastActive(user.lastActiveAt)
  const platformRole: PlatformRole = user.role === 'Admin' ? 'Admin' : 'User'

  // Each action: call the API, close the dialog, show fresh data. Errors surface inside the dialog.
  async function runAction(action: () => Promise<void>) {
    await action()
    setDialog(null)
    await reload()
  }

  return (
    <>
      <AdminHeader crumbs={crumbs} />

      <div className="flex flex-col gap-5 p-8">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <h1 className="text-[29px] leading-10.75 font-bold">{user.fullName} · User account</h1>
            <p className="text-xs text-[#718078]">
              {user.email} · {user.status} · Last active {lastActive === 'Never' ? 'never' : lastActive.toLowerCase()}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDialog('role')}
              className="h-10.5 w-36 rounded-[9px] border border-[#e2e8e4] bg-white text-[13px] font-bold text-[#1b4332]"
            >
              Edit role
            </button>
            <button
              type="button"
              onClick={() => setDialog(user.status === 'Active' ? 'deactivate' : 'reactivate')}
              className="h-10.5 w-47.5 rounded-[9px] bg-[#ff7a00] text-[13px] font-bold text-[#172c23]"
            >
              {user.status === 'Active' ? 'Deactivate account' : 'Reactivate account'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex flex-col gap-5">
            <Panel title="Profile & identity" description="Account and programme identity used across the internship platform.">
              <Field label="Full name" value={user.fullName} />
              <Field label="Email" value={user.email} />
              <Field label="Role" value={directoryRoleLabels[user.role]} />
              <Field label="University" value={user.university} />
              <Field label="Programme" value={user.programme} />
              <Field label="Academic group" value={user.academicGroup} />
            </Panel>

            <Panel title="Company placement" description="The company this person belongs to and their role inside it.">
              {user.company ? (
                <>
                  <Field label="Company" value={user.company.legalName} />
                  <Field label="Company role" value={companyRoleLabels[user.company.role]} />
                  <div className="mt-1">
                    <Link
                      to={`/admin/companies/${user.company.id}`}
                      className="text-xs font-bold text-[#1b4332] hover:underline"
                    >
                      Open company →
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-xs text-[#718078]">Not a member of any company.</p>
              )}
            </Panel>
          </div>

          <section className="flex flex-col gap-3 rounded-[14px] border border-[#e2e8e4] bg-white p-5.5">
            <h2 className="text-[17px] font-bold">Account &amp; access</h2>
            <StatusBadge status={user.status} size="lg" />
            <p className="text-xs font-medium">
              {user.emailVerified ? 'Email verified' : 'Email not verified'}
            </p>
            <p className="text-[11px] text-[#718078]">Last sign-in · {lastActive}</p>
            <p className="text-[11px] text-[#718078]">Created {formatLongDate(user.createdAt)}</p>
            {user.deactivatedAt && (
              <p className="text-[11px] text-[#a54a00]">Deactivated {formatLongDate(user.deactivatedAt)}</p>
            )}
          </section>
        </div>
      </div>

      {dialog === 'deactivate' && (
        <DeactivateAccountDialog
          userName={user.fullName}
          onCancel={closeDialog}
          onConfirm={(reason) => runAction(() => deactivateUser(user.id, reason))}
        />
      )}
      {dialog === 'reactivate' && (
        <ReactivateAccountDialog
          userName={user.fullName}
          deactivatedAt={user.deactivatedAt}
          onCancel={closeDialog}
          onConfirm={(reason) => runAction(() => reactivateUser(user.id, reason))}
        />
      )}
      {dialog === 'role' && (
        <ChangeRoleDialog
          userName={user.fullName}
          currentRole={platformRole}
          onCancel={closeDialog}
          onConfirm={(role, reason) => runAction(() => changePlatformRole(user.id, role, reason))}
        />
      )}
    </>
  )
}

type PanelProps = {
  title: string
  description: string
  children: ReactNode
}

function Panel({ title, description, children }: PanelProps) {
  return (
    <section className="flex flex-col gap-2 rounded-[14px] border border-[#e2e8e4] bg-white p-5.5">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mb-2 text-xs text-[#718078]">{description}</p>
      <dl className="flex flex-col">{children}</dl>
    </section>
  )
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex min-h-8 gap-4">
      <dt className="w-45 shrink-0 text-[10px] font-bold tracking-wide text-[#718078] uppercase">{label}</dt>
      <dd className="min-w-0 text-xs font-medium break-words">{value ?? '—'}</dd>
    </div>
  )
}

function PageMessage({ children }: { children: ReactNode }) {
  return (
    <div className="m-8 rounded-xl border border-[#e2e8e4] bg-white p-10 text-center text-[13px] text-[#718078]">
      {children}
    </div>
  )
}
