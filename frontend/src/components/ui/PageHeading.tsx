import type { ReactNode } from 'react'

type PageHeadingProps = {
  eyebrow?: string
  title: string
  description?: ReactNode
  actions?: ReactNode
  meta?: ReactNode
}

export default function PageHeading({ eyebrow, title, description, actions, meta }: PageHeadingProps) {
  return (
    <div className='mb-6 flex flex-wrap items-start justify-between gap-4'>
      <div className='min-w-0'>
        {eyebrow ? (
          <p className='mb-2 text-[12px] font-bold uppercase tracking-wider text-[#2b6a50]'>{eyebrow}</p>
        ) : null}
        <h1 className='text-[26px] font-bold leading-tight tracking-[-0.02em] text-[#14211b] md:text-[28px]'>
          {title}
        </h1>
        {description ? <div className='mt-1.5 text-[14px] text-[#5d6b64]'>{description}</div> : null}
        {meta ? <div className='mt-3 flex flex-wrap items-center gap-2'>{meta}</div> : null}
      </div>
      {actions ? <div className='flex flex-wrap items-center gap-2'>{actions}</div> : null}
    </div>
  )
}
