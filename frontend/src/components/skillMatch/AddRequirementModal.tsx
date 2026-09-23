import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, Search, BookOpen, Sparkles } from 'lucide-react'
import type { RequirementWeight } from '../../types/skillMatch'
import { fetchQuizzes } from '../../api/quizzes'
import { quizzesCatalog } from '../../data/quizzesData'

interface AddRequirementModalProps {
  isOpen: boolean
  onClose: () => void
  currentRequirements?: RequirementWeight[]
  onSaveRequirements?: (requirements: RequirementWeight[]) => void
  onAdd?: (req: RequirementWeight) => void
  onAddMultiple?: (reqs: RequirementWeight[]) => void
  existingRequirementIds?: string[]
}

interface ItemOption {
  id: string
  title: string
  category: string
  passingScore: number
  durationMinutes?: number
  difficulty?: string
  isCustom?: boolean
  isQuiz: boolean
  existingGate?: number
  existingWeight?: number
}

function isItemMatchRequirement(item: ItemOption, req: RequirementWeight): boolean {
  const itemId = item.id.toLowerCase().replace(/^quiz-/, '')
  const reqId = req.id.toLowerCase().replace(/^quiz-/, '')
  const reqQuizId = (req.quizId || '').toLowerCase().replace(/^quiz-/, '')

  if (itemId && reqId && itemId === reqId) return true
  if (itemId && reqQuizId && itemId === reqQuizId) return true

  const cleanReqName = req.name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const cleanItemTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (cleanReqName && cleanItemTitle) {
    if (
      cleanReqName === cleanItemTitle ||
      cleanReqName.includes(cleanItemTitle) ||
      cleanItemTitle.includes(cleanReqName)
    ) {
      return true
    }
  }

  return false
}

export default function AddRequirementModal({
  isOpen,
  onClose,
  currentRequirements = [],
  onSaveRequirements,
  onAdd,
  onAddMultiple,
  existingRequirementIds = [],
}: AddRequirementModalProps) {
  // Quiz list state
  const [quizzes, setQuizzes] = useState<ItemOption[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Multi-selection state: mapped by normalized option id
  const [selectedItems, setSelectedItems] = useState<Record<string, ItemOption>>({})

  // Form inputs for default gate & weight (applied to newly added items)
  const [gate, setGate] = useState(70)
  const [weight, setWeight] = useState(20)

  // Track if selection was initialized for this open cycle
  const initializedRef = useRef(false)

  // Load quizzes from catalog and API
  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false
      setSearchQuery('')
      return
    }

    const baseOptions: ItemOption[] = quizzesCatalog.map((q) => ({
      id: q.id,
      title: q.title,
      category: q.questions?.[0]?.category || 'TECHNICAL',
      passingScore: q.passingScore,
      durationMinutes: q.durationMinutes,
      difficulty: q.difficulty,
      isCustom: false,
      isQuiz: true,
    }))

    fetchQuizzes()
      .then((apiQuizzes) => {
        if (apiQuizzes && apiQuizzes.length > 0) {
          const merged: ItemOption[] = apiQuizzes.map((q) => ({
            id: q.slug || q.id,
            title: q.title,
            category: q.category,
            passingScore: q.passingScore,
            durationMinutes: q.durationMinutes,
            difficulty: q.difficulty,
            isCustom: q.isCustom,
            isQuiz: true,
          }))
          setQuizzes(merged)
        } else {
          setQuizzes(baseOptions)
        }
      })
      .catch(() => {
        setQuizzes(baseOptions)
      })
  }, [isOpen])

  // Synchronize initial selection from currentRequirements whenever modal opens and quizzes are ready
  useEffect(() => {
    if (!isOpen || initializedRef.current) return

    const initialMap: Record<string, ItemOption> = {}
    const allOptions = quizzes

    allOptions.forEach((option) => {
      const match = currentRequirements.find((r) => isItemMatchRequirement(option, r))
      if (match) {
        initialMap[option.id] = {
          ...option,
          existingGate: match.gate,
          existingWeight: match.weight,
        }
      } else if (
        existingRequirementIds.includes(option.id) ||
        existingRequirementIds.includes(`quiz-${option.id}`)
      ) {
        initialMap[option.id] = option
      }
    })

    setSelectedItems(initialMap)
    initializedRef.current = true
  }, [isOpen, quizzes, currentRequirements, existingRequirementIds])

  // Current items based on quizzes
  const currentItems = quizzes

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return currentItems
    const q = searchQuery.toLowerCase()
    return currentItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    )
  }, [currentItems, searchQuery])

  // Toggle selection of an item (select or deselect directly)
  const toggleItem = (item: ItemOption) => {
    setSelectedItems((prev) => {
      const next = { ...prev }
      if (next[item.id]) {
        delete next[item.id]
      } else {
        const existing = currentRequirements.find((r) => isItemMatchRequirement(item, r))
        next[item.id] = {
          ...item,
          existingGate: existing?.gate,
          existingWeight: existing?.weight,
        }
      }
      return next
    })
  }

  // Select all available filtered items
  const handleSelectAllFiltered = () => {
    setSelectedItems((prev) => {
      const next = { ...prev }
      filteredItems.forEach((item) => {
        const existing = currentRequirements.find((r) => isItemMatchRequirement(item, r))
        next[item.id] = {
          ...item,
          existingGate: existing?.gate,
          existingWeight: existing?.weight,
        }
      })
      return next
    })
  }

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedItems({})
  }

  if (!isOpen) return null

  const selectedCount = Object.keys(selectedItems).length

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const items = Object.values(selectedItems)
    if (items.length === 0) return

    const updatedRequirements: RequirementWeight[] = items.map((item) => {
      const existing = currentRequirements.find((r) => isItemMatchRequirement(item, r))
      const cleanQuizId = item.id.replace(/^quiz-/, '')

      return {
        id: item.isQuiz ? `quiz-${cleanQuizId}` : item.id,
        name: item.title,
        gate: existing?.gate ?? (item.passingScore > 0 ? item.passingScore : Math.max(0, Math.min(100, gate))),
        weight: existing?.weight ?? Math.max(1, Math.min(100, weight)),
        isQuiz: item.isQuiz,
        quizId: item.isQuiz ? cleanQuizId : undefined,
        quizTitle: item.isQuiz ? item.title : undefined,
        color: existing?.color,
      }
    })

    if (onSaveRequirements) {
      onSaveRequirements(updatedRequirements)
    } else if (onAddMultiple) {
      onAddMultiple(updatedRequirements)
    } else if (onAdd) {
      updatedRequirements.forEach((r) => onAdd(r))
    }

    onClose()
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 cursor-default max-h-[92vh] flex flex-col"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Manage Requirements & Quizzes</h3>
            <p className="text-xs text-gray-500">
              Select or deselect assessment quizzes to evaluate candidate benchmark readiness
            </p>
          </div>
        </div>

        {/* Quizzes Header & Count */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1e3a2c] text-white shadow-2xs">
            <BookOpen className="h-3.5 w-3.5" />
            Assessment Quizzes ({quizzes.length})
          </div>

          {selectedCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
              <Sparkles className="h-3 w-3" />
              {selectedCount} selected
            </span>
          )}
        </div>

        {/* Search & Bulk Select Controls */}
        <div className="space-y-2 mb-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 pl-9 pr-3.5 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-[#1e3a2c] focus:ring-1 focus:ring-[#1e3a2c]/20 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>{filteredItems.length} items available</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="text-emerald-700 hover:underline font-semibold cursor-pointer text-[11px]"
              >
                Select All
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-gray-500 hover:text-gray-800 font-semibold cursor-pointer text-[11px]"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>

        {/* Items List (Scrollable - Click to select OR deselect) */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px] max-h-56">
          {filteredItems.map((item) => {
            const isSelected = Boolean(selectedItems[item.id])

            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-2xs ring-1 ring-emerald-600/20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70'
                }`}
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-950 font-extrabold' : 'text-gray-900'}`}>
                      {item.title}
                    </p>
                    {item.isCustom && (
                      <span className="rounded bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.5">
                        Custom
                      </span>
                    )}
                    {isSelected && (
                      <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 border border-emerald-200">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {item.category}
                    {item.durationMinutes ? ` · ${item.durationMinutes} min` : ''}
                    {item.passingScore ? ` · Passing: ${item.passingScore}%` : ''}
                  </p>
                </div>

                {/* Checkbox (toggle check / uncheck) */}
                <div className="shrink-0">
                  {isSelected ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#1e3a2c] text-white shadow-2xs">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-md border border-gray-300 bg-white hover:border-gray-400" />
                  )}
                </div>
              </div>
            )
          })}

          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-xs text-gray-400">
              No items match your search.
            </div>
          )}
        </div>

        {/* Informative Notice */}
        <div className="mt-3 rounded-xl bg-emerald-50/80 border border-emerald-100 p-2.5 text-[11px] text-emerald-900 leading-relaxed shrink-0">
          Click any requirement to check or uncheck it. Checked items will be included in candidate scoring; unchecking an item removes it from requirements.
        </div>

        <form onSubmit={handleSubmit} className="shrink-0 mt-3 pt-3 border-t border-gray-100 space-y-4">
          {/* Gate and Weight Config for New Items */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Default Gate (%) for New Items
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gate}
                  onChange={(e) => setGate(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 pl-3.5 pr-8 py-2 text-sm text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-[#1e3a2c] focus:ring-2 focus:ring-[#1e3a2c]/10 focus:outline-none"
                />
                <span className="pointer-events-none absolute right-3 top-2.5 text-xs font-semibold text-gray-400 select-none">%</span>
              </div>
              <p className="mt-0.5 text-[10px] text-gray-400">Applied if quiz passing score not defined</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Default Weight (%) for New Items
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 pl-3.5 pr-8 py-2 text-sm text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-[#1e3a2c] focus:ring-2 focus:ring-[#1e3a2c]/10 focus:outline-none"
                />
                <span className="pointer-events-none absolute right-3 top-2.5 text-xs font-semibold text-gray-400 select-none">%</span>
              </div>
              <p className="mt-0.5 text-[10px] text-gray-400">Initial score calculation weight</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#f97316] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#ea580c] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4 stroke-[2.5]" />
              {selectedCount <= 1
                ? `Apply ${selectedCount === 1 ? '1 Requirement' : 'Requirements'}`
                : `Apply ${selectedCount} Requirements`}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
