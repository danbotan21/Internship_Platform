import { CircleDot } from 'lucide-react'
import { categories, categoryMeta } from '../../../components/contributions/contributionLabels'
import Field from '../../../components/ui/Field'
import { todayIso } from '../../../components/ui/formatDateTime'
import { card, inputBase, sectionTitle, textareaBase } from '../../../components/ui/styles'
import type { ContributionDetails, DraftInput } from '../../../types/contribution'

type EditorDetailsStepProps = {
  form: DraftInput
  contribution: ContributionDetails | null
  onChange: (changes: Partial<DraftInput>) => void
}

export default function EditorDetailsStep({ form, contribution, onChange }: EditorDetailsStepProps) {
  const today = todayIso()
  const linkedIssue = contribution?.currentRevision.linkedIssue
  const periodError =
    form.workStartDate && form.workEndDate && form.workEndDate < form.workStartDate
      ? 'The end date is before the start date.'
      : null

  return (
    <div className='space-y-5'>
      <section className={`${card} space-y-5 p-5`}>
        <h2 className={sectionTitle}>What did you deliver?</h2>
        <Field
          label='Title'
          htmlFor='title'
          required
          counter={{ value: form.title.trim().length, min: 5, max: 200 }}
          hint='A short, specific name of the result, e.g. "Mentor review screen with structured criteria".'
        >
          <input
            id='title'
            className={inputBase}
            maxLength={200}
            value={form.title}
            onChange={(event) => onChange({ title: event.target.value })}
          />
        </Field>

        <fieldset>
          <legend className='text-[13px] font-semibold text-[#14211b]'>
            Category <span className='text-[#a1332b]'>*</span>
          </legend>
          <p className='mt-0.5 text-[12px] text-[#5d6b64]'>The category decides which evidence is required.</p>
          <div className='mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
            {categories.map((category) => {
              const { label, icon: Icon, requirement } = categoryMeta[category]
              const selected = form.category === category
              return (
                <label key={category} className='cursor-pointer'>
                  <input
                    type='radio'
                    name='category'
                    className='peer sr-only'
                    checked={selected}
                    onChange={() => onChange({ category })}
                  />
                  <span
                    className={`flex h-full gap-3 rounded-xl border p-3 transition peer-focus-visible:ring-2 peer-focus-visible:ring-[#2b6a50]/30 ${
                      selected ? 'border-[#184b38] bg-[#f2f8f5]' : 'border-[#e3e8e5] hover:border-[#b9cfc3]'
                    }`}
                  >
                    <Icon className={`mt-0.5 size-5 shrink-0 ${selected ? 'text-[#184b38]' : 'text-[#8a958f]'}`} aria-hidden='true' />
                    <span>
                      <span className='block text-[13px] font-semibold text-[#14211b]'>{label}</span>
                      <span className='block text-[12px] text-[#5d6b64]'>{requirement}</span>
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className='grid gap-4 sm:grid-cols-2'>
          <Field label='Work started' htmlFor='work-start' required error={periodError}>
            <input
              id='work-start'
              type='date'
              className={inputBase}
              max={today}
              value={form.workStartDate ?? ''}
              onChange={(event) => onChange({ workStartDate: event.target.value || null })}
            />
          </Field>
          <Field
            label='Work finished'
            htmlFor='work-end'
            required
            hint='GitHub evidence is checked against these dates.'
          >
            <input
              id='work-end'
              type='date'
              className={inputBase}
              min={form.workStartDate ?? undefined}
              max={today}
              value={form.workEndDate ?? ''}
              onChange={(event) => onChange({ workEndDate: event.target.value || null })}
            />
          </Field>
        </div>
      </section>

      <section className={`${card} space-y-5 p-5`}>
        <h2 className={sectionTitle}>Explain the work</h2>
        <Field
          label='Description'
          htmlFor='description'
          required
          counter={{ value: form.description.trim().length, min: 50, max: 4000 }}
          hint='Which problem you solved, what you built or changed, and how it was verified.'
        >
          <textarea
            id='description'
            className={`${textareaBase} min-h-36`}
            maxLength={4000}
            value={form.description}
            onChange={(event) => onChange({ description: event.target.value })}
          />
        </Field>
        <Field
          label='Your personal role'
          htmlFor='own-role'
          required
          counter={{ value: form.ownRole.trim().length, min: 15, max: 500 }}
          hint='What you did yourself. Collaborators are credited separately in the Team step.'
        >
          <textarea
            id='own-role'
            className={`${textareaBase} min-h-20`}
            maxLength={500}
            value={form.ownRole}
            onChange={(event) => onChange({ ownRole: event.target.value })}
          />
        </Field>
        <Field
          label='Linked task (GitHub issue)'
          htmlFor='linked-issue'
          hint='Optional. An issue of the team repository, e.g. https://github.com/owner/repo/issues/12.'
        >
          <input
            id='linked-issue'
            className={inputBase}
            value={form.linkedIssueUrl ?? ''}
            onChange={(event) => onChange({ linkedIssueUrl: event.target.value || null })}
            placeholder='https://github.com/…/issues/…'
          />
        </Field>
        {linkedIssue && form.linkedIssueUrl === linkedIssue.url ? (
          <p className='-mt-3 inline-flex items-center gap-1.5 text-[12px] text-[#17603f]'>
            <CircleDot className='size-3.5' aria-hidden='true' />
            Verified: #{linkedIssue.number} {linkedIssue.title} ({linkedIssue.state})
          </p>
        ) : null}
      </section>
    </div>
  )
}
