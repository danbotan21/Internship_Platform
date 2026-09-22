import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface CustomSelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (val: string) => void
  options: CustomSelectOption[]
  className?: string
  size?: 'sm' | 'md'
}

export function CustomSelect({
  value,
  onChange,
  options,
  className = '',
  size = 'md',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const paddingClass = size === 'sm' ? 'px-3.5 py-2 text-xs' : 'px-3.5 py-2.5 text-xs sm:text-sm'

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-gray-50/70 hover:bg-gray-100/80 border text-left font-medium text-gray-800 rounded-xl ${paddingClass} flex items-center justify-between shadow-2xs transition-all cursor-pointer ${
          isOpen
            ? 'border-emerald-600 ring-2 ring-emerald-800/15 bg-white'
            : 'border-gray-200'
        }`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : value}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-emerald-700' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150 max-h-56 overflow-y-auto no-scrollbar">
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-xs sm:text-sm rounded-xl font-medium transition-colors cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-900 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 ml-2" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
