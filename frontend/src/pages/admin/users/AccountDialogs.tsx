import { useState } from 'react'
import ReasonDialog from '../../../components/admin/ReasonDialog'
import type { PlatformRole } from '../../../types/adminUsers'
import { platformRoleLabels } from '../format'
import { formatLongDate } from '../format'

type BaseProps = {
  userName: string
  onCancel: () => void
}

export function DeactivateAccountDialog({
  userName,
  onCancel,
  onConfirm,
}: BaseProps & { onConfirm: (reason: string) => Promise<void> }) {
  return (
    <ReasonDialog
      title={`Deactivate ${userName}?`}
      description={
        <>
          <p>They cannot sign in again until an admin reactivates the account.</p>
          <p className="mt-2">Nothing is deleted — reports, tasks and evaluations are kept.</p>
        </>
      }
      info={{
        tone: 'warning',
        heading: 'What happens immediately',
        items: ['The account is marked as deactivated', 'They stop appearing in the user directory as active'],
        footnote: 'The user is told their access was suspended, without your reason.',
      }}
      reasonLabel="Reason for deactivation"
      reasonPlaceholder="Left the programme early — confirmed by the faculty office."
      note={{
        tone: 'success',
        heading: 'Required · kept in the server log',
        text: 'Deactivation is reversible. Reactivating restores access.',
      }}
      confirmLabel="Deactivate account"
      busyLabel="Deactivating…"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}

export function ReactivateAccountDialog({
  userName,
  deactivatedAt,
  onCancel,
  onConfirm,
}: BaseProps & { deactivatedAt: string | null; onConfirm: (reason: string) => Promise<void> }) {
  return (
    <ReasonDialog
      title={`Reactivate ${userName}?`}
      description={<p>They can sign in again straight away with their existing password.</p>}
      info={{
        tone: 'success',
        heading: 'What happens',
        items: ['Access is restored immediately', 'They appear in the user directory as active again'],
        footnote: deactivatedAt ? `Deactivated ${formatLongDate(deactivatedAt)}.` : undefined,
      }}
      reasonLabel="Reason for reactivation"
      reasonPlaceholder="Returned to the programme — confirmed by the faculty office."
      note={{
        tone: 'warning',
        heading: 'Required · kept in the server log',
        text: 'Old sessions stay ended. The user signs in fresh.',
      }}
      confirmLabel="Reactivate account"
      busyLabel="Reactivating…"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}

const roleCopy: Record<PlatformRole, { heading: string; items: string[]; confirm: string }> = {
  Admin: {
    heading: 'What they gain',
    items: [
      'Full access to the admin panel and every record in it',
      'Ability to verify companies, deactivate accounts and change roles',
    ],
    confirm: 'Make admin',
  },
  Student: {
    heading: 'What this means',
    items: [
      'A regular account: their own progress, tasks and contributions',
      'No access to the admin panel',
    ],
    confirm: 'Make student',
  },
  Mentor: {
    heading: 'What they gain',
    items: [
      'Reviews the contributions of the students assigned to them',
      'No access to the admin panel',
    ],
    confirm: 'Make mentor',
  },
  Company: {
    heading: 'What they gain',
    items: [
      'Represents their company: opportunities and applications',
      'No access to the admin panel',
    ],
    confirm: 'Make company representative',
  },
}

const assignableRoles: PlatformRole[] = ['Student', 'Mentor', 'Company', 'Admin']

export function ChangeRoleDialog({
  userName,
  currentRole,
  onCancel,
  onConfirm,
}: BaseProps & { currentRole: PlatformRole; onConfirm: (role: PlatformRole, reason: string) => Promise<void> }) {
  const [newRole, setNewRole] = useState<PlatformRole>(
    currentRole === 'Admin' ? 'Student' : 'Admin',
  )
  const copy = roleCopy[newRole]

  return (
    <ReasonDialog
      title={`Change the role of ${userName}?`}
      description={<p>Admins can see every user, company and verification request on the platform.</p>}
      info={{
        tone: 'warning',
        heading: copy.heading,
        items: copy.items,
        footnote: 'Only the platform role changes. Company roles are set by the company owner.',
      }}
      reasonLabel="Reason for role change"
      note={{
        tone: 'success',
        heading: 'Required · kept in the server log',
        text: 'The change signs them out, so the new role applies the next time they sign in.',
      }}
      confirmLabel={copy.confirm}
      busyLabel="Saving…"
      confirmDisabled={newRole === currentRole}
      onCancel={onCancel}
      onConfirm={(reason) => onConfirm(newRole, reason)}
    >
      <div className="grid grid-cols-2 gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase">Current role</span>
          <input
            value={platformRoleLabels[currentRole]}
            readOnly
            className="h-10.5 rounded-lg border border-[#e2e8e4] bg-[#f8f9fa] px-3 text-[13px] text-[#718078]"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase">New role</span>
          <select
            value={newRole}
            onChange={(event) => setNewRole(event.target.value as PlatformRole)}
            className="h-10.5 rounded-lg border border-[#e2e8e4] bg-white px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#1b4332]/30"
          >
            {assignableRoles.map((role) => (
              <option key={role} value={role}>
                {platformRoleLabels[role]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </ReasonDialog>
  )
}
