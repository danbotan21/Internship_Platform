type Tab<T extends string> = {
  value: T
  label: string
  count?: number
}

type TabsProps<T extends string> = {
  tabs: Tab<T>[]
  value: T
  onChange: (value: T) => void
  label: string
}

export default function Tabs<T extends string>({ tabs, value, onChange, label }: TabsProps<T>) {
  return (
    <div
      role='tablist'
      aria-label={label}
      className='flex gap-1 overflow-x-auto rounded-xl border border-[#e3e8e5] bg-white p-1'
    >
      {tabs.map((tab) => {
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            type='button'
            role='tab'
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition ${
              active ? 'bg-[#184b38] text-white' : 'text-[#5d6b64] hover:bg-[#f2f5f3]'
            }`}
          >
            {tab.label}
            {tab.count !== undefined ? (
              <span
                className={`rounded-full px-1.5 text-[11px] tabular-nums ${
                  active ? 'bg-white/20' : 'bg-[#eef1ef] text-[#5d6b64]'
                }`}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
