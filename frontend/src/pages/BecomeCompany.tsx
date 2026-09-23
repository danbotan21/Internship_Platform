import { useCallback, useEffect, useState } from 'react'
import { Building2 } from 'lucide-react'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import PageHeading from '../components/ui/PageHeading'
import { card, inputBase, mutedText } from '../components/ui/styles'
import { ApiError } from '../api/http'
import { fetchMyVerification, submitVerification } from '../api/companyVerification'
import type {
  MyVerificationRequest,
  MyVerificationState,
  SubmitVerificationRequest,
} from '../types/companyVerification'

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']

const EMPTY_FORM: SubmitVerificationRequest = {
  legalName: '',
  registrationNumber: '',
  website: '',
  headquarters: '',
  industry: '',
  companySize: '11-50',
  position: '',
  phone: '',
}

// Moldovan IDNO: 13 digits, optionally written with an "IDNO" prefix.
function idnoLooksValid(value: string): boolean {
  const digits = value.trim().replace(/^IDNO/i, '').trim()
  return /^\d{13}$/.test(digits)
}

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso))
}

export default function BecomeCompany() {
  const [state, setState] = useState<MyVerificationState | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [form, setForm] = useState<SubmitVerificationRequest>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof SubmitVerificationRequest, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const result = await fetchMyVerification(signal)
      setState(result)
      setLoadFailed(false)
      // After a rejection the person fixes details rather than retyping everything.
      if (result.request && result.request.status === 'Rejected') {
        setForm(requestToForm(result.request))
      }
    } catch {
      if (!signal?.aborted) {
        setLoadFailed(true)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  function set<K extends keyof SubmitVerificationRequest>(key: K, value: string) {
    setForm((previous) => ({ ...previous, [key]: value }))
    setErrors((previous) => ({ ...previous, [key]: undefined }))
  }

  function validate(): boolean {
    const next: Partial<Record<keyof SubmitVerificationRequest, string>> = {}

    if (form.legalName.trim().length < 2) next.legalName = 'Enter the registered company name.'
    if (!idnoLooksValid(form.registrationNumber)) {
      next.registrationNumber = 'The IDNO is 13 digits.'
    }
    if (form.website.trim().length < 4) next.website = 'Enter the company website.'
    if (form.headquarters.trim().length < 2) next.headquarters = 'Enter the city and country.'
    if (form.industry.trim().length < 2) next.industry = 'Enter the industry.'
    if (form.position.trim().length < 2) next.position = 'Enter your role in the company.'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitError(null)

    if (!validate()) return

    setSaving(true)
    try {
      await submitVerification({
        ...form,
        phone: form.phone?.trim() ? form.phone.trim() : undefined,
      })
      await load()
    } catch (error) {
      setSubmitError(
        error instanceof ApiError ? error.message : 'Could not send the request. Try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loadFailed) {
    return (
      <>
        <PageHeading title='Represent a company' />
        <Alert tone='danger' title="Couldn't load your request">
          Check that the API is running and reload the page.
        </Alert>
      </>
    )
  }

  if (!state) {
    return (
      <>
        <PageHeading title='Represent a company' />
        <p className={mutedText}>Loading…</p>
      </>
    )
  }

  const { request } = state

  return (
    <>
      <PageHeading
        eyebrow='Company onboarding'
        title='Represent a company'
        description='Offer internships on internflow. An admin checks the company before it appears on the platform — once approved, you become its owner.'
      />

      <div className='flex flex-col gap-5'>
        {state.alreadyInCompany && (
          <Alert tone='success' title='You already represent a company'>
            Your account is linked to a company, so there is nothing to request here.
          </Alert>
        )}

        {request && <RequestStatus request={request} />}

        {state.canSubmit && (
          <form onSubmit={handleSubmit} className={`${card} flex flex-col gap-5 p-5 md:p-6`}>
            <div className='flex items-center gap-2.5'>
              <Building2 className='size-4 text-[#2b6a50]' aria-hidden='true' />
              <h2 className='text-[15px] font-semibold'>Company details</h2>
            </div>

            <div className='grid gap-5 md:grid-cols-2'>
              <Field label='Registered name' htmlFor='legalName' required error={errors.legalName}>
                <input
                  id='legalName'
                  value={form.legalName}
                  onChange={(event) => set('legalName', event.target.value)}
                  placeholder='TechNova SRL'
                  className={inputBase}
                />
              </Field>

              <Field
                label='Registration number (IDNO)'
                htmlFor='registrationNumber'
                required
                error={errors.registrationNumber}
                hint='13 digits, as it appears in the state register.'
              >
                <input
                  id='registrationNumber'
                  value={form.registrationNumber}
                  onChange={(event) => set('registrationNumber', event.target.value)}
                  placeholder='1003600012345'
                  inputMode='numeric'
                  className={inputBase}
                />
              </Field>

              <Field
                label='Website'
                htmlFor='website'
                required
                error={errors.website}
                hint='An email address on the same domain speeds up the review.'
              >
                <input
                  id='website'
                  value={form.website}
                  onChange={(event) => set('website', event.target.value)}
                  placeholder='https://technova.md'
                  className={inputBase}
                />
              </Field>

              <Field label='Headquarters' htmlFor='headquarters' required error={errors.headquarters}>
                <input
                  id='headquarters'
                  value={form.headquarters}
                  onChange={(event) => set('headquarters', event.target.value)}
                  placeholder='Chisinau, Moldova'
                  className={inputBase}
                />
              </Field>

              <Field label='Industry' htmlFor='industry' required error={errors.industry}>
                <input
                  id='industry'
                  value={form.industry}
                  onChange={(event) => set('industry', event.target.value)}
                  placeholder='Software'
                  className={inputBase}
                />
              </Field>

              <Field label='Company size' htmlFor='companySize' required>
                <select
                  id='companySize'
                  value={form.companySize}
                  onChange={(event) => set('companySize', event.target.value)}
                  className={inputBase}
                >
                  {COMPANY_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size} people
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label='Your role in the company'
                htmlFor='position'
                required
                error={errors.position}
              >
                <input
                  id='position'
                  value={form.position}
                  onChange={(event) => set('position', event.target.value)}
                  placeholder='HR Manager'
                  className={inputBase}
                />
              </Field>

              <Field label='Phone' htmlFor='phone' hint='Optional, in case the admin needs to reach you.'>
                <input
                  id='phone'
                  value={form.phone ?? ''}
                  onChange={(event) => set('phone', event.target.value)}
                  placeholder='+373 60 000 000'
                  className={inputBase}
                />
              </Field>
            </div>

            {submitError && <Alert tone='danger'>{submitError}</Alert>}

            <div className='flex flex-wrap items-center gap-3'>
              <Button type='submit' loading={saving}>
                {saving ? 'Sending…' : 'Send for review'}
              </Button>
              <p className={mutedText}>
                Your name and email are taken from your account and shown to the admin.
              </p>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

function RequestStatus({ request }: { request: MyVerificationRequest }) {
  if (request.status === 'Pending') {
    return (
      <Alert tone='info' title='Waiting for review'>
        You asked to represent <strong>{request.legalName}</strong> on {formatDate(request.createdAt)}.
        An admin will look at it — you can't send another request until this one is decided.
      </Alert>
    )
  }

  if (request.status === 'Approved') {
    return (
      <Alert tone='success' title='Approved'>
        <strong>{request.legalName}</strong> is on the platform
        {request.decidedAt ? ` since ${formatDate(request.decidedAt)}` : ''} and you are its owner.
      </Alert>
    )
  }

  return (
    <Alert tone='danger' title='Request declined'>
      {request.rejectionReason ? (
        <p>{request.rejectionReason}</p>
      ) : (
        <p>The admin declined the request without a reason.</p>
      )}
      <p className='mt-1'>Correct the details below and send it again.</p>
    </Alert>
  )
}

function requestToForm(request: MyVerificationRequest): SubmitVerificationRequest {
  return {
    legalName: request.legalName,
    registrationNumber: request.registrationNumber,
    website: request.website,
    headquarters: request.headquarters,
    industry: request.industry,
    companySize: request.companySize,
    position: request.position,
    phone: request.phone ?? '',
  }
}
