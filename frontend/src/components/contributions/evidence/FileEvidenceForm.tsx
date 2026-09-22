import { Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import Button from '../../ui/Button'
import Field from '../../ui/Field'
import { textareaBase } from '../../ui/styles'

const accepted = 'image/png,image/jpeg,image/webp,image/gif,application/pdf'
const maxImageBytes = 3 * 1024 * 1024
const maxDocumentBytes = 5 * 1024 * 1024

type FileEvidenceFormProps = {
  onUpload: (file: File, caption: string) => Promise<boolean>
}

export default function FileEvidenceForm({ onUpload }: FileEvidenceFormProps) {
  const input = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const choose = (next?: File) => {
    setError('')
    if (!next) return
    const isPdf = next.type === 'application/pdf'
    if (!isPdf && !next.type.startsWith('image/')) {
      setError('Choose a screenshot (PNG, JPEG, WebP, GIF) or a PDF document.')
      return
    }
    if (next.size > (isPdf ? maxDocumentBytes : maxImageBytes)) {
      setError(isPdf ? 'Documents must be smaller than 5 MB.' : 'Screenshots must be smaller than 3 MB.')
      return
    }
    setFile(next)
  }

  const upload = async () => {
    if (!file) return
    setUploading(true)
    const uploaded = await onUpload(file, caption.trim())
    setUploading(false)
    if (uploaded) {
      setFile(null)
      setCaption('')
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className='space-y-4'>
      <button
        type='button'
        onClick={() => input.current?.click()}
        className='flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[#cfd9d3] bg-[#f7f9f8] px-4 py-8 text-center transition hover:border-[#2b6a50] hover:bg-[#eef3f0]'
      >
        <Upload className='size-6 text-[#2b6a50]' aria-hidden='true' />
        <span className='text-[14px] font-semibold text-[#14211b]'>
          {file ? file.name : 'Choose a screenshot or PDF'}
        </span>
        <span className='text-[12px] text-[#5d6b64]'>
          PNG, JPEG, WebP or GIF up to 3 MB · PDF up to 5 MB · the content is verified on upload
        </span>
      </button>
      <input
        ref={input}
        type='file'
        accept={accepted}
        className='sr-only'
        onChange={(event) => choose(event.target.files?.[0])}
      />
      <Field
        label='What does this file show?'
        htmlFor='file-caption'
        required
        counter={{ value: caption.trim().length, min: 10, max: 500 }}
        error={error || null}
        hint='The mentor reads this next to the file, e.g. "Review screen after the redesign, desktop layout".'
      >
        <textarea
          id='file-caption'
          className={`${textareaBase} min-h-20`}
          maxLength={500}
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
        />
      </Field>
      <div className='flex justify-end'>
        <Button
          icon={Upload}
          loading={uploading}
          disabled={!file || caption.trim().length < 10}
          onClick={() => void upload()}
        >
          Upload evidence
        </Button>
      </div>
    </div>
  )
}
