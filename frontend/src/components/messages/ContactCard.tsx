import { useState } from 'react'
import { Building2, Check, Clock, Copy, Mail, MapPin, MessageSquare, Phone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { User } from '../../types/messaging'
import Avatar from './Avatar'
import { formatLastSeen, roleLabel } from './format'

type ContactCardProps = {
  user: User
  onMessage?: () => void
  compact?: boolean
}

export default function ContactCard({ user, onMessage, compact = false }: ContactCardProps) {
  const { contact } = user
  return (
    <div className={compact ? '' : 'rounded-xl border border-gray-100 p-4'}>
      <div className="flex items-center gap-3">
        <Avatar user={user} size={compact ? 'lg' : 'md'} showPresence />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">
            {roleLabel[user.role]} · {user.organization}
          </p>
          <p className={`text-xs ${user.online ? 'text-emerald-600' : 'text-gray-400'}`}>{formatLastSeen(user.lastSeenAt)}</p>
        </div>
        {onMessage && (
          <button
            onClick={onMessage}
            className="flex items-center gap-1.5 rounded-lg bg-[#1e3a2c] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#28503c]"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Message
          </button>
        )}
      </div>

      <dl className="mt-4 space-y-2.5 text-sm">
        <ContactRow icon={Mail} label="Email" value={contact.email} href={`mailto:${contact.email}`} />
        <ContactRow icon={Phone} label="Phone" value={contact.phone} href={`tel:${contact.phone.replace(/\s/g, '')}`} />
        <ContactRow icon={MapPin} label="Location" value={contact.location} />
        <ContactRow icon={Clock} label="Availability" value={contact.availability} />
        <ContactRow icon={Building2} label="Prefers" value={contact.preferredChannel} />
      </dl>
    </div>
  )
}

function ContactRow({ icon: Icon, label, value, href }: { icon: LucideIcon; label: string; value: string; href?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be unavailable (e.g. insecure context); the value is still selectable.
    }
  }

  return (
    <div className="group flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] text-gray-400">{label}</dt>
        <dd className="truncate text-gray-800">
          {href ? (
            <a href={href} className="hover:text-[#1e3a2c] hover:underline">
              {value}
            </a>
          ) : (
            value || '—'
          )}
        </dd>
      </div>
      {href && (
        <button
          onClick={copy}
          title={`Copy ${label.toLowerCase()}`}
          className="rounded p-1 text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-600 focus:opacity-100"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  )
}
