import ReasonDialog from '../../../components/admin/ReasonDialog'

type RejectRequestDialogProps = {
  companyName: string
  requesterName: string
  onCancel: () => void
  onConfirm: (reason: string) => Promise<void>
}

export default function RejectRequestDialog({
  companyName,
  requesterName,
  onCancel,
  onConfirm,
}: RejectRequestDialogProps) {
  return (
    <ReasonDialog
      title={`Reject ${companyName}?`}
      description={
        <>
          <p>{requesterName} will be told the request was rejected and can submit a new one.</p>
          <p className="mt-2">The company cannot post opportunities until a request is approved.</p>
        </>
      }
      info={{
        tone: 'warning',
        heading: 'What the requester sees',
        items: ['Your reason, exactly as written below', 'A link to submit a corrected request'],
        footnote: 'Their account stays active as a normal user.',
      }}
      reasonLabel="Reason for rejection"
      reasonPlaceholder="Registration number does not match the company name in the state register."
      note={{
        tone: 'success',
        heading: 'Required · shown to the requester',
        text: 'Rejection is not permanent. A corrected request goes back into the pending queue.',
      }}
      confirmLabel="Reject request"
      busyLabel="Rejecting…"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
