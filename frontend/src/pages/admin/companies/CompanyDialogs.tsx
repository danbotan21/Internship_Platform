import ReasonDialog from '../../../components/admin/ReasonDialog'
import { formatLongDate } from '../format'

type DialogProps = {
  companyName: string
  onCancel: () => void
  onConfirm: (reason: string) => Promise<void>
}

export function RevokeAccessDialog({
  companyName,
  memberCount,
  onCancel,
  onConfirm,
}: DialogProps & { memberCount: number }) {
  return (
    <ReasonDialog
      title={`Revoke access for ${companyName}?`}
      description={
        <p>
          The company is suspended.{' '}
          {memberCount === 1 ? 'Its only member keeps' : `All ${memberCount} members keep`} their accounts as normal
          users.
        </p>
      }
      info={{
        tone: 'warning',
        heading: 'What happens',
        items: ['The company is marked as suspended', 'It moves to the Suspended tab of the companies list'],
        footnote: 'Member accounts and data are kept.',
      }}
      reasonLabel="Reason for revoking"
      reasonPlaceholder="Posted a paid course as an internship, twice after a warning."
      note={{
        tone: 'success',
        heading: 'Required · kept for the audit trail',
        text: 'Reversible. An admin can restore access from the company page.',
      }}
      confirmLabel="Revoke access"
      busyLabel="Revoking…"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}

export function RestoreAccessDialog({
  companyName,
  suspendedAt,
  onCancel,
  onConfirm,
}: DialogProps & { suspendedAt: string | null }) {
  return (
    <ReasonDialog
      title={`Restore access for ${companyName}?`}
      description={<p>The company becomes active again.</p>}
      info={{
        tone: 'success',
        heading: 'What happens',
        items: [
          'The company is marked as verified and active',
          'The owner and team members keep the roles they had before',
        ],
        footnote: suspendedAt ? `Suspended ${formatLongDate(suspendedAt)}.` : undefined,
      }}
      reasonLabel="Reason for restoring"
      reasonPlaceholder="Listing removed and the correction confirmed in writing by the owner."
      note={{
        tone: 'warning',
        heading: 'Required · kept for the audit trail',
        text: 'If the problem repeats, access can be revoked again.',
      }}
      confirmLabel="Restore access"
      busyLabel="Restoring…"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
