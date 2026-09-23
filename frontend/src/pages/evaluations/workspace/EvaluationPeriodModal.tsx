import { CalendarRange } from 'lucide-react'
import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Field from '../../../components/ui/Field'
import Modal from '../../../components/ui/Modal'
import { inputBase } from '../../../components/ui/styles'

const maximumDays = 180

type EvaluationPeriodModalProps = {
  start: string
  end: string
  saving: boolean
  onClose: () => void
  onSave: (start: string, end: string) => void
}

function daysBetween(start: string, end: string) {
  return (Date.parse(end) - Date.parse(start)) / 86_400_000
}

// Corrects the period a draft evaluation covers; the context tab follows it.
export default function EvaluationPeriodModal({ start, end, saving, onClose, onSave }: EvaluationPeriodModalProps) {
  const [from, setFrom] = useState(start)
  const [to, setTo] = useState(end)
  const error = !from || !to
    ? 'Choose both dates.'
    : to < from
      ? 'The period cannot end before it starts.'
      : daysBetween(from, to) > maximumDays
        ? `An evaluation period can cover at most ${maximumDays} days.`
        : null

  return (
    <Modal
      title='Change the evaluation period'
      description='Only while the evaluation is a draft. Contributions shown as context follow the new period.'
      onClose={onClose}
      footer={
        <>
          <Button variant='secondary' onClick={onClose}>
            Cancel
          </Button>
          <Button
            icon={CalendarRange}
            loading={saving}
            disabled={error !== null || (from === start && to === end)}
            onClick={() => onSave(from, to)}
          >
            Save period
          </Button>
        </>
      }
    >
      <div className='grid gap-4 sm:grid-cols-2'>
        <Field label='From' htmlFor='period-start' required>
          <input id='period-start' type='date' className={inputBase} value={from} onChange={(event) => setFrom(event.target.value)} />
        </Field>
        <Field label='To' htmlFor='period-end' required error={from && to ? error : null}>
          <input
            id='period-end'
            type='date'
            className={inputBase}
            min={from || undefined}
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </Field>
      </div>
    </Modal>
  )
}
