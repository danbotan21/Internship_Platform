type RatingInputProps = {
  value: number | null
  scaleMax: number
  step: number
  label: string
  disabled?: boolean
  onChange: (value: number | null) => void
}

// One button per allowed rating; clicking the selected value clears it.
export default function RatingInput({ value, scaleMax, step, label, disabled, onChange }: RatingInputProps) {
  const options: number[] = []
  for (let rating = 1; rating <= scaleMax + 0.001; rating += step) {
    options.push(Math.round(rating * 10) / 10)
  }

  return (
    <div role='radiogroup' aria-label={label} className='flex flex-wrap gap-1'>
      {options.map((option) => {
        const selected = value === option
        const whole = Number.isInteger(option)
        return (
          <button
            key={option}
            type='button'
            role='radio'
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(selected ? null : option)}
            className={`h-9 rounded-lg border text-[13px] font-semibold tabular-nums transition disabled:cursor-not-allowed disabled:opacity-60 ${
              whole ? 'min-w-9 px-2' : 'min-w-9 px-1.5 text-[12px]'
            } ${
              selected
                ? 'border-[#184b38] bg-[#184b38] text-white'
                : whole
                  ? 'border-[#d9e0dc] bg-white text-[#14211b] hover:border-[#2b6a50]'
                  : 'border-dashed border-[#d9e0dc] bg-white text-[#5d6b64] hover:border-[#2b6a50]'
            }`}
          >
            {whole ? option : option.toFixed(1)}
          </button>
        )
      })}
    </div>
  )
}
