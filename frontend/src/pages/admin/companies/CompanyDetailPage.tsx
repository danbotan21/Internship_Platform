import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminHeader from '../../../components/admin/AdminHeader'
import { ApiError } from '../../../api/http'
import { fetchCompanyDetail, restoreCompany, suspendCompany } from '../../../api/adminCompanies'
import type { CompanyDetail, CompanyMember } from '../../../types/adminCompanies'
import type { CompanyRole } from '../../../types/adminUsers'
import { formatLongDate } from '../format'
import { RestoreAccessDialog, RevokeAccessDialog } from './CompanyDialogs'

type Response =
  | { id: string; company: CompanyDetail }
  | { id: string; error: 'not-found' | 'failed' }

const teamRows: { role: CompanyRole; label: string }[] = [
  { role: 'Owner', label: 'Owner' },
  { role: 'Recruiter', label: 'Recruiters' },
  { role: 'Mentor', label: 'Mentors' },
]

function websiteHref(website: string): string {
  return website.includes('://') ? website : `https://${website}`
}

export default function CompanyDetailPage() {
  const { companyId = '' } = useParams()
  const [response, setResponse] = useState<Response | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetchCompanyDetail(companyId, controller.signal)
      .then((company) => setResponse({ id: companyId, company }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }
        const notFound = error instanceof ApiError && (error.status === 404 || error.status === 400)
        setResponse({ id: companyId, error: notFound ? 'not-found' : 'failed' })
      })
    return () => controller.abort()
  }, [companyId])

  const reload = useCallback(async () => {
    const company = await fetchCompanyDetail(companyId)
    setResponse({ id: companyId, company })
  }, [companyId])

  const closeDialog = useCallback(() => setDialogOpen(false), [])

  const crumbs = [{ label: 'Admin' }, { label: 'Companies', to: '/admin/companies' }, { label: 'Company detail' }]

  if (response?.id !== companyId) {
    return (
      <>
        <AdminHeader crumbs={crumbs} />
        <PageMessage>Loading company…</PageMessage>
      </>
    )
  }

  if ('error' in response) {
    return (
      <>
        <AdminHeader crumbs={crumbs} />
        <PageMessage>
          {response.error === 'not-found'
            ? 'This company does not exist.'
            : "Couldn't load this company. Check that the API is running and try again."}
          <Link to="/admin/companies" className="mt-3 block font-bold text-[#1b4332] hover:underline">
            ← Back to companies
          </Link>
        </PageMessage>
      </>
    )
  }

  const { company } = response
  const isActive = company.status === 'Active'
  const owner = company.members.find((m) => m.role === 'Owner')
  const memberCount = company.members.length

  async function runAction(action: () => Promise<void>) {
    await action()
    setDialogOpen(false)
    await reload()
  }

  return (
    <>
      <AdminHeader crumbs={crumbs} />

      <div className="flex flex-col gap-5 p-8">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <h1 className="text-[29px] leading-10.75 font-bold">{company.legalName}</h1>
            <p className="text-xs text-[#718078]">
              Verified {formatLongDate(company.verifiedAt)} · {memberCount === 1 ? '1 member' : `${memberCount} members`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className={`h-10.5 w-40 rounded-[9px] text-[13px] font-bold ${
              isActive ? 'border border-[#e2e8e4] bg-white' : 'bg-[#ff7a00] text-[#172c23]'
            }`}
          >
            {isActive ? 'Revoke access' : 'Restore access'}
          </button>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex flex-col gap-5">
            <Panel title="Company details" description="Confirmed during verification. These cannot be changed from the admin panel.">
              <Field label="Legal name">{company.legalName}</Field>
              <Field label="Registration">IDNO {company.registrationNumber}</Field>
              <Field label="Website">{company.website}</Field>
              <Field label="Headquarters">{company.headquarters}</Field>
              <Field label="Industry">{company.industry}</Field>
              <Field label="Company size">{company.companySize}</Field>
              <Field label="Verified">
                {formatLongDate(company.verifiedAt)}
                {company.verifiedByName && ` by ${company.verifiedByName}`}
                {company.verificationRequestId && (
                  <>
                    {' · '}
                    <Link
                      to={`/admin/verification/${company.verificationRequestId}`}
                      className="font-bold text-[#1b4332] hover:underline"
                    >
                      View request
                    </Link>
                  </>
                )}
              </Field>
            </Panel>

            <Panel title="Team" description="The owner manages this list. The admin only steps in when they cannot.">
              {teamRows.map((row) => (
                <Field key={row.role} label={row.label}>
                  <MemberLinks members={company.members.filter((m) => m.role === row.role)} />
                </Field>
              ))}
            </Panel>
          </div>

          <div className="flex flex-col gap-5">
            <section className="flex flex-col gap-3 rounded-[14px] border border-[#e2e8e4] bg-white p-5.5">
              <h2 className="text-[17px] font-bold">Company status</h2>
              {isActive ? (
                <Banner className="bg-[#edf0fc] text-[#485995]">● Verified and active</Banner>
              ) : (
                <Banner className="bg-[#fde8e6] text-[#b42318]">
                  ● Suspended{company.suspendedAt && ` since ${formatLongDate(company.suspendedAt)}`}
                </Banner>
              )}
              <p className="text-xs font-medium">
                {isActive ? 'Can publish opportunities and invite team members' : 'Cannot publish or invite anyone'}
              </p>
              <p className="text-[11px] text-[#718078]">
                Approved {formatLongDate(company.verifiedAt)}
                {company.verifiedByName && ` · by ${company.verifiedByName}`}
              </p>
              <a
                href={websiteHref(company.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10.5 items-center justify-center rounded-[9px] border border-[#e2e8e4] text-[13px] font-bold"
              >
                Open website
              </a>
              {owner && (
                <a
                  href={`mailto:${owner.email}`}
                  className="flex h-10.5 items-center justify-center rounded-[9px] border border-[#e2e8e4] text-[13px] font-bold"
                >
                  Contact owner
                </a>
              )}
            </section>

            {isActive && (
              <section className="flex flex-col gap-3 rounded-[14px] bg-[#eaf3ed] p-5.5 text-[#1b4332]">
                <h2 className="text-[17px] font-bold">What revoking does</h2>
                <p className="text-[13px] font-bold">Company suspended · {company.legalName}</p>
                <p className="text-[11px]">
                  The company can no longer publish or invite. Member accounts stay active as normal users.
                </p>
                <p className="text-[11px] font-semibold">Reversible: an admin can restore access later</p>
              </section>
            )}
          </div>
        </div>
      </div>

      {dialogOpen && isActive && (
        <RevokeAccessDialog
          companyName={company.legalName}
          memberCount={memberCount}
          onCancel={closeDialog}
          onConfirm={(reason) => runAction(() => suspendCompany(company.id, reason))}
        />
      )}
      {dialogOpen && !isActive && (
        <RestoreAccessDialog
          companyName={company.legalName}
          suspendedAt={company.suspendedAt}
          onCancel={closeDialog}
          onConfirm={(reason) => runAction(() => restoreCompany(company.id, reason))}
        />
      )}
    </>
  )
}

function MemberLinks({ members }: { members: CompanyMember[] }) {
  if (members.length === 0) {
    return <>—</>
  }

  return (
    <>
      {members.map((member, index) => (
        <span key={member.userId}>
          {index > 0 && ', '}
          <Link to={`/admin/users/${member.userId}`} className="hover:underline">
            {member.fullName}
          </Link>
        </span>
      ))}
    </>
  )
}

function Banner({ className, children }: { className: string; children: ReactNode }) {
  return (
    <p className={`flex min-h-9 items-center justify-center rounded-lg px-3 text-center text-xs font-semibold ${className}`}>
      {children}
    </p>
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-8 gap-4">
      <dt className="w-45 shrink-0 text-[10px] font-bold tracking-wide text-[#718078] uppercase">{label}</dt>
      <dd className="min-w-0 text-xs font-medium break-words">{children}</dd>
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
