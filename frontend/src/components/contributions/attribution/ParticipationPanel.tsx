import { CircleCheck, Flag } from 'lucide-react'
import { useState } from 'react'
import type { Collaborator, ContributionStatus } from '../../../types/contribution'
import Alert from '../../ui/Alert'
import Button from '../../ui/Button'
import Field from '../../ui/Field'
import Modal from '../../ui/Modal'
import { textareaBase } from '../../ui/styles'
import { categoryMeta } from '../contributionLabels'

type ParticipationPanelProps = {
  collaborator: Collaborator
  authorName: string
  status: ContributionStatus
  busy: boolean
  onConfirm: () => void
  onDispute: (reason: string) => Promise<boolean>
}

// The collaborator's own decision about how they are credited.
export default function ParticipationPanel({
  collaborator,
  authorName,
  status,
  busy,
  onConfirm,
  onDispute,
}: ParticipationPanelProps) {
  const [disputing, setDisputing] = useState(false)
  const [reason, setReason] = useState('')
  const locked = status === 'validated' || status === 'rejected'
  const area = categoryMeta[collaborator.area].label

  return (
    <section className='rounded-xl border border-[#b9cfc3] bg-[#f4faf6] p-5'>
      <h2 className='text-[15px] font-semibold text-[#14211b]'>
        {authorName} credited you on this contribution
      </h2>
      <p className='mt-2 text-[14px] text-[#2b3833]'>
        <span className='font-semibold'>{area}:</span> {collaborator.roleDescription}
      </p>

      {collaborator.status === 'disputed' ? (
        <Alert tone='danger' className='mt-4' title='You disputed this attribution'>
          {collaborator.disputeReason} — waiting for {authorName} to answer.
        </Alert>
      ) : collaborator.status === 'confirmed' ? (
        <Alert tone='success' className='mt-4' title='You confirmed your participation'>
          You can still dispute it until the mentor's final decision.
        </Alert>
      ) : collaborator.resolutionNote ? (
        <Alert tone='info' className='mt-4' title={`${authorName} answered your dispute`}>
          {collaborator.resolutionNote}
        </Alert>
      ) : null}

      {locked ? (
        <p className='mt-4 text-[13px] text-[#5d6b64]'>The mentor's decision is final; attribution is read-only.</p>
      ) : (
        <div className='mt-4 flex flex-wrap gap-2'>
          {collaborator.status !== 'confirmed' ? (
            <Button icon={CircleCheck} loading={busy} onClick={onConfirm}>
              Confirm — this is accurate
            </Button>
          ) : null}
          {collaborator.status !== 'disputed' ? (
            <Button variant='danger' icon={Flag} disabled={busy} onClick={() => setDisputing(true)}>
              Dispute
            </Button>
          ) : null}
        </div>
      )}

      {disputing ? (
        <Modal
          title='Dispute this attribution'
          description={`${authorName} will be asked to correct it. The mentor cannot validate while it is disputed.`}
          onClose={() => setDisputing(false)}
          footer={
            <>
              <Button variant='secondary' onClick={() => setDisputing(false)}>
                Cancel
              </Button>
              <Button
                variant='danger'
                icon={Flag}
                loading={busy}
                disabled={reason.trim().length < 10}
                onClick={() =>
                  void onDispute(reason.trim()).then((sent) => {
                    if (sent) setDisputing(false)
                  })
                }
              >
                Send dispute
              </Button>
            </>
          }
        >
          <Field
            label='What is wrong?'
            htmlFor='dispute-reason'
            required
            counter={{ value: reason.trim().length, min: 10, max: 1000 }}
            hint='For example: "I only reviewed the code, I did not write the tests."'
          >
            <textarea
              id='dispute-reason'
              className={textareaBase}
              maxLength={1000}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </Field>
        </Modal>
      ) : null}
    </section>
  )
}
