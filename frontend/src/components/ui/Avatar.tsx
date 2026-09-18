const palette = [
  'bg-[#e8f2ed] text-[#184b38]',
  'bg-[#eaf0ff] text-[#2f5aa8]',
  'bg-[#fdf1e4] text-[#94510f]',
  'bg-[#f3eafc] text-[#6b3fa0]',
  'bg-[#e6f4f6] text-[#1f6570]',
]

function initials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  )
}

export default function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const tone = palette[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length]
  const dimensions = size === 'sm' ? 'size-7 text-[11px]' : 'size-9 text-[12px]'
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${dimensions} ${tone}`}
      aria-hidden='true'
    >
      {initials(name)}
    </span>
  )
}
