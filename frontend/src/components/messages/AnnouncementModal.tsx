import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMessaging } from '../../hooks/useMessaging'
import type { AnnouncementInput } from '../../hooks/useMessaging'
import Field from './Field'
import Modal from './Modal'
import { inputClass, primaryButton, secondaryButton } from './styles'

export default function AnnouncementModal({ onClose }: { onClose: () => void }) {
  const { sendAnnouncement } = useMessaging()
  const [form, setForm] = useState<AnnouncementInput>({
    category: 'announcement',
    title: '',
    body: '',
    audience: 'all',
  })

  const needsDate = form.category === 'deadline' || form.category === 'event'
  const valid = form.title.trim() !== '' && form.body.trim() !== '' && (!needsDate || Boolean(form.dueAt))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!valid) return
    sendAnnouncement({ ...form, dueAt: needsDate && form.dueAt ? new Date(form.dueAt).toISOString() : undefined })
    onClose()
  }

  return (
    <Modal
      title="Send a notification"
      description="Delivered to the chat of every recipient under Internship updates."
      onClose={onClose}
      footer={
        <>
          <button className={secondaryButton} onClick={onClose}>
            Cancel
          </button>
          <button className={primaryButton} type="submit" form="announcement-form" disabled={!valid}>
            Send
          </button>
        </>
      }
    >
      <form id="announcement-form" onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Type">
            <select
              className={inputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as AnnouncementInput['category'] })}
            >
              <option value="announcement">Announcement</option>
              <option value="deadline">Deadline</option>
              <option value="task">Task</option>
              <option value="event">Event</option>
            </select>
          </Field>
          <Field label="Send to">
            <select
              className={inputClass}
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value as AnnouncementInput['audience'] })}
            >
              <option value="all">Interns and mentors</option>
              <option value="interns">Interns only</option>
              <option value="mentors">Mentors only</option>
            </select>
          </Field>
        </div>
        <Field label="Title">
          <input autoFocus className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Message">
          <textarea
            rows={3}
            className={`${inputClass} resize-none`}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
        </Field>
        {needsDate && (
          <Field label={form.category === 'deadline' ? 'Due' : 'Starts'}>
            <input
              type="datetime-local"
              className={inputClass}
              value={form.dueAt ?? ''}
              onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
            />
          </Field>
        )}
      </form>
    </Modal>
  )
}
