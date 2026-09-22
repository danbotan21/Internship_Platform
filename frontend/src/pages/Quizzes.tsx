import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SquarePen, Trash2, X, Check, LayoutGrid, BarChart2 } from 'lucide-react'
import { quizzesCatalog } from '../data/quizzesData'
import QuizCard from '../components/quizzes/QuizCard'
import QuizDetail from '../components/quizzes/QuizDetail'
import QuizActive from '../components/quizzes/QuizActive'
import QuestionBuilder from '../components/quizzes/QuestionBuilder'
import QuizAnalyticsDashboard from '../components/quizzes/QuizAnalyticsDashboard'
import { useAuth } from '../hooks/authContext'
import type { QuizCatalogItem } from '../types/quiz'

const CUSTOM_QUIZZES_KEY = 'internflow_custom_quizzes'

function loadSavedCustomQuizzes(): QuizCatalogItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CUSTOM_QUIZZES_KEY)
    if (raw) {
      return JSON.parse(raw) as QuizCatalogItem[]
    }
  } catch (err) {
    console.warn('Failed to load custom quizzes from localStorage:', err)
  }
  return []
}

export default function Quizzes() {
  const { session } = useAuth()
  const role = session?.role ?? 'Student'
  const isMentor = role === 'Mentor' || role === 'Admin' || role === 'Company'

  const [searchParams, setSearchParams] = useSearchParams()
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null)
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)
  const [activeTab, setActiveTab] = useState<'catalog' | 'analytics'>('catalog')
  const [editingQuiz, setEditingQuiz] = useState<QuizCatalogItem | null>(null)

  // Custom Quizzes persisted in localStorage
  const [customQuizzes, setCustomQuizzes] = useState<QuizCatalogItem[]>(() =>
    loadSavedCustomQuizzes()
  )

  const selectedQuizId = searchParams.get('quiz')
  const status = searchParams.get('status') // e.g. 'active' or null
  const view = searchParams.get('view')

  const allQuizzes = useMemo(
    () => [...customQuizzes, ...quizzesCatalog],
    [customQuizzes]
  )

  const selectedQuiz = allQuizzes.find((q) => q.id === selectedQuizId) ?? null

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
    setSearchParams({})
  }

  const handleEditQuiz = (e: React.MouseEvent, quiz: QuizCatalogItem) => {
    e.stopPropagation()
    setEditingQuiz(quiz)
    setSearchParams({ view: 'custom' })
  }

  const handleSaveCustomQuiz = (newQuiz: QuizCatalogItem) => {
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
  }

  // Delete modal state
  const [quizToDelete, setQuizToDelete] = useState<QuizCatalogItem | null>(null)
  const [deletedToast, setDeletedToast] = useState<string | null>(null)

  const promptDeleteQuiz = (e: React.MouseEvent, quiz: QuizCatalogItem) => {
    e.stopPropagation()
    setQuizToDelete(quiz)
  }

  const confirmDeleteQuiz = () => {
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
  }

  const handleBeginAssessment = (streams: {
    recordingStream: MediaStream
    webcamStream: MediaStream | null
  }) => {
    setRecordingStream(streams.recordingStream)
    setWebcamStream(streams.webcamStream)
    if (selectedQuiz) {
      setSearchParams({ quiz: selectedQuiz.id, status: 'active' })
    }
  }

  const handleFinishAssessment = () => {
    cleanUpStreamsAndSession()
    setSearchParams({})
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
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {isMentor
              ? activeTab === 'catalog'
                ? 'Custom Assessments & Quizzes'
                : 'Performance Analytics'
              : 'Skill Assessments'}
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
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
            <div className="flex items-center rounded-xl bg-gray-100 p-1 border border-gray-200/80 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'catalog'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
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
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
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
                className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a2c] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#162d22] transition-colors cursor-pointer"
              >
                <SquarePen className="h-3.5 w-3.5" />
                Create Quiz
              </button>
            )}
          </div>
        )}
      </div>

      {isMentor && activeTab === 'analytics' ? (
        <QuizAnalyticsDashboard
          allQuizzes={allQuizzes}
          customQuizzes={customQuizzes}
        />
      ) : (
        /* Quizzes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {allQuizzes.map((quiz) => {
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
