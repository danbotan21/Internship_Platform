import { Link2 } from 'lucide-react'
import { useState } from 'react'
import Alert from '../../ui/Alert'
import Button from '../../ui/Button'
import Field from '../../ui/Field'
import { inputBase, textareaBase } from '../../ui/styles'

type LinkEvidenceFormProps = {
  onAdd: (name: string, url: string, caption: string) => Promise<boolean>
}

function isHttpUrl(value: string) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

export default function LinkEvidenceForm({ onAdd }: LinkEvidenceFormProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [adding, setAdding] = useState(false)
  const urlError = url.trim() && !isHttpUrl(url.trim()) ? 'Enter a full http(s) URL.' : null
  const valid = name.trim().length >= 3 && isHttpUrl(url.trim()) && caption.trim().length >= 10

  const add = async () => {
    setAdding(true)
    const added = await onAdd(name.trim(), url.trim(), caption.trim())
    setAdding(false)
    if (added) {
      setName('')
      setUrl('')
      setCaption('')
    }
  }

  return (
    <div className='space-y-4'>
      <Alert tone='info'>
        Links cannot be verified automatically, so they only count as primary evidence for design (e.g.
        Figma) and research. Use GitHub or a file whenever you can.
      </Alert>
      <div className='grid gap-4 sm:grid-cols-2'>
        <Field label='Name' htmlFor='link-name' required>
          <input
            id='link-name'
            className={inputBase}
            maxLength={200}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder='e.g. Figma — review screen'
          />
        </Field>
        <Field label='URL' htmlFor='link-url' required error={urlError}>
          <input
            id='link-url'
            className={inputBase}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder='https://'
          />
        </Field>
      </div>
      <Field
        label='What does the link prove?'
        htmlFor='link-caption'
        required
        counter={{ value: caption.trim().length, min: 10, max: 500 }}
      >
        <textarea
          id='link-caption'
          className={`${textareaBase} min-h-20`}
          maxLength={500}
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
        />
      </Field>
      <div className='flex justify-end'>
        <Button icon={Link2} loading={adding} disabled={!valid} onClick={() => void add()}>
          Add link
        </Button>
      </div>
    </div>
  )
}
