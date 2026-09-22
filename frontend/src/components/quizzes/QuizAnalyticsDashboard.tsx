import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Flag,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  RotateCcw,
  Sparkles,
  X,
  Check,
  Award,
  Layers,
  ChevronDown,
  BookOpen,
} from 'lucide-react'
import {
  getQuizAttempts,
  subscribeQuizAttempts,
  calculateAnalyticsSummary,
  resetQuizAttemptsToSeed,
  type UserQuizAttempt,
  type WeekScoreEvolution,
} from '../../services/quizResultsDb'
import type { QuizCatalogItem } from '../../types/quiz'

interface QuizAnalyticsDashboardProps {
  allQuizzes?: QuizCatalogItem[]
  customQuizzes?: QuizCatalogItem[]
}

// Helper to convert data points into smooth SVG path
function generateSplinePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`

  let path = `M ${points[0].x},${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]
    const next = points[i + 1]
    const mx = (current.x + next.x) / 2
    path += ` C ${mx},${current.y} ${mx},${next.y} ${next.x},${next.y}`
  }
  return path
}

export default function QuizAnalyticsDashboard({
  allQuizzes,
  customQuizzes,
}: QuizAnalyticsDashboardProps) {
  const [attempts, setAttempts] = useState<UserQuizAttempt[]>(() => getQuizAttempts())
  const [selectedQuizFilter, setSelectedQuizFilter] = useState<string>('ALL')
  const [selectedStudent, setSelectedStudent] = useState<UserQuizAttempt | null>(null)
  const [hoveredWeek, setHoveredWeek] = useState<WeekScoreEvolution | null>(null)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetToast, setResetToast] = useState<string | null>(null)
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const filterDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    // 1. Keep in sync with local quiz submissions
    const unsubscribe = subscribeQuizAttempts((updatedAttempts) => {
      setAttempts(updatedAttempts)
    })

    // 2. Also check server endpoint (/api/quiz-results) to sync any new sessions from disk
    fetch('/api/quiz-results')
      .then((res) => res.json())
      .then((serverAttempts) => {
        if (Array.isArray(serverAttempts) && serverAttempts.length > 0) {
          const current = getQuizAttempts()
          const currentIds = new Set(current.map((a) => a.id))
          const newFromServer = serverAttempts.filter((a: any) => a?.id && !currentIds.has(a.id))
          if (newFromServer.length > 0) {
            const merged = [...newFromServer, ...current]
            if (typeof window !== 'undefined') {
              localStorage.setItem('internflow_quiz_results_db', JSON.stringify(merged))
            }
            setAttempts(merged)
          }
        }
      })
      .catch(() => undefined)

    return () => unsubscribe()
  }, [])

  // Comprehensive list of all available quizzes: created custom ones + catalog ones
  const filterQuizList = useMemo(() => {
    // 1. If allQuizzes is provided, strictly use the actual quizzes from catalog & custom list
    if (allQuizzes && allQuizzes.length > 0) {
      return allQuizzes.map((q) => {
        const isCustom =
          Boolean(customQuizzes?.some((c) => c.id === q.id)) || q.id.startsWith('custom-')
        const attemptCount = attempts.filter((a) => a.quizId === q.id).length
        return {
          id: q.id,
          title: q.title,
          isCustom,
          attemptCount,
        }
      })
    }

    // 2. Fallback: only if allQuizzes was not provided, construct from attempts
    const map = new Map<
      string,
      { id: string; title: string; isCustom: boolean; attemptCount: number }
    >()
    attempts.forEach((a) => {
      if (!map.has(a.quizId)) {
        const isCustom =
          a.quizId.startsWith('custom-') ||
          Boolean(customQuizzes?.some((c) => c.id === a.quizId))
        const attemptCount = attempts.filter((att) => att.quizId === a.quizId).length
        map.set(a.quizId, {
          id: a.quizId,
          title: a.quizTitle || a.quizId,
          isCustom,
          attemptCount,
        })
      }
    })

    return Array.from(map.values())
  }, [allQuizzes, customQuizzes, attempts])

  // Current selected quiz metadata
  const currentFilteredQuiz = useMemo(() => {
    if (selectedQuizFilter === 'ALL') return null
    return filterQuizList.find((q) => q.id === selectedQuizFilter) || null
  }, [filterQuizList, selectedQuizFilter])

  // Selected quiz display label
  const selectedQuizLabel = useMemo(() => {
    if (selectedQuizFilter === 'ALL') {
      return `All Assessments (${attempts.length} total records)`
    }
    const found = filterQuizList.find((q) => q.id === selectedQuizFilter)
    return found ? `${found.title} (${found.attemptCount} submissions)` : selectedQuizFilter
  }, [selectedQuizFilter, attempts.length, filterQuizList])

  // Dynamic calculations from database
  const summary = useMemo(
    () => calculateAnalyticsSummary(attempts, selectedQuizFilter),
    [attempts, selectedQuizFilter]
  )

  // Map week evolution to SVG coordinates (0-100% -> Y 200 to 20)
  const chartCoordinates = useMemo(() => {
    return summary.weekEvolution.map((w, idx) => {
      const x = 40 + idx * 60
      const toY = (val: number) => 200 - (Math.max(0, Math.min(100, val)) / 100) * 180
      return {
        week: w,
        x,
        topY: toY(w.top10),
        avgY: toY(w.avg),
        bottomY: toY(w.bottom10),
      }
    })
  }, [summary.weekEvolution])

  const topPath = useMemo(
    () => generateSplinePath(chartCoordinates.map((c) => ({ x: c.x, y: c.topY }))),
    [chartCoordinates]
  )

  const avgPath = useMemo(
    () => generateSplinePath(chartCoordinates.map((c) => ({ x: c.x, y: c.avgY }))),
    [chartCoordinates]
  )

  const bottomPath = useMemo(
    () => generateSplinePath(chartCoordinates.map((c) => ({ x: c.x, y: c.bottomY }))),
    [chartCoordinates]
  )

  const avgAreaPath = useMemo(() => {
    if (chartCoordinates.length === 0) return ''
    const startX = chartCoordinates[0].x
    const endX = chartCoordinates[chartCoordinates.length - 1].x
    return `${avgPath} L ${endX},200 L ${startX},200 Z`
  }, [avgPath, chartCoordinates])

  const topAreaPath = useMemo(() => {
    if (chartCoordinates.length === 0) return ''
    const startX = chartCoordinates[0].x
    const endX = chartCoordinates[chartCoordinates.length - 1].x
    return `${topPath} L ${endX},200 L ${startX},200 Z`
  }, [topPath, chartCoordinates])

  const handleConfirmReset = () => {
    resetQuizAttemptsToSeed()
    setShowResetModal(false)
    setResetToast('Team benchmark data successfully restored.')
    setTimeout(() => {
      setResetToast(null)
    }, 3500)
  }

  const customQuizOptions = filterQuizList.filter((q) => q.isCustom)
  const catalogQuizOptions = filterQuizList.filter((q) => !q.isCustom)

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Controls Bar: Filter by Quiz & Reset Seed */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#e6ebe8] shadow-xs">
        <div className="flex items-center gap-2 flex-wrap" ref={filterDropdownRef}>
          <Filter className="h-4 w-4 text-[#5d6b64]" />
          <span className="text-xs font-semibold text-[#14211b]">Filter by Assessment:</span>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
              className={`flex items-center justify-between gap-2.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all cursor-pointer shadow-2xs ${
                isFilterDropdownOpen
                  ? 'border-[#1e3a2c] bg-white ring-2 ring-[#1e3a2c]/10 text-[#14211b]'
                  : 'border-[#e6ebe8] bg-[#f5f7f6] hover:bg-white text-[#14211b]'
              }`}
            >
              <span className="font-semibold">{selectedQuizLabel}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-[#71817a] transition-transform duration-200 ${
                  isFilterDropdownOpen ? 'rotate-180 text-[#1e3a2c]' : ''
                }`}
              />
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 z-50 w-72 sm:w-84 rounded-2xl border border-[#e6ebe8] bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150 max-h-72 overflow-y-auto hardware-scroll">
                {/* All Assessments Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedQuizFilter('ALL')
                    setIsFilterDropdownOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl font-medium transition-colors cursor-pointer flex items-center justify-between ${
                    selectedQuizFilter === 'ALL'
                      ? 'bg-[#e9f3ee] text-[#164c3a] font-semibold'
                      : 'text-[#14211b] hover:bg-[#f5f7f6]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-[#164c3a]" />
                    <span>All Assessments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#f0f4f1] text-[#5d6b64]">
                      {attempts.length} records
                    </span>
                    {selectedQuizFilter === 'ALL' && (
                      <Check className="h-3.5 w-3.5 text-[#164c3a]" />
                    )}
                  </div>
                </button>

                {/* Custom Created Quizzes */}
                {customQuizOptions.length > 0 && (
                  <div className="pt-2 border-t border-[#f0f4f1] mt-1.5">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-[#71817a] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-[#ff5500]" />
                      Custom Created Assessments
                    </div>
                    {customQuizOptions.map((opt) => {
                      const isSelected = selectedQuizFilter === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSelectedQuizFilter(opt.id)
                            setIsFilterDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-xl font-medium transition-colors cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#e9f3ee] text-[#164c3a] font-semibold'
                              : 'text-[#14211b] hover:bg-[#f5f7f6]'
                          }`}
                        >
                          <span className="truncate pr-2">{opt.title}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-[#71817a]">
                              {opt.attemptCount} {opt.attemptCount === 1 ? 'sub' : 'subs'}
                            </span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-[#164c3a]" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Standard Catalog Quizzes */}
                {catalogQuizOptions.length > 0 && (
                  <div className="pt-2 border-t border-[#f0f4f1] mt-1.5">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-[#71817a] uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3 text-[#164c3a]" />
                      Standard Catalog Assessments
                    </div>
                    {catalogQuizOptions.map((opt) => {
                      const isSelected = selectedQuizFilter === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSelectedQuizFilter(opt.id)
                            setIsFilterDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-xl font-medium transition-colors cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#e9f3ee] text-[#164c3a] font-semibold'
                              : 'text-[#14211b] hover:bg-[#f5f7f6]'
                          }`}
                        >
                          <span className="truncate pr-2">{opt.title}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-[#71817a]">
                              {opt.attemptCount} {opt.attemptCount === 1 ? 'sub' : 'subs'}
                            </span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-[#164c3a]" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {currentFilteredQuiz && (
            <span
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold border shadow-2xs ${
                currentFilteredQuiz.isCustom
                  ? 'bg-[#fff2ea] text-[#ff5500] border-[#ffd8c4]'
                  : 'bg-[#e9f3ee] text-[#164c3a] border-[#cde0d5]'
              }`}
            >
              {currentFilteredQuiz.isCustom && <Sparkles className="h-3 w-3 text-[#ff5500]" />}
              {currentFilteredQuiz.isCustom ? 'Custom Assessment' : 'Catalog Assessment'}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowResetModal(true)}
          className="group inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-gray-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer"
          title="Restore team benchmark dataset"
        >
          <RotateCcw className="h-3.5 w-3.5 text-gray-400 group-hover:text-emerald-700 group-hover:-rotate-90 transition-transform duration-300" />
          <span>Reset Benchmark</span>
        </button>
      </div>

      {/* When a custom quiz is selected and has 0 submissions yet */}
      {selectedQuizFilter !== 'ALL' && summary.totalAssessments === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 mb-3.5">
            <Sparkles className="h-7 w-7 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            No Submissions Yet for "{currentFilteredQuiz?.title || 'this assessment'}"
          </h3>
          <p className="mt-1.5 text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            This quiz is active in the catalog. As soon as a student or team member takes this quiz,
            their performance score, completion duration, error-prone topics, and proctoring logs will appear here automatically.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedQuizFilter('ALL')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black transition-colors cursor-pointer"
            >
              <Layers className="h-3.5 w-3.5" />
              View All Assessments
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Students Assessed */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-all hover:shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                Students Assessed
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-gray-900 font-sans">
                  {summary.totalAssessments}
                </span>
              </div>
              <p className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {summary.uniqueStudents} unique {summary.uniqueStudents === 1 ? 'student' : 'students'}
              </p>
            </div>

            {/* KPI 2: Avg Score */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-all hover:shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                Avg. Score
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-gray-900 font-sans">
                  {summary.avgScore}%
                </span>
              </div>
              <p className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {summary.avgScore >= 70 ? 'Target achieved' : 'Needs practice'}
              </p>
            </div>

            {/* KPI 3: Pass Rate */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-all hover:shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                Pass Rate
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-gray-900 font-sans">
                  {summary.passRate}%
                </span>
              </div>
              <p
                className={`mt-2 text-xs font-semibold flex items-center gap-1 ${
                  summary.passRate >= 65 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {summary.passRate >= 65 ? (
                  <>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    Passing threshold met
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3.5 w-3.5" />
                    Below target threshold
                  </>
                )}
              </p>
            </div>

            {/* KPI 4: Avg Completion */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-all hover:shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                Avg. Completion
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-gray-900 font-sans">
                  {summary.avgDurationFormatted}
                </span>
              </div>
              <p className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Recorded session duration
              </p>
            </div>
          </div>

          {/* Middle Row: Score Evolution Chart & Highest Error-Rate Topics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Score Evolution Chart */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Score Evolution</h2>
                  <p className="text-xs text-gray-500">
                    {selectedQuizFilter === 'ALL'
                      ? 'Cohort percentiles across weeks (W1–W8)'
                      : `Weekly score performance for "${currentFilteredQuiz?.title || 'selected quiz'}"`}
                  </p>
                </div>
                {/* Chart Legend */}
                <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#1e3a2c]" />
                    <span>Top 10%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />
                    <span>Avg</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full border border-gray-400 border-dashed" />
                    <span>Bottom 10%</span>
                  </div>
                </div>
              </div>

              {/* SVG Line & Area Chart */}
              <div className="mt-6 mb-2 relative">
                <svg
                  viewBox="0 0 500 220"
                  className="w-full h-52 overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="topGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1e3a2c" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#1e3a2c" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines and Y-Axis Labels */}
                  {[
                    { val: 100, y: 20 },
                    { val: 75, y: 65 },
                    { val: 50, y: 110 },
                    { val: 25, y: 155 },
                    { val: 0, y: 200 },
                  ].map((grid) => (
                    <g key={grid.val}>
                      <line
                        x1="30"
                        y1={grid.y}
                        x2="480"
                        y2={grid.y}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                      <text
                        x="22"
                        y={grid.y + 4}
                        textAnchor="end"
                        className="text-[10px] fill-gray-400 font-sans"
                      >
                        {grid.val}
                      </text>
                    </g>
                  ))}

                  {/* Area under Average Line */}
                  {avgAreaPath && <path d={avgAreaPath} fill="url(#avgGrad)" />}

                  {/* Area under Top Line */}
                  {topAreaPath && <path d={topAreaPath} fill="url(#topGrad)" />}

                  {/* Bottom Curve */}
                  {bottomPath && (
                    <path
                      d={bottomPath}
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  )}

                  {/* Top Curve */}
                  {topPath && (
                    <path
                      d={topPath}
                      fill="none"
                      stroke="#1e3a2c"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Avg Curve */}
                  {avgPath && (
                    <path
                      d={avgPath}
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2.75"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Interactive Points on Curves */}
                  {chartCoordinates.map((pt) => (
                    <g
                      key={pt.week.weekLabel}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredWeek(pt.week)}
                      onMouseLeave={() => setHoveredWeek(null)}
                    >
                      <circle cx={pt.x} cy={pt.avgY} r="4" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx={pt.x} cy={pt.topY} r="3" fill="#1e3a2c" />
                    </g>
                  ))}

                  {/* X-Axis Labels */}
                  {chartCoordinates.map((pt) => (
                    <text
                      key={pt.week.weekLabel}
                      x={pt.x}
                      y="218"
                      textAnchor="middle"
                      className="text-[11px] font-semibold fill-gray-500 font-sans"
                    >
                      {pt.week.weekLabel}
                    </text>
                  ))}
                </svg>

                {/* Hover Tooltip */}
                {hoveredWeek && (
                  <div className="absolute top-2 right-4 rounded-xl border border-gray-200 bg-white/95 px-3 py-2 text-xs shadow-md backdrop-blur-xs">
                    <p className="font-bold text-gray-900">{hoveredWeek.weekLabel} Cohort</p>
                    <div className="mt-1 space-y-0.5 text-[11px]">
                      <p className="text-emerald-700">Top 10%: {hoveredWeek.top10}%</p>
                      <p className="text-orange-600">Cohort Avg: {hoveredWeek.avg}%</p>
                      <p className="text-gray-500">Bottom 10%: {hoveredWeek.bottom10}%</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Highest Error-Rate Topics */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="pb-2 border-b border-gray-100 mb-4">
                  <h2 className="text-base font-bold text-gray-900">Highest Error-Rate Topics</h2>
                  <p className="text-xs text-gray-500">
                    {selectedQuizFilter === 'ALL'
                      ? 'Concepts with lowest correct answers'
                      : `Question topics missed in this assessment`}
                  </p>
                </div>

                {summary.highestErrorTopics.length === 0 ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-center my-4">
                    <Award className="h-6 w-6 text-emerald-600 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-emerald-800">100% Accuracy</p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">
                      No errors recorded across tested questions in this assessment!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {summary.highestErrorTopics.slice(0, 6).map((item) => {
                      const isHighSeverity = item.errorRate >= 60
                      return (
                        <div key={item.topic} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-gray-800 truncate pr-2">
                              {item.topic}
                            </span>
                            <span
                              className={`font-bold font-sans shrink-0 ${
                                isHighSeverity ? 'text-rose-600' : 'text-gray-600'
                              }`}
                            >
                              {item.errorRate}%
                            </span>
                          </div>
                          {/* Progress Bar */}
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isHighSeverity ? 'bg-rose-500' : 'bg-orange-400'
                              }`}
                              style={{ width: `${item.errorRate}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>Aggregated from missed questions</span>
                <span className="font-medium text-gray-500">Live sync</span>
              </div>
            </div>
          </div>

          {/* Bottom: Recent Student Results Table */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-gray-900">Recent Student Results</h2>
                <p className="text-xs text-gray-500">
                  {selectedQuizFilter === 'ALL'
                    ? `Live submission log recorded in platform database (${summary.recentAttempts.length} entries)`
                    : `Submissions for "${currentFilteredQuiz?.title || 'Selected Assessment'}" (${summary.recentAttempts.length} entries)`}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                <Sparkles className="h-3.5 w-3.5" />
                Live Sync Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Assessment</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {summary.recentAttempts.map((res) => {
                    const statusStyles = {
                      PASSED: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
                      BORDERLINE: 'bg-amber-50 text-amber-700 border-amber-200/70',
                      FAILED: 'bg-rose-50 text-rose-700 border-rose-200/70',
                    }

                    const isCustomAttempt =
                      res.quizId.startsWith('custom-') ||
                      Boolean(customQuizzes?.some((c) => c.id === res.quizId))

                    return (
                      <tr
                        key={res.id}
                        onClick={() => setSelectedStudent(res)}
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4 font-semibold text-gray-900">
                          <div>
                            <p>{res.userName}</p>
                            {res.userEmail && (
                              <p className="text-[11px] font-normal text-gray-400">{res.userEmail}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-600 font-medium">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{res.quizTitle}</span>
                            {isCustomAttempt && (
                              <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200/80">
                                <Sparkles className="h-2.5 w-2.5 text-purple-500" />
                                CUSTOM
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-900 font-sans">
                          {res.percentage}% ({res.score}/{res.totalQuestions})
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-500 font-medium font-sans">
                          {res.timeSpentFormatted}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${statusStyles[res.status]}`}
                          >
                            {res.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {res.isFlagged && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 tracking-wide">
                              <Flag className="h-3.5 w-3.5 fill-rose-600" />
                              FLAGGED
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal for Selected Student */}
      {selectedStudent &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setSelectedStudent(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 cursor-default"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div>
                  <h4 className="text-base font-bold text-gray-900">{selectedStudent.userName}</h4>
                  <p className="text-xs text-gray-500">{selectedStudent.quizTitle || 'Assessment Result'}</p>
                </div>
                <span
                  className={`rounded-md border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                    selectedStudent.status === 'PASSED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : selectedStudent.status === 'BORDERLINE'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {selectedStudent.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Score</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5 font-sans">
                    {selectedStudent.percentage}%
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {selectedStudent.score} of {selectedStudent.totalQuestions} correct
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Duration</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5 font-sans">
                    {selectedStudent.timeSpentFormatted}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {new Date(selectedStudent.completedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {selectedStudent.missedTopics && selectedStudent.missedTopics.length > 0 && (
                <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-xs">
                  <p className="font-semibold text-gray-800 mb-1.5">Topics with Errors:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent.missedTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 border border-rose-200/80"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedStudent.isFlagged && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-900">
                  <p className="font-bold flex items-center gap-1.5 text-rose-700">
                    <Flag className="h-3.5 w-3.5 fill-rose-600" />
                    Anti-Cheat Proctoring Flag
                  </p>
                  <p className="mt-1 text-rose-700/90">{selectedStudent.flagReason || 'Proctoring security anomaly flagged.'}</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* In-App Confirmation Modal for Reset Benchmark */}
      {showResetModal &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setShowResetModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 cursor-default"
            >
              {/* Top Close Button */}
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="absolute top-5 right-5 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Icon & Title */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 shrink-0">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Reset Benchmark Data</h3>
                  <p className="text-xs text-gray-500">Restore default team performance baseline</p>
                </div>
              </div>

              {/* Details Box */}
              <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50/80 p-3.5 text-xs text-gray-600 leading-relaxed">
                This action will reset the 8-week assessment performance metrics and restore the default baseline for all 8 members of your team:
                <span className="block font-semibold text-gray-800 mt-1">
                  Daniel Botan, Daniel Chigaianu, Daniel Chitanu, Gicu Caraman, Mihail Goncearov, Sergiu Negara, Valeriu Bulgaru, and Veaceslav Nagorneac.
                </span>
              </div>

              <p className="text-xs text-gray-500 mb-6">
                Are you sure you want to proceed with resetting the benchmark data?
              </p>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1e3a2c] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#162d22] transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Floating Toast Notification */}
      {resetToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-3">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{resetToast}</span>
        </div>
      )}
    </div>
  )
}
