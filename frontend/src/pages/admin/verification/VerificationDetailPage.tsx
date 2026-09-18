import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import AdminHeader from '../../../components/admin/AdminHeader'
import { ApiError } from '../../../api/http'
import {
  approveVerification,
  fetchVerificationDetail,
  rejectVerification,
} from '../../../api/adminVerification'
import type { VerificationDetail } from '../../../types/adminVerification'
import { formatLongDate, formatTimestamp } from '../format'
import RejectRequestDialog from './RejectRequestDialog'

type Response =
  | { id: string; request: VerificationDetail }
  | { id: string; error: 'not-found' | 'failed' }

function websiteHref(website: string): string {
  return website.includes('://') ? website : `https://${website}`
}

function websiteHost(website: string): string {
  try {
    return new URL(websiteHref(website)).host.replace(/^www\./, '')
  } catch {
    return website
  }
}

export default function VerificationDetailPage() {
  const { requestId = '' } = useParams()
  const [response, setResponse] = useState<Response | null>(null)
  const [rejecting, setRejecting] = useState(false)
  const [approving, setApproving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchVerificationDetail(requestId, controller.signal)
      .then((request) => setResponse({ id: requestId, request }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }
        const notFound = error instanceof ApiError && (error.status === 404 || error.status === 400)
        setResponse({ id: requestId, error: notFound ? 'not-found' : 'failed' })
      })
    return () => controller.abort()
  }, [requestId])

  const reload = useCallback(async () => {
    const request = await fetchVerificationDetail(requestId)
    setResponse({ id: requestId, request })
  }, [requestId])

  const closeRejectDialog = useCallback(() => setRejecting(false), [])

  const crumbs = [
    { label: 'Admin' },
    { label: 'Company verification', to: '/admin/verification' },
    { label: 'Verification detail' },
  ]

  if (response?.id !== requestId) {
    return (
      <>
        <AdminHeader crumbs={crumbs} />
        <PageMessage>Loading request…</PageMessage>
      </>
    )
  }

  if ('error' in response) {
    return (
      <>
        <AdminHeader crumbs={crumbs} />
        <PageMessage>
          {response.error === 'not-found'
            ? 'This verification request does not exist.'
            : "Couldn't load this request. Check that the API is running and try again."}
          <Link to="/admin/verification" className="mt-3 block font-bold text-[#1b4332] hover:underline">
            ← Back to the queue
          </Link>
        </PageMessage>
      </>
    )
  }

  const { request } = response
  const isPending = request.status === 'Pending'

  async function handleApprove() {
    setApproving(true)
    setActionError(null)
    try {
      await approveVerification(request.id)
      await reload()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Approval failed. Try again.')
    } finally {
      setApproving(false)
    }
  }

  async function handleReject(reason: string) {
    await rejectVerification(request.id, reason)
    setRejecting(false)
    await reload()
  }

  return (
    <>
      <AdminHeader crumbs={crumbs} />

      <div className="flex flex-col gap-5 p-8">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <h1 className="text-[29px] leading-10.75 font-bold">{request.legalName} · Verification request</h1>
            <p className="text-xs text-[#718078]">
              Requested by {request.requester.name} · {request.status} · Submitted{' '}
              {formatTimestamp(request.submittedAt)}
            </p>
          </div>

          {isPending && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleApprove}
                disabled={approving}
                className="h-10.5 w-45 rounded-[9px] bg-[#ff7a00] text-[13px] font-bold text-[#172c23] disabled:opacity-50"
              >
                {approving ? 'Approving…' : 'Approve company'}
              </button>
              <button
                type="button"
                onClick={() => setRejecting(true)}
                disabled={approving}
                className="h-10.5 w-45 rounded-[9px] border border-[#e2e8e4] bg-white text-[13px] font-bold disabled:opacity-50"
              >
                Reject request
              </button>
            </div>
          )}
        </div>

        {actionError && (
          <p role="alert" className="rounded-lg bg-[#fde8e6] px-4 py-3 text-[13px] font-medium text-[#b42318]">
            {actionError}
          </p>
        )}

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex flex-col gap-5">
            <Panel title="Company details" description="Submitted by the person requesting access on behalf of this company.">
              <Field label="Legal name" value={request.legalName} />
              <Field label="Registration" value={`IDNO ${request.registrationNumber}`} />
              <Field label="Website" value={request.website} />
              <Field label="Headquarters" value={request.headquarters} />
              <Field label="Industry" value={request.industry} />
              <Field label="Company size" value={request.companySize} />
            </Panel>

            <Panel title="Requester" description="This person becomes the company owner if the request is approved.">
              <Field label="Name" value={request.requester.name} />
              <Field label="Work email" value={request.requester.email} />
              <Field label="Position" value={request.requester.position} />
              <Field label="Account" value={`Registered ${formatLongDate(request.requester.accountCreatedAt)}`} />
              <Field label="Phone" value={request.requester.phone} />

              <div className="mt-3 grid grid-cols-1 gap-4 rounded-[10px] bg-[#eaf3ed] p-4 text-[#1b4332] sm:grid-cols-2">
                <div>
                  <p className="text-lg font-bold">
                    {request.checks.emailDomainMatchesWebsite ? 'Domain matches website' : 'Domain does not match'}
                  </p>
                  <p className="text-[11px] break-all">
                    {request.requester.email} → {websiteHost(request.website)}
                  </p>
                </div>
                <div>
                  <p className="text-base font-bold">
                    {request.earlierRequestsForRegistration === 0
                      ? 'First request from this company'
                      : `${request.earlierRequestsForRegistration} earlier request(s)`}
                  </p>
                  <p className="text-[11px]">
                    {request.earlierRequestsForRegistration === 0
                      ? 'No earlier approvals or rejections'
                      : 'Same registration number was submitted before'}
                  </p>
                </div>
              </div>
            </Panel>
          </div>

          <div className="flex flex-col gap-5">
            <section className="flex flex-col gap-3 rounded-[14px] border border-[#e2e8e4] bg-white p-5.5">
              <h2 className="text-[17px] font-bold">Verification checks</h2>
              <DecisionBanner request={request} />
              <CheckRow ok={request.checks.emailDomainMatchesWebsite} label="Email domain matches website · automatic" />
              <CheckRow
                ok={request.checks.registrationNumberFormatValid}
                label="Registration number format valid · automatic"
              />
              <p className="text-[11px] text-[#718078]">Website content not checked · manual step</p>
              <a
                href={websiteHref(request.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10.5 items-center justify-center rounded-[9px] border border-[#e2e8e4] text-[13px] font-bold"
              >
                Open website
              </a>
              <a
                href={`mailto:${request.requester.email}`}
                className="flex h-10.5 items-center justify-center rounded-[9px] border border-[#e2e8e4] text-[13px] font-bold"
              >
                Contact requester
              </a>
            </section>

            {request.status === 'Rejected' && request.rejectionReason && (
              <section className="flex flex-col gap-2 rounded-[14px] bg-[#fde8e6] p-5.5 text-[#b42318]">
                <h2 className="text-[17px] font-bold">Rejection reason</h2>
                <p className="text-[13px] whitespace-pre-wrap">{request.rejectionReason}</p>
              </section>
            )}

            <section className="flex flex-col gap-3 rounded-[14px] bg-[#eaf3ed] p-5.5 text-[#1b4332]">
              <h2 className="text-[17px] font-bold">What approval grants</h2>
              <p className="text-[13px] font-bold">Company owner · {request.legalName}</p>
              <p className="text-[11px]">
                Can post opportunities, invite recruiters and mentors, and manage their own team.
              </p>
              <p className="text-[11px] font-semibold">Permission source: company owner role</p>
            </section>
          </div>
        </div>
      </div>

      {rejecting && (
        <RejectRequestDialog
          companyName={request.legalName}
          requesterName={request.requester.name}
          onCancel={closeRejectDialog}
          onConfirm={handleReject}
        />
      )}
    </>
  )
}

function DecisionBanner({ request }: { request: VerificationDetail }) {
  if (request.status === 'Pending') {
    return <Banner className="bg-[#edf0fc] text-[#485995]">● Awaiting decision</Banner>
  }

  const when = request.decidedAt ? ` · ${formatTimestamp(request.decidedAt)}` : ''
  const who = request.decidedByName ? ` by ${request.decidedByName}` : ''

  return request.status === 'Approved' ? (
    <Banner className="bg-[#eaf3ed] text-[#1b4332]">● Approved{who}{when}</Banner>
  ) : (
    <Banner className="bg-[#fde8e6] text-[#b42318]">● Rejected{who}{when}</Banner>
  )
}

function Banner({ className, children }: { className: string; children: ReactNode }) {
  return (
    <p className={`flex min-h-9 items-center justify-center rounded-lg px-3 text-center text-xs font-semibold ${className}`}>
      {children}
    </p>
  )
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  const Icon = ok ? Check : X
  return (
    <p className={`flex items-center gap-2 text-xs font-medium ${ok ? 'text-[#172c23]' : 'text-[#a54a00]'}`}>
      <Icon className="h-4 w-4 shrink-0" aria-label={ok ? 'Passed' : 'Failed'} />
      {label}
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
