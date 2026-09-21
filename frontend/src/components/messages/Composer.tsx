import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Paperclip, SendHorizontal, X } from 'lucide-react'
import type { Attachment } from '../../types/messaging'
import { formatFileSize } from './format'

type ComposerProps = {
  placeholder: string
  onSend: (body: string, attachment?: Attachment) => void
  disabled?: boolean
  disabledReason?: string
}

export default function Composer({ placeholder, onSend, disabled = false, disabledReason }: ComposerProps) {
  const [body, setBody] = useState('')
  const [attachment, setAttachment] = useState<Attachment>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (disabled) {
    return <p className="rounded-full bg-gray-100 px-5 py-3 text-center text-sm text-gray-500">{disabledReason}</p>
  }

  const canSend = body.trim() !== '' || attachment !== undefined

  const send = () => {
    if (!canSend) return
    onSend(body, attachment)
    setBody('')
    setAttachment(undefined)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    textareaRef.current?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      send()
    }
  }

  return (
    <div>
      {attachment && (
        <div className="mb-2 inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-700">
          <Paperclip className="h-3.5 w-3.5" />
          <span className="max-w-60 truncate font-medium">{attachment.name}</span>
          <span className="text-gray-400">{formatFileSize(attachment.size)}</span>
          <button onClick={() => setAttachment(undefined)} className="text-gray-400 hover:text-gray-700" aria-label="Remove attachment">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-3">
        <div className="flex flex-1 items-end rounded-3xl bg-gray-100 pr-2 pl-5">
          <textarea
            ref={textareaRef}
            rows={1}
            value={body}
            placeholder={placeholder}
            onChange={(event) => {
              setBody(event.target.value)
              event.target.style.height = 'auto'
              event.target.style.height = `${Math.min(event.target.scrollHeight, 140)}px`
            }}
            onKeyDown={onKeyDown}
            className="max-h-35 flex-1 resize-none bg-transparent py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="mb-1.5 rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
            title="Attach a file"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) setAttachment({ name: file.name, size: file.size })
              event.target.value = ''
            }}
          />
        </div>
        <button
          onClick={send}
          disabled={!canSend}
          className="flex h-11 items-center gap-1.5 rounded-full bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-40"
        >
          Send
          <SendHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
