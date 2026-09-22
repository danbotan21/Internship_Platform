import type { ContributionCategory } from '../../types/contribution'
import { categoryMeta } from './contributionLabels'

export default function CategoryTag({ category }: { category: ContributionCategory }) {
  const { label, icon: Icon } = categoryMeta[category]
  return (
    <span className='inline-flex items-center gap-1.5 rounded-full border border-[#e3e8e5] bg-white px-2.5 py-1 text-[12px] font-medium text-[#3d4a44]'>
      <Icon className='size-3.5 text-[#2b6a50]' aria-hidden='true' />
      {label}
    </span>
  )
}
