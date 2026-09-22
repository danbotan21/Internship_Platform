import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Pencil } from 'lucide-react'
import { useMessaging } from '../../hooks/useMessaging'
import { contactsFor } from '../../hooks/messagingStore'
import type { ContactInfo } from '../../types/messaging'
import ContactCard from './ContactCard'
import Field from './Field'
import Modal from './Modal'
import { inputClass, primaryButton, secondaryButton } from './styles'

export default function ContactsModal({ onClose, startEditing = false }: { onClose: () => void; startEditing?: boolean }) {
  const { state, me, openDirectWith } = useMessaging()
  const [editing, setEditing] = useState(startEditing)

  const contacts = contactsFor(state)
  const mentor = me.mentorId ? state.users[me.mentorId] : undefined
  const myInterns = contacts.filter((user) => user.mentorId === me.id)
  const others = contacts.filter((user) => user.id !== mentor?.id && user.mentorId !== me.id)

  const message = (userId: string) => {
    openDirectWith(userId)
    onClose()
  }

  if (editing) return <EditContactModal onClose={onClose} onBack={startEditing ? undefined : () => setEditing(false)} />

  return (
    <Modal title="Contacts" description="Contact details you have access to." onClose={onClose} width="max-w-2xl">
      <div className="mb-5 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-gray-900">Your contact information</p>
          <p className="text-xs text-gray-500">
            {me.contact.email} · {me.contact.phone}
          </p>
        </div>
        <button onClick={() => setEditing(true)} className={`${secondaryButton} flex items-center gap-1.5 bg-white`}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>

      {mentor && (
        <Section title="Your mentor">
          <ContactCard user={mentor} onMessage={() => message(mentor.id)} />
        </Section>
      )}

      {me.role === 'mentor' && (
        <Section title={`Your interns (${myInterns.length})`}>
          {myInterns.length === 0 && <p className="text-sm text-gray-400">No interns are assigned to you yet.</p>}
          <div className="grid gap-3 md:grid-cols-2">
            {myInterns.map((intern) => (
              <ContactCard key={intern.id} user={intern} onMessage={() => message(intern.id)} />
            ))}
          </div>
        </Section>
      )}

      {others.length > 0 && (
        <Section title={me.role === 'coordinator' || me.role === 'admin' ? 'Everyone' : 'Coordinators'}>
          <div className="grid gap-3 md:grid-cols-2">
            {others.map((user) => (
              <ContactCard key={user.id} user={user} onMessage={() => message(user.id)} />
            ))}
          </div>
        </Section>
      )}
    </Modal>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-5 last:mb-0">
      <h3 className="mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">{title}</h3>
      {children}
    </section>
  )
}

function EditContactModal({ onClose, onBack }: { onClose: () => void; onBack?: () => void }) {
  const { me, updateMyContact } = useMessaging()
  const [form, setForm] = useState<ContactInfo>(me.contact)
  const [saved, setSaved] = useState(false)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  const phoneValid = /^\+?[\d\s()-]{7,}$/.test(form.phone)
  const valid = emailValid && phoneValid

  const set = <K extends keyof ContactInfo>(key: K, value: ContactInfo[K]) => {
    setSaved(false)
    setForm((current) => ({ ...current, [key]: value }))
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!valid) return
    updateMyContact({ ...form, email: form.email.trim(), phone: form.phone.trim() })
    setSaved(true)
  }

  return (
    <Modal
      title="Edit contact information"
      description="Your mentor, interns and coordinators see these details."
      onClose={onClose}
      footer={
        <>
          {saved && <span className="mr-auto self-center text-sm text-emerald-600">Saved ✓</span>}
          <button className={secondaryButton} onClick={onBack ?? onClose}>
            {onBack ? 'Back' : 'Close'}
          </button>
          <button className={primaryButton} form="contact-form" type="submit" disabled={!valid}>
            Save changes
          </button>
        </>
      }
    >
      <form id="contact-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" error={!emailValid ? 'Enter a valid email address' : undefined}>
          <input className={inputClass} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label="Phone" error={!phoneValid ? 'Enter a valid phone number' : undefined}>
          <input className={inputClass} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </Field>
        <Field label="Location">
          <input className={inputClass} value={form.location} onChange={(e) => set('location', e.target.value)} />
        </Field>
        <Field label="Availability">
          <input className={inputClass} value={form.availability} onChange={(e) => set('availability', e.target.value)} />
        </Field>
        <Field label="Preferred contact method">
          <select
            className={inputClass}
            value={form.preferredChannel}
            onChange={(e) => set('preferredChannel', e.target.value as ContactInfo['preferredChannel'])}
          >
            <option>Chat</option>
            <option>Email</option>
            <option>Phone</option>
          </select>
        </Field>
      </form>
    </Modal>
  )
}
