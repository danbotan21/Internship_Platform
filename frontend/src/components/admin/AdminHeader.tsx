import { Fragment } from 'react'
import { Link } from 'react-router-dom'

export type Crumb = {
  label: string
  to?: string
}

type AdminHeaderProps = {
  crumbs: Crumb[]
}

export default function AdminHeader({ crumbs }: AdminHeaderProps) {
  return (
    <header className="flex h-20 shrink-0 items-center bg-white px-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] font-medium text-[#718078]">
        {crumbs.map((crumb, index) => (
          <Fragment key={`${crumb.label}-${index}`}>
            {index > 0 && <span aria-hidden="true">/</span>}
            {crumb.to ? (
              <Link to={crumb.to} className="hover:text-[#172c23]">
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page">{crumb.label}</span>
            )}
          </Fragment>
        ))}
      </nav>
    </header>
  )
}
