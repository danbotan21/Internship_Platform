import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { quizzesCatalog } from '../data/quizzesData'
import QuizCard from '../components/quizzes/QuizCard'
import QuizDetail from '../components/quizzes/QuizDetail'
import QuizActive from '../components/quizzes/QuizActive'
import type { QuizCatalogItem } from '../types/quiz'

export default function Quizzes() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null)
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)

  const selectedQuizId = searchParams.get('quiz')
  const status = searchParams.get('status') // e.g. 'active' or null

  const selectedQuiz = quizzesCatalog.find((q) => q.id === selectedQuizId) ?? null

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
    setSearchParams({})
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
    // Dacă s-a ajuns pe status=active fără streams și fără sesiune activă anterioară (ex. URL manual), redirecționează la detail
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

  // 2. Quiz Pre-Start Detail Screen
  if (selectedQuiz) {
    return (
      <QuizDetail
        quiz={selectedQuiz}
        onBack={handleBackToCatalog}
        onBegin={handleBeginAssessment}
      />
    )
  }

  // 3. Quizzes Catalog Screen
  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Skill Assessments
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          {quizzesCatalog.length} quizzes available — choose one to begin
        </p>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {quizzesCatalog.map((quiz) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            onSelect={handleSelectQuiz}
          />
        ))}
      </div>
    </div>
  )
}
