import { useState } from 'react'
import type { RubricCriterion, RubricCriterionInput } from '../../types/evaluation'
import Button from '../ui/Button'
import Field from '../ui/Field'
import Modal from '../ui/Modal'
import { inputBase, textareaBase } from '../ui/styles'

type CriterionEditorModalProps = {
  criterion?: RubricCriterion
  otherWeight: number
  saving: boolean
  onClose: () => void
  onSave: (input: RubricCriterionInput) => void
}

// Add or edit one criterion of the draft rubric, with live validation.
export default function CriterionEditorModal({ criterion, otherWeight, saving, onClose, onSave }: CriterionEditorModalProps) {
  const [name, setName] = useState(criterion?.name ?? '')
  const [description, setDescription] = useState(criterion?.description ?? '')
  const [guidance, setGuidance] = useState(criterion?.guidance ?? '')
  const [weight, setWeight] = useState(criterion?.weight ?? Math.max(0, 100 - otherWeight))
  const [scaleMax, setScaleMax] = useState(criterion?.scaleMax ?? 5)
  const [ratingStep, setRatingStep] = useState(criterion?.ratingStep ?? 0.5)
  const [visible, setVisible] = useState(criterion?.isVisibleToStudents ?? true)

  const checks = [
    { ok: name.trim().length >= 2, text: 'Name has at least 2 characters' },
    { ok: description.trim().length >= 5, text: 'Description explains what is measured' },
    { ok: guidance.trim().length >= 10, text: 'Student guidance describes low / good / excellent' },
    { ok: weight >= 1 && weight <= 100, text: 'Weight between 1% and 100%' },
  ]
  const valid = checks.every((check) => check.ok)
  const rubricTotal = otherWeight + (Number.isFinite(weight) ? weight : 0)
  const example = Math.round(((scaleMax * 0.8) / scaleMax) * weight * 10) / 10

  return (
    <Modal
      wide
      title={criterion ? `Edit criterion · ${criterion.name}` : 'Add criterion'}
      description='Changes are saved to the draft version only. Published versions never change.'
      onClose={onClose}
      footer={
        <>
          <Button variant='secondary' onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={saving}
            disabled={!valid}
            onClick={() =>
              onSave({
                name: name.trim(),
                description: description.trim(),
                guidance: guidance.trim(),
                weight,
                scaleMax,
                ratingStep,
                isVisibleToStudents: visible,
              })
            }
          >
            Save criterion
          </Button>
        </>
      }
    >
      <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]'>
        <div className='space-y-4'>
          <Field label='Criterion name' htmlFor='criterion-name' required counter={{ value: name.trim().length, max: 100 }}>
            <input id='criterion-name' className={inputBase} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field label='What it measures' htmlFor='criterion-description' required counter={{ value: description.trim().length, min: 5, max: 500 }}>
            <textarea
              id='criterion-description'
              className={`${textareaBase} min-h-20`}
              maxLength={500}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>
          <Field
            label='Guidance for students'
            htmlFor='criterion-guidance'
            required
            counter={{ value: guidance.trim().length, min: 10, max: 1000 }}
            hint='What low, good and excellent performance look like. Students read this before the evaluation.'
          >
            <textarea
              id='criterion-guidance'
              className={`${textareaBase} min-h-24`}
              maxLength={1000}
              value={guidance}
              onChange={(event) => setGuidance(event.target.value)}
              placeholder='1 = … · 3 = … · 5 = …'
            />
          </Field>
          <div className='grid gap-4 sm:grid-cols-3'>
            <Field label='Weight (%)' htmlFor='criterion-weight' required>
              <input
                id='criterion-weight'
                type='number'
                min={1}
                max={100}
                className={inputBase}
                value={weight}
                onChange={(event) => setWeight(Number(event.target.value))}
              />
            </Field>
            <Field label='Rating scale' htmlFor='criterion-scale'>
              <select id='criterion-scale' className={inputBase} value={scaleMax} onChange={(event) => setScaleMax(Number(event.target.value))}>
                <option value={5}>1 – 5</option>
                <option value={10}>1 – 10</option>
              </select>
            </Field>
            <Field label='Rating step' htmlFor='criterion-step'>
              <select id='criterion-step' className={inputBase} value={ratingStep} onChange={(event) => setRatingStep(Number(event.target.value))}>
                <option value={0.5}>0.5</option>
                <option value={1}>1</option>
              </select>
            </Field>
          </div>
          <label className='flex items-center gap-2 text-[13px] text-[#14211b]'>
            <input type='checkbox' className='size-4 accent-[#184b38]' checked={visible} onChange={(event) => setVisible(event.target.checked)} />
            Visible to students before the evaluation
          </label>
        </div>
        <aside className='space-y-3 rounded-xl bg-[#f7f9f8] p-4 text-[12px]'>
          <p className='text-[13px] font-semibold text-[#14211b]'>Live validation</p>
          <ul className='space-y-1.5'>
            {checks.map((check) => (
              <li key={check.text} className={check.ok ? 'text-[#17603f]' : 'text-[#a3530f]'}>
                {check.ok ? '✓' : '○'} {check.text}
              </li>
            ))}
          </ul>
          <p className={`border-t border-[#e3e8e5] pt-3 ${rubricTotal === 100 ? 'text-[#17603f]' : 'text-[#a3530f]'}`}>
            Rubric total after saving: <strong>{rubricTotal}%</strong>
            {rubricTotal === 100 ? '' : ' — must be exactly 100% to publish.'}
          </p>
          <p className='text-[#5d6b64]'>
            Example: a rating of {scaleMax * 0.8} / {scaleMax} at {weight}% contributes <strong>{example}</strong> points to
            the 100-point result.
          </p>
        </aside>
      </div>
    </Modal>
  )
}
