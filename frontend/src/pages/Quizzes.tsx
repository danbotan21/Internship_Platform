import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  SquarePen,
  Trash2,
  X,
  Check,
  LayoutGrid,
  BarChart2,
  Search,
  SlidersHorizontal,
  BookOpen,
  ShieldCheck,
  Award,
  RotateCcw,
  SearchX,
} from 'lucide-react'
import { quizzesCatalog } from '../data/quizzesData'
import QuizCard from '../components/quizzes/QuizCard'
import QuizDetail from '../components/quizzes/QuizDetail'
import QuizActive from '../components/quizzes/QuizActive'
import QuestionBuilder from '../components/quizzes/QuestionBuilder'
import QuizAnalyticsDashboard from '../components/quizzes/QuizAnalyticsDashboard'
import { useAuth } from '../hooks/authContext'
import type { QuizCatalogItem } from '../types/quiz'
import {
  fetchQuizzes,
  fetchQuizByIdOrSlug,
  createCustomQuiz,
  updateCustomQuiz,
  deleteCustomQuiz,
  type QuizDto,
  type QuizDetailDto,
  type CreateQuizPayload,
} from '../api/quizzes'

const CUSTOM_QUIZZES_KEY = 'internflow_custom_quizzes'

const DEFAULT_CUSTOM_QUESTION = {
  id: 'q-custom-default-1',
  numberLabel: 'Q01',
  category: 'TYPESCRIPT',
  question: 'Which TypeScript utility type constructs a type with all properties of T set to optional?',
  hint: 'Think about the utility keyword that makes every property non-mandatory.',
  correctOptionId: 'a',
  options: [
    { id: 'a', label: 'A' as const, text: 'Partial<T>' },
    { id: 'b', label: 'B' as const, text: 'Required<T>' },
    { id: 'c', label: 'C' as const, text: 'Readonly<T>' },
    { id: 'd', label: 'D' as const, text: 'Pick<T, K>' },
  ],
}

function loadSavedCustomQuizzes(): QuizCatalogItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CUSTOM_QUIZZES_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as QuizCatalogItem[]
      return parsed.map((item) => {
        if (!item.questions || item.questions.length === 0) {
          return { ...item, questions: [DEFAULT_CUSTOM_QUESTION] }
        }
        return item
      })
    }
  } catch (err) {
    console.warn('Failed to load custom quizzes from localStorage:', err)
  }
  return []
}

function mapDtoToCatalogItem(dto: QuizDto | QuizDetailDto): QuizCatalogItem {
  const isCustom = dto.isCustom
  const catalogMatch = quizzesCatalog.find((c) => c.id === dto.slug || c.id === dto.id)
  const theme = isCustom
    ? { iconBg: 'bg-emerald-50', iconBorder: 'border-emerald-200/60', iconColor: 'text-emerald-700' }
    : (catalogMatch?.theme ?? {
        iconBg: 'bg-emerald-50',
        iconBorder: 'border-emerald-200/60',
        iconColor: 'text-emerald-700',
      })

  let questions =
    'questions' in dto && Array.isArray((dto as QuizDetailDto).questions) && (dto as QuizDetailDto).questions.length > 0
      ? (dto as QuizDetailDto).questions.map((q) => ({
          id: q.id,
          numberLabel: q.numberLabel,
          category: q.category,
          question: q.questionText,
          hint: q.hint,
          correctOptionId: q.correctOptionId,
          options: q.options.map((opt) => ({
            id: opt.id,
            label: opt.label as any,
            text: opt.text,
          })),
        }))
      : catalogMatch?.questions

  if ((!questions || questions.length === 0) && isCustom) {
    const saved = loadSavedCustomQuizzes()
    const match = saved.find(
      (s) => s.id === dto.id || s.id === dto.slug || s.title.toLowerCase() === dto.title.toLowerCase()
    )
    if (match?.questions && match.questions.length > 0) {
      questions = match.questions
    } else {
      questions = [DEFAULT_CUSTOM_QUESTION]
    }
  }

  return {
    id: dto.slug || dto.id,
    title: dto.title,
    description: dto.description,
    category: dto.category,
    questionCount: dto.questionCount || (questions ? questions.length : 1),
    durationMinutes: dto.durationMinutes,
    passingScore: dto.passingScore,
    difficulty: dto.difficulty,
    theme,
    questions,
  }
}

export default function Quizzes() {
  const { session } = useAuth()
  const role = session?.role ?? 'Student'
  const isMentor = role === 'Mentor' || role === 'Admin' || role === 'Company'

  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo')
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null)
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)
  const [activeTab, setActiveTab] = useState<'catalog' | 'analytics'>('catalog')
  const [editingQuiz, setEditingQuiz] = useState<QuizCatalogItem | null>(null)

  const [apiQuizzes, setApiQuizzes] = useState<QuizDto[]>([])
  const [loadedQuizDetail, setLoadedQuizDetail] = useState<QuizCatalogItem | null>(null)
  const [, setIsLoadingQuizzes] = useState(false)

  // Custom Quizzes persisted in localStorage
  const [customQuizzes, setCustomQuizzes] = useState<QuizCatalogItem[]>(() =>
    loadSavedCustomQuizzes()
  )

  const loadBackendQuizzes = useCallback(() => {
    setIsLoadingQuizzes(true)
    fetchQuizzes()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setApiQuizzes(data)
          const custom = data.filter((q) => q.isCustom).map(mapDtoToCatalogItem)
          if (custom.length > 0) {
            setCustomQuizzes((prev) => {
              const merged = custom.map((c) => {
                const existing = prev.find(
                  (p) => p.id === c.id || (p as any).slug === c.id || p.title === c.title
                )
                if (
                  existing?.questions &&
                  existing.questions.length > 0 &&
                  (!c.questions || c.questions.length === 0)
                ) {
                  return { ...c, questions: existing.questions }
                }
                return c
              })
              prev.forEach((p) => {
                if (!merged.some((m) => m.id === p.id || m.title === p.title)) {
                  merged.push(p)
                }
              })
              if (typeof window !== 'undefined') {
                localStorage.setItem(CUSTOM_QUIZZES_KEY, JSON.stringify(merged))
              }
              return merged
            })
          }
        }
      })
      .catch((err) => {
        console.warn('Backend quizzes fetch failed, using local catalog:', err)
      })
      .finally(() => {
        setIsLoadingQuizzes(false)
      })
  }, [])

  useEffect(() => {
    loadBackendQuizzes()
  }, [loadBackendQuizzes])

  const selectedQuizId = searchParams.get('quiz')
  const status = searchParams.get('status') // e.g. 'active' or null
  const view = searchParams.get('view')

  const allQuizzes = useMemo(() => {
    if (apiQuizzes.length > 0) {
      return apiQuizzes.map((dto) => {
        const item = mapDtoToCatalogItem(dto)
        if (!item.questions || item.questions.length === 0) {
          const fromCustom = customQuizzes.find(
            (c) => c.id === item.id || (dto.slug && c.id === dto.slug) || c.title === item.title
          )
          if (fromCustom?.questions && fromCustom.questions.length > 0) {
            return { ...item, questions: fromCustom.questions }
          }
        }
        return item
      })
    }
    return [...customQuizzes, ...quizzesCatalog]
  }, [apiQuizzes, customQuizzes])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All')

  const filteredQuizzes = useMemo(() => {
    return allQuizzes.filter((quiz) => {
      const isCustom = customQuizzes.some((c) => c.id === quiz.id)
      if (filterDifficulty === 'CUSTOM' && !isCustom) return false
      if (
        filterDifficulty !== 'All' &&
        filterDifficulty !== 'CUSTOM' &&
        quiz.difficulty !== filterDifficulty
      ) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        const matchTitle = quiz.title.toLowerCase().includes(q)
        const matchDesc = quiz.description.toLowerCase().includes(q)
        const matchCategory = quiz.category?.toLowerCase().includes(q)
        if (!matchTitle && !matchDesc && !matchCategory) return false
      }
      return true
    })
  }, [allQuizzes, customQuizzes, filterDifficulty, searchQuery])

  const resetFilters = () => {
    setSearchQuery('')
    setFilterDifficulty('All')
  }

  const selectedQuiz = useMemo(() => {
    if (!selectedQuizId) return null
    if (
      loadedQuizDetail &&
      (loadedQuizDetail.id === selectedQuizId ||
        (loadedQuizDetail as any).slug === selectedQuizId ||
        apiQuizzes.find((a) => a.id === selectedQuizId)?.slug === loadedQuizDetail.id)
    ) {
      return loadedQuizDetail
    }
    const found = allQuizzes.find((q) => q.id === selectedQuizId)
    if (found) {
      if (!found.questions || found.questions.length === 0) {
        const fromCustom = customQuizzes.find(
          (c) => c.id === selectedQuizId || c.title === found.title
        )
        if (fromCustom?.questions && fromCustom.questions.length > 0) {
          return { ...found, questions: fromCustom.questions }
        }
      }
      return found
    }
    return null
  }, [selectedQuizId, loadedQuizDetail, allQuizzes, customQuizzes, apiQuizzes])

  useEffect(() => {
    if (!selectedQuizId) {
      setLoadedQuizDetail(null)
      return
    }
    const current = allQuizzes.find((q) => q.id === selectedQuizId)
    if (current && current.questions && current.questions.length > 0) {
      setLoadedQuizDetail(current)
      return
    }

    fetchQuizByIdOrSlug(selectedQuizId)
      .then((detail) => {
        if (detail) {
          setLoadedQuizDetail(mapDtoToCatalogItem(detail))
        }
      })
      .catch((err) => {
        console.warn('Failed to load quiz detail with questions:', err)
      })
  }, [selectedQuizId, allQuizzes])

  const cleanUpStreams = () => {
    if (recordingStream) {
      recordingStream.getTracks().forEach((t) => t.stop())
      setRecordingStream(null)
    }
    if (webcamStream) {
      webcamStream.getTracks().forEach((t) => t.stop())
      setWebcamStream(null)
    }
  }

  // Detecție reload conform Navigation Timing API
  const checkIsReload = () => {
    if (typeof performance === 'undefined') return false
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    if (navEntries && navEntries.length > 0) {
      return navEntries[0].type === 'reload'
    }
    // Fallback pentru browsere mai vechi
    return (
      (window.performance as unknown as { navigation?: { type?: number } })?.navigation?.type === 1
    )
  }

  const cleanUpStreamsAndSession = () => {
    cleanUpStreams()
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('quiz_active')
      sessionStorage.removeItem('proctoring_incident')
      sessionStorage.removeItem('quiz_session_active')
      sessionStorage.removeItem('quiz_session_id')
      sessionStorage.removeItem('quiz_session_started_at')
      sessionStorage.removeItem('quiz_session_answers')
      sessionStorage.removeItem('quiz_session_violations')
    }
  }

  const handleSelectQuiz = (quiz: QuizCatalogItem) => {
    setSearchParams({ quiz: quiz.id })
  }

  const handleBackToCatalog = () => {
    cleanUpStreamsAndSession()
    setEditingQuiz(null)
    if (returnTo) {
      navigate(returnTo)
    } else {
      setSearchParams({})
    }
  }

  const handleEditQuiz = (e: React.MouseEvent, quiz: QuizCatalogItem) => {
    e.stopPropagation()
    setEditingQuiz(quiz)
    setSearchParams({ view: 'custom' })
  }

  const handleSaveCustomQuiz = async (newQuiz: QuizCatalogItem) => {
    const exists = customQuizzes.some((q) => q.id === newQuiz.id)
    const updated = exists
      ? customQuizzes.map((q) => (q.id === newQuiz.id ? newQuiz : q))
      : [newQuiz, ...customQuizzes.filter((q) => q.id !== newQuiz.id)]
    setCustomQuizzes(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOM_QUIZZES_KEY, JSON.stringify(updated))
    }
    setEditingQuiz(null)
    handleBackToCatalog()

    try {
      const payload: CreateQuizPayload = {
        title: newQuiz.title,
        description: newQuiz.description,
        category: newQuiz.category || 'General',
        durationMinutes: newQuiz.durationMinutes,
        passingScore: newQuiz.passingScore,
        difficulty: newQuiz.difficulty,
        questions: (newQuiz.questions || []).map((q) => ({
          numberLabel: q.numberLabel,
          category: q.category,
          questionText: q.question,
          hint: q.hint,
          correctOptionId: q.correctOptionId,
          options: q.options.map((opt) => ({
            id: opt.id,
            label: opt.label,
            text: opt.text,
          })),
        })),
      }

      const existingInApi = apiQuizzes.find((q) => q.id === newQuiz.id || q.slug === newQuiz.id)
      if (existingInApi && existingInApi.isCustom) {
        await updateCustomQuiz(existingInApi.id, payload)
      } else {
        await createCustomQuiz(payload)
      }
      loadBackendQuizzes()
    } catch (err) {
      console.warn('Failed to persist custom quiz to PostgreSQL backend:', err)
    }
  }

  // Delete modal state
  const [quizToDelete, setQuizToDelete] = useState<QuizCatalogItem | null>(null)
  const [deletedToast, setDeletedToast] = useState<string | null>(null)

  const promptDeleteQuiz = (e: React.MouseEvent, quiz: QuizCatalogItem) => {
    e.stopPropagation()
    setQuizToDelete(quiz)
  }

  const confirmDeleteQuiz = async () => {
    if (!quizToDelete) return
    const id = quizToDelete.id
    const title = quizToDelete.title
    const updated = customQuizzes.filter((q) => q.id !== id)
    setCustomQuizzes(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOM_QUIZZES_KEY, JSON.stringify(updated))
    }
    setQuizToDelete(null)
    setDeletedToast(`"${title}" was deleted.`)
    setTimeout(() => {
      setDeletedToast((curr) => (curr === `"${title}" was deleted.` ? null : curr))
    }, 3000)

    try {
      const existingInApi = apiQuizzes.find((q) => q.id === id || q.slug === id)
      if (existingInApi && existingInApi.isCustom) {
        await deleteCustomQuiz(existingInApi.id)
        loadBackendQuizzes()
      }
    } catch (err) {
      console.warn('Failed to delete custom quiz from PostgreSQL backend:', err)
    }
  }

  const handleBeginAssessment = (streams: {
    recordingStream: MediaStream
    webcamStream: MediaStream | null
  }) => {
    setRecordingStream(streams.recordingStream)
    setWebcamStream(streams.webcamStream)
    if (selectedQuiz) {
      const nextParams: Record<string, string> = { quiz: selectedQuiz.id, status: 'active' }
      if (returnTo) nextParams.returnTo = returnTo
      setSearchParams(nextParams)
    }
  }

  const handleFinishAssessment = () => {
    cleanUpStreamsAndSession()
    if (returnTo) {
      navigate(returnTo)
    } else {
      setSearchParams({})
    }
  }

  // Verificare dacă sesiunea anterioară a fost marcată activă
  const wasQuizActive =
    typeof window !== 'undefined' &&
    (sessionStorage.getItem('quiz_active') === 'true' ||
      sessionStorage.getItem('quiz_session_active') === 'true')

  // Un flux live transmis în memorie garantează că este un start legitim dinamic (nu un reload de pagină)
  const hasLiveRecordingStream = Boolean(
    recordingStream && recordingStream.getVideoTracks().some((t) => t.readyState === 'live')
  )

  const isReload = checkIsReload()

  // Reload violation este ADEVĂRAT NUMAI dacă:
  // 1. Nu avem stream live în memorie (a fost distrus de reload)
  // 2. Sesiunea fusese anterior pornită și activă (quiz_active = true)
  // 3. Documentul a fost reîncărcat (isReload)
  const isReloadViolation = !hasLiveRecordingStream && wasQuizActive && isReload

  // 1. Active Quiz Taking Screen
  if (selectedQuiz && status === 'active') {
    if (!hasLiveRecordingStream && !wasQuizActive) {
      setSearchParams({ quiz: selectedQuiz.id })
      return null
    }

    return (
      <QuizActive
        quiz={selectedQuiz}
        recordingStream={recordingStream}
        webcamStream={webcamStream}
        isReloadViolation={isReloadViolation}
        onFinish={handleFinishAssessment}
      />
    )
  }

  // 2. Custom Question Builder Screen
  if (view === 'custom') {
    if (!isMentor) {
      handleBackToCatalog()
      return null
    }

    return (
      <QuestionBuilder
        initialQuiz={editingQuiz}
        onCancel={handleBackToCatalog}
        onSaveQuiz={handleSaveCustomQuiz}
      />
    )
  }

  // 3. Quiz Pre-Start Detail Screen
  if (selectedQuiz) {
    return (
      <QuizDetail
        quiz={selectedQuiz}
        onBack={handleBackToCatalog}
        onBegin={handleBeginAssessment}
      />
    )
  }

  // 4. Quizzes Screen (Catalog or Performance Analytics)
  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0c382b]">
            {isMentor
              ? activeTab === 'catalog'
                ? 'Custom Assessments & Quizzes'
                : 'Performance Analytics'
              : 'Skill Assessments'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isMentor
              ? activeTab === 'catalog'
                ? `${allQuizzes.length} assessments available — author, configure, and monitor custom quizzes`
                : 'Real-time cohort performance, score evolution, pass rates, and error-prone topics'
              : `${allQuizzes.length} quizzes available — complete your assigned evaluations`}
          </p>
        </div>

        {isMentor && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Tab Switcher */}
            <div className="flex items-center rounded-xl bg-[#f0f4f1] p-1 border border-[#e6ebe8] shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'catalog'
                    ? 'bg-white text-[#1e3a2c] shadow-xs'
                    : 'text-[#5d6b64] hover:text-[#14211b]'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Assessments Catalog
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-white text-[#1e3a2c] shadow-xs'
                    : 'text-[#5d6b64] hover:text-[#14211b]'
                }`}
              >
                <BarChart2 className="h-3.5 w-3.5" />
                Performance Analytics
              </button>
            </div>

            {activeTab === 'catalog' && (
              <button
                type="button"
                onClick={() => {
                  setEditingQuiz(null)
                  setSearchParams({ view: 'custom' })
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#ff5500] hover:bg-[#e64d00] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
              >
                <SquarePen className="h-3.5 w-3.5" />
                Create Quiz
              </button>
            )}
          </div>
        )}
      </div>

      {/* Overview Stat Cards */}
      {!(isMentor && activeTab === 'analytics') && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#e6ebe8] p-4 shadow-xs flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-[#e9f3ee] text-[#164c3a] border border-[#cde0d5] flex items-center justify-center shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#14211b]">{allQuizzes.length} Quizzes</div>
              <div className="text-xs text-[#5d6b64] font-medium">Curated Technical Tracks</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e6ebe8] p-4 shadow-xs flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-[#edf3ef] text-[#1e3a2c] border border-[#d8e2dc] flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#14211b]">AI Proctoring</div>
              <div className="text-xs text-[#5d6b64] font-medium">Anti-Cheat Live Verification</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e6ebe8] p-4 shadow-xs flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-[#e9f3ee] text-[#164c3a] border border-[#cde0d5] flex items-center justify-center shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#14211b]">70% Pass Mark</div>
              <div className="text-xs text-[#5d6b64] font-medium">Skill Verification Standard</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters Toolbar */}
      {!(isMentor && activeTab === 'analytics') && (
        <div className="bg-white rounded-2xl border border-[#e6ebe8] p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full bg-[#f5f7f6] rounded-xl border border-[#e6ebe8] flex items-center px-3.5 py-2.5 transition-colors focus-within:bg-white focus-within:border-[#1e3a2c]/50">
              <Search className="w-4 h-4 text-[#71817a] mr-2.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assessments by skill, topic, or keyword..."
                className="w-full bg-transparent text-xs sm:text-sm text-[#14211b] placeholder:text-[#71817a] outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[#71817a] hover:text-[#14211b] p-0.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Clear button if filters active */}
            {(searchQuery || filterDifficulty !== 'All') && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-[#ff5500] hover:text-[#e64d00] flex items-center gap-1.5 px-3 py-2 shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset filters</span>
              </button>
            )}
          </div>

          {/* Difficulty Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#f0f4f1]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-[#5d6b64] mr-1 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Difficulty:
              </span>
              {['All', 'EASY', 'MEDIUM', 'HARD', ...(customQuizzes.length > 0 ? ['CUSTOM'] : [])].map(
                (level) => {
                  const isActive = filterDifficulty === level
                  const label =
                    level === 'All'
                      ? 'All Levels'
                      : level === 'CUSTOM'
                      ? 'Custom Quizzes'
                      : level.charAt(0) + level.slice(1).toLowerCase()

                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFilterDifficulty(level)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#1e3a2c] text-white shadow-2xs font-semibold'
                          : 'bg-[#f5f7f6] text-[#5d6b64] hover:bg-[#edf3ef] hover:text-[#14211b] border border-[#e6ebe8]'
                      }`}
                    >
                      {label}
                    </button>
                  )
                }
              )}
            </div>

            <div className="text-xs text-[#5d6b64] font-medium">
              Showing <span className="font-semibold text-[#14211b]">{filteredQuizzes.length}</span> of {allQuizzes.length}
            </div>
          </div>
        </div>
      )}

      {isMentor && activeTab === 'analytics' ? (
        <QuizAnalyticsDashboard
          allQuizzes={allQuizzes}
          customQuizzes={customQuizzes}
        />
      ) : filteredQuizzes.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-[#d2e2d8] bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f3ee] text-[#164c3a]">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-[#14211b]">No assessments found</h3>
          <p className="mt-1 text-sm text-[#5d6b64] max-w-sm mx-auto">
            {searchQuery
              ? `We couldn't find any quizzes matching "${searchQuery}" with the current filters.`
              : 'No quizzes match the selected difficulty level.'}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#1e3a2c] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#164c3a] transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear Filters
          </button>
        </div>
      ) : (
        /* Quizzes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredQuizzes.map((quiz) => {
            const isCustom = customQuizzes.some((c) => c.id === quiz.id)
            return (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                isCustom={isCustom}
                onSelect={handleSelectQuiz}
                onEdit={isMentor && isCustom ? (e) => handleEditQuiz(e, quiz) : undefined}
                onDelete={isMentor && isCustom ? (e) => promptDeleteQuiz(e, quiz) : undefined}
              />
            )
          })}
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {quizToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setQuizToDelete(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 cursor-default"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setQuizToDelete(null)}
              className="absolute top-5 right-5 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon & Title */}
            <div className="flex items-center gap-3.5 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Assessment</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            {/* Details Box */}
            <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50/80 p-3.5 text-xs text-gray-700">
              <p className="font-semibold text-gray-900 text-sm mb-1">{quizToDelete.title}</p>
              <div className="flex items-center gap-2 text-gray-500 text-[11px]">
                <span>{quizToDelete.questionCount} questions</span>
                <span>·</span>
                <span>{quizToDelete.durationMinutes} min</span>
                <span>·</span>
                <span>Pass {quizToDelete.passingScore}%</span>
                <span>·</span>
                <span className="font-semibold text-rose-600 uppercase">{quizToDelete.difficulty}</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to permanently remove this custom assessment from your workspace?
            </p>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setQuizToDelete(null)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteQuiz}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {deletedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-3">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{deletedToast}</span>
        </div>
      )}
    </div>
  )
}
