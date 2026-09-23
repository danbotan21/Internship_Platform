import type { RubricCriterion } from '../../types/evaluation'

const palette = ['#184b38', '#2c8a5a', '#4b76c9', '#e07a26', '#8f5bc4', '#1f6570', '#c9483e', '#8a5200']

// Stacked bar of criterion weights against the required 100%.
export default function WeightMeter({ criteria }: { criteria: RubricCriterion[] }) {
  const total = criteria.reduce((sum, item) => sum + item.weight, 0)
  const tone = total === 100 ? 'text-[#17603f]' : 'text-[#a1332b]'
  return (
    <div>
      <div className='flex items-baseline justify-between'>
        <p className='text-[13px] font-semibold text-[#14211b]'>Total weight</p>
        <p className={`text-[13px] font-bold tabular-nums ${tone}`}>
          {total}% {total === 100 ? '' : `(${total > 100 ? '+' : ''}${total - 100})`}
        </p>
      </div>
      <div className='mt-2 flex h-3 overflow-hidden rounded-full bg-[#eef1ef]'>
        {criteria.map((item, index) => (
          <div
            key={item.id}
            title={`${item.name}: ${item.weight}%`}
            style={{ width: `${(item.weight / Math.max(total, 100)) * 100}%`, background: palette[index % palette.length] }}
          />
        ))}
      </div>
      <ul className='mt-2 flex flex-wrap gap-x-3 gap-y-1'>
        {criteria.map((item, index) => (
          <li key={item.id} className='inline-flex items-center gap-1 text-[11px] text-[#5d6b64]'>
            <span className='size-2 rounded-full' style={{ background: palette[index % palette.length] }} aria-hidden='true' />
            {item.name} {item.weight}%
          </li>
        ))}
      </ul>
    </div>
  )
}
