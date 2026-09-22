import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

type ModalProps = {
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}

export default function Modal({ title, description, onClose, children, footer, wide }: ModalProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-[#14211b]/45 p-4'
      role='presentation'
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role='dialog'
        aria-modal='true'
        aria-label={title}
        className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${
          wide ? 'max-w-4xl' : 'max-w-lg'
        }`}
      >
        <header className='flex items-start justify-between gap-4 border-b border-[#eef1ef] px-6 py-4'>
          <div>
            <h2 className='text-[17px] font-bold text-[#14211b]'>{title}</h2>
            {description ? <p className='mt-0.5 text-[13px] text-[#5d6b64]'>{description}</p> : null}
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg p-1.5 text-[#5d6b64] hover:bg-[#f2f5f3]'
            aria-label='Close'
          >
            <X className='size-4' aria-hidden='true' />
          </button>
        </header>
        <div className='overflow-y-auto px-6 py-5'>{children}</div>
        {footer ? (
          <footer className='flex flex-wrap justify-end gap-2 border-t border-[#eef1ef] bg-[#fafbfa] px-6 py-4'>
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  )
}
