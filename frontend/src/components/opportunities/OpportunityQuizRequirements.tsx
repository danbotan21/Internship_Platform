import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, Search, X, BookOpen, Check } from 'lucide-react'
import { fetchQuizzes } from '../../api/quizzes'
import { quizzesCatalog } from '../../data/quizzesData'
import type { QuizRequirement } from '../../utils/opportunityRequirements'

interface OpportunityQuizRequirementsProps {
  quizRequirements: QuizRequirement[]
  onChange: (requirements: QuizRequirement[]) => void
}

interface AvailableQuiz {
  id: string
  title: string
  category: string
  passingScore: number
}

export default function OpportunityQuizRequirements({
  quizRequirements,
  onChange,
}: OpportunityQuizRequirementsProps) {
  const [availableQuizzes, setAvailableQuizzes] = useState<AvailableQuiz[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMap, setSelectedMap] = useState<Record<string, AvailableQuiz>>({})

  useEffect(() => {
    fetchQuizzes()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const list = data.map((q) => ({
            id: q.slug || q.id,
            title: q.title,
            category: q.category || 'General',
            passingScore: q.passingScore || 70,
          }))
          setAvailableQuizzes(list)
        } else {
          setAvailableQuizzes(
            quizzesCatalog.map((q) => ({
              id: q.id,
              title: q.title,
              category: q.category || 'General',
              passingScore: q.passingScore || 70,
            }))
          )
        }
      })
      .catch(() => {
        setAvailableQuizzes(
          quizzesCatalog.map((q) => ({
            id: q.id,
            title: q.title,
            category: q.category || 'General',
            passingScore: q.passingScore || 70,
          }))
        )
      })
  }, [])

  const filteredQuizzes = useMemo(() => {
    return availableQuizzes.filter((q) => {
      const isAlreadyAdded = quizRequirements.some((req) => req.quizId === q.id)
      if (isAlreadyAdded) return false
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      return q.title.toLowerCase().includes(query) || q.category.toLowerCase().includes(query)
    })
  }, [availableQuizzes, quizRequirements, searchQuery])

  const toggleSelectQuiz = (quiz: AvailableQuiz) => {
    setSelectedMap((prev) => {
      const next = { ...prev }
      if (next[quiz.id]) {
        delete next[quiz.id]
      } else {
        next[quiz.id] = quiz
      }
      return next
    })
  }

  const handleSelectAllFiltered = () => {
    setSelectedMap((prev) => {
      const next = { ...prev }
      filteredQuizzes.forEach((q) => {
        next[q.id] = q
      })
      return next
    })
  }

  const handleClearSelection = () => {
    setSelectedMap({})
  }

  const handleAddSelected = () => {
    const toAdd = Object.values(selectedMap)
    if (toAdd.length === 0) return

    const newEntries: QuizRequirement[] = toAdd.map((quiz) => ({
      id: quiz.id,
      quizId: quiz.id,
      quizTitle: quiz.title,
      minScore: quiz.passingScore,
    }))

    onChange([...quizRequirements, ...newEntries])
    setSelectedMap({})
    setIsModalOpen(false)
    setSearchQuery('')
  }

  const handleRemoveQuiz = (quizId: string) => {
    onChange(quizRequirements.filter((r) => r.quizId !== quizId))
  }

  const handleScoreChange = (quizId: string, newScore: number) => {
    const clamped = Math.max(1, Math.min(100, isNaN(newScore) ? 70 : newScore))
    onChange(
      quizRequirements.map((r) =>
        r.quizId === quizId ? { ...r, minScore: clamped } : r
      )
    )
  }

  const selectedCount = Object.keys(selectedMap).length

  return (
    <div className="space-y-3 pt-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-gray-700 block">
            Required Assessment Quizzes
          </label>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Candidates must complete these quizzes to apply. Their scores will show on Skill Match for your review.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedMap({})
            setIsModalOpen(true)
          }}
          className="bg-[#1b5e3a] hover:bg-[#14472c] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Quiz</span>
        </button>
      </div>

      {quizRequirements.length === 0 ? (
        <div className="bg-gray-50/70 border border-dashed border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-500">
            No quiz requirements set. Students can apply freely without taking any quizzes.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {quizRequirements.map((req) => (
            <div
              key={req.quizId}
              className="bg-emerald-50/40 border border-emerald-200/70 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-700 text-white shadow-xs">
                  QUIZ
                </span>
                <span className="text-xs font-semibold text-gray-900">{req.quizTitle}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-500 font-medium">Min Passing Score:</span>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={req.minScore}
                      onChange={(e) => handleScoreChange(req.quizId, parseInt(e.target.value, 10))}
                      className="w-16 bg-white border border-gray-200 rounded-lg pl-2 pr-5 py-1 text-xs font-bold text-gray-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-right"
                    />
                    <span className="absolute right-2 text-xs font-bold text-gray-400 pointer-events-none">%</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveQuiz(req.quizId)}
                  className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove quiz requirement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Select Quizzes Modal with Multi-Selection */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 cursor-pointer animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden cursor-default animate-in zoom-in-95 flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Select Assessment Quizzes</h3>
                  <p className="text-xs text-gray-500">Pick one or more quizzes as prerequisite requirements</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Bulk Select Header */}
            <div className="p-4 border-b border-gray-100 space-y-2 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search quiz title or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 px-1 pt-1">
                <span>{filteredQuizzes.length} quizzes available</span>
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
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Quiz List */}
            <div className="overflow-y-auto p-4 space-y-2 flex-1 min-h-[160px]">
              {filteredQuizzes.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  {searchQuery ? 'No matching quizzes found.' : 'All available quizzes have been added.'}
                </div>
              ) : (
                filteredQuizzes.map((quiz) => {
                  const isSelected = Boolean(selectedMap[quiz.id])
                  return (
                    <div
                      key={quiz.id}
                      onClick={() => toggleSelectQuiz(quiz)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-2xs ring-1 ring-emerald-600/20'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 truncate">
                            {quiz.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-semibold">
                            {quiz.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Default passing score: <strong className="text-gray-700">{quiz.passingScore}%</strong>
                        </p>
                      </div>

                      {/* Checkbox */}
                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#1b5e3a] text-white">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-md border border-gray-300 bg-white hover:border-gray-400" />
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
              <span className="text-xs font-semibold text-gray-600">
                {selectedCount > 0 ? `${selectedCount} selected` : 'Click to select quizzes'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl border border-gray-200 bg-white cursor-pointer hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedCount === 0}
                  onClick={handleAddSelected}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#1b5e3a] hover:bg-[#14472c] rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors"
                >
                  {selectedCount <= 1
                    ? `Add ${selectedCount === 1 ? '1 Quiz' : 'Quiz'}`
                    : `Add ${selectedCount} Quizzes`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
