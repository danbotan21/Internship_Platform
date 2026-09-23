import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Camera,
  Mic,
  TriangleAlert,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ShieldAlert,
  Monitor,
} from 'lucide-react'
import type { QuizCatalogItem, QuizQuestion, AntiCheatViolation, ViolationType } from '../../types/quiz'
import {
  saveSessionRecording,
  type SessionMetadata,
} from '../../api/recordingService'
import { useAuth } from '../../hooks/authContext'
import {
  saveQuizAttempt,
  type UserQuizAttempt,
  formatDuration,
} from '../../services/quizResultsDb'
import fixWebmDuration from 'fix-webm-duration'
import { fetchQuizByIdOrSlug } from '../../api/quizzes'

const DEFAULT_FALLBACK_QUESTION: QuizQuestion = {
  id: 'q-custom-default-1',
  numberLabel: 'Q01',
  category: 'TYPESCRIPT',
  question: 'Which TypeScript utility type constructs a type with all properties of T set to optional?',
  hint: 'Think about the utility keyword that makes every property non-mandatory.',
  correctOptionId: 'a',
  options: [
    { id: 'a', label: 'A', text: 'Partial<T>' },
    { id: 'b', label: 'B', text: 'Required<T>' },
    { id: 'c', label: 'C', text: 'Readonly<T>' },
    { id: 'd', label: 'D', text: 'Pick<T, K>' },
  ],
}

interface QuizActiveProps {
  quiz: QuizCatalogItem
  recordingStream: MediaStream | null
  webcamStream: MediaStream | null
  isReloadViolation?: boolean
  onFinish: () => void
}

const MAX_ALLOWED_VIOLATIONS = 3

export default function QuizActive({
  quiz,
  recordingStream,
  webcamStream,
  isReloadViolation = false,
  onFinish,
}: QuizActiveProps) {
  const { session } = useAuth()
  const studentName = session?.fullName || 'Daniel Chigaianu'
  const studentEmail = session?.email || 'dan.chigaianu@gmail.com'
  const studentId = session?.userId || 'user-daniel-chigaianu'
  // Session start time (restored from sessionStorage only if reload occurred)
  const sessionStartTimeRef = useRef<Date>(
    (() => {
      if (typeof window !== 'undefined' && isReloadViolation) {
        const savedStart = sessionStorage.getItem('quiz_session_started_at')
        if (savedStart) {
          const parsed = new Date(savedStart)
          if (!isNaN(parsed.getTime())) return parsed
        }
      }
      return new Date()
    })()
  )

  // Answers state: restored from sessionStorage only if reload occurred
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined' && isReloadViolation) {
      try {
        const saved = sessionStorage.getItem('quiz_session_answers')
        if (saved) return JSON.parse(saved)
      } catch {
        // ignore
      }
    }
    return {}
  })
  const answersRef = useRef(answers)
  useEffect(() => {
    answersRef.current = answers
    if (typeof window !== 'undefined' && Object.keys(answers).length > 0) {
      sessionStorage.setItem('quiz_session_answers', JSON.stringify(answers))
    }
  }, [answers])

  // Hint toggles: { [questionId]: boolean }
  const [activeHints, setActiveHints] = useState<Record<string, boolean>>({})

  // Submission results state
  const [isSubmitted, setIsSubmitted] = useState<boolean>(Boolean(isReloadViolation))
  const isSubmittedRef = useRef(isSubmitted)
  useEffect(() => {
    isSubmittedRef.current = isSubmitted
  }, [isSubmitted])

  const [isCompromised, setIsCompromised] = useState<boolean>(Boolean(isReloadViolation))

  // Multi-monitor detection
  const [isMultiMonitor] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const scr = window.screen as unknown as { isExtended?: boolean; availLeft?: number; availTop?: number }
    if (typeof scr?.isExtended === 'boolean') {
      return scr.isExtended
    }
    if (typeof scr?.availLeft === 'number' && scr.availLeft !== 0) return true
    if (typeof scr?.availTop === 'number' && scr.availTop !== 0) return true
    if (window.screenLeft > window.screen.width || window.screenTop > window.screen.height) return true
    return false
  })

  // Anti-cheat activation state: active once valid screen sharing is confirmed
  const [isAntiCheatActive, setIsAntiCheatActive] = useState(false)
  const isWarmupCompleteRef = useRef(false)

  // Oprește complet toate resursele hardware (track-urile video și audio: cameră, microfon, ecran)
  const stopHardwareResources = useCallback(() => {
    if (recordingStream) {
      recordingStream.getTracks().forEach((t) => t.stop())
    }
    if (webcamStream) {
      webcamStream.getTracks().forEach((t) => t.stop())
    }
  }, [recordingStream, webcamStream])

  // Verificările anti-cheat devin active după ce ecranul complet este confirmat și stabilizat
  useEffect(() => {
    if (isWarmupCompleteRef.current) return

    const screenTrack = recordingStream?.getVideoTracks()[0]
    const settings = screenTrack?.getSettings() as (MediaTrackSettings & { displaySurface?: string }) | undefined

    const isScreenValid = Boolean(
      screenTrack &&
      screenTrack.readyState === 'live' &&
      (settings?.displaySurface === 'monitor' || settings?.displaySurface === undefined)
    )

    if (isScreenValid) {
      // Perioadă de stabilizare (1.5s)
      const timer = setTimeout(() => {
        if (screenTrack?.readyState === 'live') {
          isWarmupCompleteRef.current = true
          setIsAntiCheatActive(true)
        }
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [recordingStream])

  // Timer countdown initialized to quiz duration or remaining time on reload
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const totalSecs = (quiz.durationMinutes || 20) * 60
    if (typeof window !== 'undefined' && isReloadViolation) {
      const savedStart = sessionStorage.getItem('quiz_session_started_at')
      if (savedStart) {
        const elapsedSecs = Math.floor((Date.now() - new Date(savedStart).getTime()) / 1000)
        return Math.max(0, totalSecs - elapsedSecs)
      }
    }
    return totalSecs
  })

  // Anti-cheat violation tracking (restored and augmented only on reload)
  const [violations, setViolations] = useState<AntiCheatViolation[]>(() => {
    const initialViolations: AntiCheatViolation[] = []
    if (typeof window !== 'undefined' && isReloadViolation) {
      try {
        const saved = sessionStorage.getItem('quiz_session_violations')
        if (saved) {
          const parsed = JSON.parse(saved) as Array<{
            id: string
            timestamp: string
            type: ViolationType
            description: string
          }>
          parsed.forEach((v) => {
            initialViolations.push({
              ...v,
              timestamp: new Date(v.timestamp),
            })
          })
        }
      } catch {
        // ignore
      }
    }

    if (isReloadViolation) {
      initialViolations.push({
        id: `v-${Date.now()}`,
        timestamp: new Date(),
        type: 'PAGE_RELOAD_VIOLATION',
        description: '[PAGE_RELOAD_VIOLATION] Sesiune compromisă prin reîncărcarea paginii (Page Reload / F5)',
      })
    }

    return initialViolations
  })

  // Activare flag quiz_active DOAR după ce fluxurile sunt confirmate live și componenta este montată
  useEffect(() => {
    if (
      !isReloadViolation &&
      recordingStream &&
      recordingStream.getVideoTracks().some((t) => t.readyState === 'live')
    ) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('quiz_active', 'true')
        sessionStorage.setItem('quiz_session_active', 'true')
        sessionStorage.setItem('quiz_session_id', quiz.id)
        sessionStorage.setItem('quiz_session_started_at', sessionStartTimeRef.current.toISOString())
      }
      console.log('[AntiCheat] Stream-uri hardware validate: quiz_active activat în sessionStorage.')
    }
  }, [isReloadViolation, recordingStream, quiz.id])

  useEffect(() => {
    if (typeof window !== 'undefined' && violations.length > 0) {
      sessionStorage.setItem('quiz_session_violations', JSON.stringify(violations))
    }
  }, [violations])

  const [currentWarning, setCurrentWarning] = useState<string | null>(() => {
    if (isReloadViolation) {
      return 'INCIDENT DE SECURITATE: Sesiunea a fost compromisă prin reîncărcarea paginii (Page Reload / F5)! Testul a fost oprit și invalidat.'
    }
    return null
  })
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastViolationTimestampRef = useRef<number>(0)

  // Media Recording state
  const recorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const recordedMimeTypeRef = useRef<string>('video/webm')
  const recordedFileExtRef = useRef<'webm' | 'mp4'>('webm')
  const [isRecording, setIsRecording] = useState(false)

  // Video PiP ref for webcam
  const videoPipRef = useRef<HTMLVideoElement | null>(null)

  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(() => {
    if (quiz.questions && quiz.questions.length > 0) return quiz.questions
    if (quiz.id.startsWith('custom-') || quiz.title.toLowerCase().startsWith('test')) {
      return [DEFAULT_FALLBACK_QUESTION]
    }
    return []
  })

  useEffect(() => {
    if (quiz.questions && quiz.questions.length > 0) {
      setActiveQuestions(quiz.questions)
      return
    }

    fetchQuizByIdOrSlug(quiz.id)
      .then((detail) => {
        if (detail && Array.isArray(detail.questions) && detail.questions.length > 0) {
          setActiveQuestions(
            detail.questions.map((q) => ({
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
          )
        } else if (quiz.id.startsWith('custom-') || quiz.title.toLowerCase().startsWith('test')) {
          setActiveQuestions([DEFAULT_FALLBACK_QUESTION])
        }
      })
      .catch(() => {
        if (quiz.id.startsWith('custom-') || quiz.title.toLowerCase().startsWith('test')) {
          setActiveQuestions([DEFAULT_FALLBACK_QUESTION])
        }
      })
  }, [quiz.id, quiz.questions, quiz.title])

  const questions: QuizQuestion[] = activeQuestions

// Helper pentru determinarea formatului video optim (prioritizând MP4 H.264/AAC pentru compatibilitate nativă Windows)
const getSupportedMimeTypeAndExt = (): { mimeType: string; ext: 'mp4' | 'webm' } => {
  if (typeof MediaRecorder === 'undefined') {
    return { mimeType: 'video/webm', ext: 'webm' }
  }

  const candidateTypes: Array<{ mime: string; ext: 'mp4' | 'webm' }> = [
    { mime: 'video/mp4;codecs=avc1,mp4a.40.2', ext: 'mp4' },
    { mime: 'video/mp4', ext: 'mp4' },
    { mime: 'video/webm;codecs=h264', ext: 'webm' },
    { mime: 'video/webm;codecs=vp8,opus', ext: 'webm' },
    { mime: 'video/webm', ext: 'webm' },
  ]

  for (const candidate of candidateTypes) {
    if (MediaRecorder.isTypeSupported(candidate.mime)) {
      return { mimeType: candidate.mime, ext: candidate.ext }
    }
  }

  return { mimeType: 'video/webm', ext: 'webm' }
}

  // Finalize and save recording (oprire asincronă garantată cu Promise)
  const finalizeRecording = useCallback(
    async (
      compromisedState: boolean,
      finalViolations: AntiCheatViolation[],
      finalAnswers: Record<string, string>
    ) => {
      const recorder = recorderRef.current
      const ext = recordedFileExtRef.current
      const mimeType = recordedMimeTypeRef.current
      let videoBlob: Blob = new Blob([], { type: mimeType })

      if (recorder && recorder.state !== 'inactive') {
        console.log('[MediaRecorder] Finalizing recording: awaiting onstop event via Promise...')
        videoBlob = await new Promise<Blob>((resolve) => {
          recorder.onstop = async () => {
            const chunks = [...recordedChunksRef.current]
            console.log(`[MediaRecorder] onstop triggered: collected ${chunks.length} chunks.`)

            const rawBlob = new Blob(chunks, { type: recorder.mimeType || mimeType })
            console.log('Mărime video brut salvat:', rawBlob.size, 'bytes', `(MIME: ${recorder.mimeType || mimeType})`)

            let finalBlob = rawBlob
            const durationMs = Math.max(
              1000,
              Date.now() - sessionStartTimeRef.current.getTime()
            )

            // Reparare metadate EBML Duration dacă fișierul este WebM
            if ((recorder.mimeType || mimeType).includes('webm') && rawBlob.size > 0) {
              try {
                console.log(`[MediaRecorder] Fixing WebM duration metadata (${durationMs}ms)...`)
                finalBlob = await fixWebmDuration(rawBlob, durationMs)
                console.log('Mărime video după fixare durată WebM:', finalBlob.size, 'bytes')
              } catch (fixErr) {
                console.warn('[MediaRecorder] fixWebmDuration warning:', fixErr)
              }
            }

            console.log('Dimensiune Blob înainte de trimitere:', finalBlob.size, 'bytes')
            if (finalBlob.size < 10240) {
              console.warn(
                `[MediaRecorder] Avertisment: Fișierul video are doar ${finalBlob.size} bytes (< 10 KB). Nu s-a înregistrat niciun frame sau stream-ul a fost tăiat prematur!`
              )
            }

            resolve(finalBlob)
          }

          try {
            if (recorder.state === 'recording' || recorder.state === 'paused') {
              recorder.requestData()
            }
            recorder.stop()
          } catch (err) {
            console.warn('[MediaRecorder] Error stopping MediaRecorder:', err)
            resolve(new Blob(recordedChunksRef.current, { type: recorder.mimeType || mimeType }))
          }
        })
      } else if (recordedChunksRef.current.length > 0) {
        videoBlob = new Blob(recordedChunksRef.current, { type: mimeType })
        console.log('Mărime video salvat (din buffer existent):', videoBlob.size, 'bytes')
      }

      // Oprește resursele hardware STRICT DUPĂ ce MediaRecorder a finalizat generarea Blob-ului
      stopHardwareResources()
      setIsRecording(false)

      // Calculate score and missed topics
      const missedTopics: string[] = []
      questions.forEach((q) => {
        if (!q.correctOptionId || finalAnswers[q.id] !== q.correctOptionId) {
          missedTopics.push(q.category || 'General')
        }
      })

      const correctCount = questions.filter(
        (q) => q.correctOptionId && finalAnswers[q.id] === q.correctOptionId
      ).length
      const total = questions.length
      const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0
      const isPassed = !compromisedState && percentage >= quiz.passingScore

      let status: 'PASSED' | 'BORDERLINE' | 'FAILED' = 'FAILED'
      if (isPassed) {
        status = 'PASSED'
      } else if (!compromisedState && percentage >= Math.max(0, quiz.passingScore - 15)) {
        status = 'BORDERLINE'
      } else {
        status = 'FAILED'
      }

      const durationSec = Math.max(
        1,
        Math.round((Date.now() - sessionStartTimeRef.current.getTime()) / 1000)
      )

      // Save to Quiz Results Database
      const quizAttempt: UserQuizAttempt = {
        id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: studentId,
        userName: studentName,
        userEmail: studentEmail,
        quizId: quiz.id,
        quizTitle: quiz.title,
        category: quiz.category || 'General',
        difficulty: quiz.difficulty,
        score: correctCount,
        totalQuestions: total,
        percentage,
        passingScore: quiz.passingScore,
        status,
        timeSpentSeconds: durationSec,
        timeSpentFormatted: formatDuration(durationSec),
        isFlagged: compromisedState || finalViolations.length > 0,
        flagReason: compromisedState
          ? (finalViolations[0]?.description || 'Proctoring security incident flagged')
          : undefined,
        completedAt: new Date().toISOString(),
        cohortWeek: 8,
        missedTopics,
        answersSummary: {
          correctCount,
          incorrectCount: total - correctCount,
        },
      }

      try {
        console.log('[QuizResultsDb] Recording quiz attempt to database:', quizAttempt)
        await saveQuizAttempt(quizAttempt)
      } catch (dbErr) {
        console.warn('[QuizResultsDb] Failed to save quiz attempt:', dbErr)
      }

      const metadata: SessionMetadata = {
        sessionId: `sess_${Date.now()}`,
        studentId,
        studentName,
        quizId: quiz.id,
        quizTitle: quiz.title,
        startedAt: sessionStartTimeRef.current.toISOString(),
        finishedAt: new Date().toISOString(),
        durationSeconds: durationSec,
        score: correctCount,
        totalQuestions: total,
        percentage,
        isPassed,
        isCompromised: compromisedState,
        violationsCount: finalViolations.length,
        violations: finalViolations.map((v) => ({
          id: v.id,
          timestamp: v.timestamp.toISOString(),
          type: v.type,
          description: v.description,
        })),
      }

      console.log(`[RecordingService] Uploading session recording (${videoBlob.size} bytes, format: ${ext.toUpperCase()})...`, {
        sessionId: metadata.sessionId,
        fileName: `${metadata.studentId}_${metadata.quizId}`,
      })

      const saveResult = await saveSessionRecording(videoBlob, metadata, ext)
      if (saveResult.success) {
        console.log('[RecordingService] Recording successfully saved to /recorded-sessions/:', saveResult)
      } else {
        console.error('[RecordingService] Failed to save recording:', saveResult.error)
      }
    },
    [questions, quiz.category, quiz.difficulty, quiz.id, quiz.passingScore, quiz.title, stopHardwareResources, studentEmail, studentId, studentName]
  )

  // Initialize MediaRecorder on the combined recordingStream
  useEffect(() => {
    if (!recordingStream) return

    try {
      // 1. Asigură un codec compatibil și stabil, prioritizând MP4 (H.264 / AAC) dacă browserul îl suportă
      const { mimeType, ext } = getSupportedMimeTypeAndExt()

      console.log('[MediaRecorder] Initializing MediaRecorder with mimeType:', mimeType, 'format:', ext)
      console.log(
        '[MediaRecorder] Combined stream tracks:',
        recordingStream.getTracks().map((t) => `${t.kind} (${t.label}, readyState: ${t.readyState})`)
      )

      recordedMimeTypeRef.current = mimeType
      recordedFileExtRef.current = ext

      const recorder = new MediaRecorder(recordingStream, {
        mimeType,
        videoBitsPerSecond: 2500000,
      })
      recordedChunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
          console.log(
            `[MediaRecorder] ondataavailable chunk collected: ${event.data.size} bytes. Total chunks: ${recordedChunksRef.current.length}`
          )
        }
      }

      recorder.onstart = () => {
        console.log('[MediaRecorder] MediaRecorder started recording.')
        setIsRecording(true)
      }

      recorder.onerror = (event) => {
        console.error('[MediaRecorder] Error during recording session:', event)
      }

      // 2. Colectare forțată a fragmentelor video (timeslice de 1000ms)
      recorder.start(1000)
      recorderRef.current = recorder
    } catch (err) {
      console.error('[MediaRecorder] Could not initialize MediaRecorder on recording stream:', err)
    }

    return () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        try {
          if (
            recorderRef.current.state === 'recording' ||
            recorderRef.current.state === 'paused'
          ) {
            recorderRef.current.requestData()
          }
          recorderRef.current.stop()
        } catch {
          // ignore
        }
      }
    }
  }, [recordingStream])

  // Internal Navigation Guard: triggered if student clicks any link (e.g. Sidebar) or attempts navigation
  const triggerNavigationExit = useCallback(
    (destinationLabel?: string) => {
      if (isSubmittedRef.current) return

      // a) Închide imediat sesiunea de quiz (marchează testul ca compromis / abandonat)
      setIsCompromised(true)
      setIsSubmitted(true)
      isSubmittedRef.current = true

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('quiz_active')
        sessionStorage.removeItem('quiz_session_active')
      }

      // c) Creează incidentul specificat
      const targetName = destinationLabel ? ` to "${destinationLabel.trim()}"` : ''
      const navViolation: AntiCheatViolation = {
        id: `v-${Date.now()}`,
        timestamp: new Date(),
        type: 'NAVIGATION_EXIT',
        description: `[NAVIGATION_EXIT] Attempted to navigate away to another section${targetName}`,
      }

      setViolations((prev) => {
        const updated = [...prev, navViolation]
        // d) Oprește MediaRecorder și finalizează înregistrarea
        finalizeRecording(true, updated, answersRef.current)
        return updated
      })

      setCurrentWarning(
        'INCIDENT DE SECURITATE: Navigarea în afara testului este interzisă! Sesiunea a fost compromisă și trimisă automat.'
      )
    },
    [stopHardwareResources, finalizeRecording]
  )

  // Ascultător pentru navigare internă (Sidebar, Link-uri din aplicație)
  useEffect(() => {
    const handleCaptureClick = (e: MouseEvent) => {
      if (isSubmittedRef.current) return

      const target = e.target as HTMLElement | null
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null

      if (anchor) {
        const href = anchor.getAttribute('href')
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          e.preventDefault()
          e.stopPropagation()

          const label =
            anchor.innerText?.trim() ||
            anchor.getAttribute('aria-label') ||
            anchor.getAttribute('title') ||
            href

          triggerNavigationExit(label)
        }
      }
    }

    // Faza de captură (capture: true) interceptează click-ul înainte ca router-ul să schimbe pagina
    window.addEventListener('click', handleCaptureClick, true)
    return () => {
      window.removeEventListener('click', handleCaptureClick, true)
    }
  }, [triggerNavigationExit])

  // Ascultător pentru butoanele de Back/Forward din browser
  useEffect(() => {
    const handlePopState = () => {
      if (!isSubmittedRef.current) {
        triggerNavigationExit('Browser Back/Forward navigation')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [triggerNavigationExit])

  // 1. Avertisment nativ la tentativă de reîncărcare / părăsire (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSubmittedRef.current) {
        e.preventDefault()
        e.returnValue = '' // Afișează dialogul nativ al browserului: "Changes you made may not be saved"
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // 2. Detecție Reload și arhivare sesiune compromisă pe server
  useEffect(() => {
    if (isReloadViolation) {
      console.warn('[AntiCheat] [PAGE_RELOAD_VIOLATION] Sesiune compromisă prin reîncărcarea paginii!')

      // Calculare scor pe baza răspunsurilor salvate în sessionStorage până în momentul reload-ului
      const correctCount = questions.filter(
        (q) => q.correctOptionId && answers[q.id] === q.correctOptionId
      ).length
      const total = questions.length
      const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0

      const missedTopics: string[] = []
      questions.forEach((q) => {
        if (!q.correctOptionId || answers[q.id] !== q.correctOptionId) {
          missedTopics.push(q.category || 'General')
        }
      })

      const durationSec = Math.max(
        1,
        Math.round((Date.now() - sessionStartTimeRef.current.getTime()) / 1000)
      )

      const reloadAttempt: UserQuizAttempt = {
        id: `att_${Date.now()}_reload`,
        userId: studentId,
        userName: studentName,
        userEmail: studentEmail,
        quizId: quiz.id,
        quizTitle: quiz.title,
        category: quiz.category || 'General',
        difficulty: quiz.difficulty,
        score: correctCount,
        totalQuestions: total,
        percentage,
        passingScore: quiz.passingScore,
        status: 'FAILED',
        timeSpentSeconds: durationSec,
        timeSpentFormatted: formatDuration(durationSec),
        isFlagged: true,
        flagReason: 'Page reload violation (F5 / refreshed during proctored exam)',
        completedAt: new Date().toISOString(),
        cohortWeek: 8,
        missedTopics,
        answersSummary: {
          correctCount,
          incorrectCount: total - correctCount,
        },
      }

      saveQuizAttempt(reloadAttempt).catch(() => undefined)

      const metadata: SessionMetadata = {
        sessionId: `sess_${Date.now()}`,
        studentId,
        studentName,
        quizId: quiz.id,
        quizTitle: quiz.title,
        startedAt: sessionStartTimeRef.current.toISOString(),
        finishedAt: new Date().toISOString(),
        durationSeconds: durationSec,
        score: correctCount,
        totalQuestions: total,
        percentage,
        isPassed: false,
        isCompromised: true,
        violationsCount: violations.length,
        violations: violations.map((v) => ({
          id: v.id,
          timestamp: v.timestamp.toISOString(),
          type: v.type,
          description: v.description,
        })),
      }

      console.log('[RecordingService] Archiving reload-compromised session metadata...', metadata)
      saveSessionRecording(new Blob([], { type: 'video/webm' }), metadata, 'webm').then((res) => {
        console.log('[RecordingService] Compromised session metadata archived successfully:', res)
      })
    }
  }, [answers, isReloadViolation, questions, quiz.category, quiz.difficulty, quiz.id, quiz.passingScore, quiz.title, studentEmail, studentId, studentName, violations])

  // Detect screen share stop: if student clicks "Stop sharing" in the browser bar,
  // immediately compromise and auto-submit the assessment
  useEffect(() => {
    if (!recordingStream) return

    const screenTrack = recordingStream.getVideoTracks()[0]
    if (!screenTrack) return

    const handleTrackEnded = () => {
      if (isSubmittedRef.current) return
      // Immediately flag as compromised and auto-submit
      setIsCompromised(true)
      setIsSubmitted(true)
      isSubmittedRef.current = true

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('quiz_active')
        sessionStorage.removeItem('quiz_session_active')
      }

      const stopViolation: AntiCheatViolation = {
        id: `v-${Date.now()}`,
        timestamp: new Date(),
        type: 'SCREEN_SHARE_STOPPED' as ViolationType,
        description: 'Partajarea ecranului a fost oprită în timpul testului („Stop sharing”) — tentativă de fraudă',
      }

      setViolations((prev) => {
        const updated = [...prev, stopViolation]
        finalizeRecording(true, updated, answersRef.current)
        return updated
      })

      setCurrentWarning('TENTATIVĂ DE FRAUDĂ: Partajarea ecranului a fost oprită! Testul a fost marcat ca invalid și trimis automat.')
    }

    screenTrack.onended = handleTrackEnded
    screenTrack.addEventListener('ended', handleTrackEnded)
    return () => {
      screenTrack.onended = null
      screenTrack.removeEventListener('ended', handleTrackEnded)
    }
  }, [recordingStream, finalizeRecording, stopHardwareResources])

  // 1. Configurare identică și obligatorie pe tag-ul <video> (Proctor Cam)
  useEffect(() => {
    const videoElement = videoPipRef.current
    if (videoElement && webcamStream) {
      videoElement.muted = true
      videoElement.playsInline = true
      if (videoElement.srcObject !== webcamStream) {
        videoElement.srcObject = webcamStream
      }
      videoElement.play().catch((err) => console.warn('[ProctorCam] Autoplay blocked/deferred:', err))
      console.log(
        '[Proctoring] Live webcam stream attached to video element. Video tracks:',
        webcamStream.getVideoTracks().map((t) => `${t.id} (${t.label}, readyState: ${t.readyState})`)
      )
    }
  }, [webcamStream])

  // Register an anti-cheat violation
  const recordViolation = useCallback(
    (type: ViolationType, description: string) => {
      if (isSubmittedRef.current) return

      // Debounce events within 1.5 seconds
      const now = Date.now()
      if (now - lastViolationTimestampRef.current < 1500) return
      lastViolationTimestampRef.current = now

      const newViolation: AntiCheatViolation = {
        id: `v-${now}`,
        timestamp: new Date(),
        type,
        description,
      }

      setViolations((prev) => {
        const updated = [...prev, newViolation]
        if (updated.length >= MAX_ALLOWED_VIOLATIONS) {
          // Automatic termination
          setIsCompromised(true)
          setIsSubmitted(true)
          isSubmittedRef.current = true
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('quiz_active')
            sessionStorage.removeItem('quiz_session_active')
          }
          finalizeRecording(true, updated, answersRef.current)
        }
        return updated
      })

      setCurrentWarning(
        `Warning: ${description} (Incident #${violations.length + 1} of ${MAX_ALLOWED_VIOLATIONS})`
      )

      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
      warningTimeoutRef.current = setTimeout(() => {
        setCurrentWarning(null)
      }, 7000)
    },
    [violations.length, finalizeRecording, stopHardwareResources]
  )

  // Tab switch & window blur listeners (active only when anti-cheat is armed)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isSubmittedRef.current && isWarmupCompleteRef.current) {
        recordViolation('TAB_SWITCH', 'Părăsire tab sau minimizare fereastră detectată (Tab Switch)')
      }
    }

    const handleWindowBlur = () => {
      if (!isSubmittedRef.current && isWarmupCompleteRef.current) {
        recordViolation(
          'WINDOW_BLUR',
          'Ai părăsit fereastra testului sau ai făcut click pe al doilea monitor (Window Blur)!'
        )
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    }
  }, [recordViolation])

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsSubmitted(true)
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('quiz_active')
            sessionStorage.removeItem('quiz_session_active')
          }
          finalizeRecording(isCompromised, violations, answers)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isSubmitted, finalizeRecording, isCompromised, violations, answers])

  // Format time mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (isSubmitted) return
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  const toggleHint = (questionId: string) => {
    setActiveHints((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }))
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
    isSubmittedRef.current = true
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('quiz_active')
      sessionStorage.removeItem('quiz_session_active')
    }
    finalizeRecording(isCompromised, violations, answers)
  }

  // Calculate score on submit
  const totalQuestions = questions.length
  const correctCount = questions.filter(
    (q) => q.correctOptionId && answers[q.id] === q.correctOptionId
  ).length
  const calculatedPercentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const isPassed = !isCompromised && calculatedPercentage >= quiz.passingScore

  return (
    <div className="relative w-full max-w-5xl pb-24">
      {/* Live Anti-Cheat Warning Toast */}
      {currentWarning && !isCompromised && (
        <div className="sticky top-2 z-50 mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <TriangleAlert className="h-5 w-5 shrink-0 text-red-600 animate-pulse" />
            <div className="text-sm font-medium">
              <span className="font-bold">{currentWarning}</span>
              <span className="block text-xs text-red-700 mt-0.5">
                Proctoring system will automatically terminate and invalidate the session after {MAX_ALLOWED_VIOLATIONS} violations.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCurrentWarning(null)}
            className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 cursor-pointer shrink-0"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Top Bar: Security badges & Section Timer */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Security badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Anti-cheat monitoring badge */}
          <div
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-semibold tracking-wider uppercase transition-colors ${
              isAntiCheatActive
                ? 'border-emerald-200/90 bg-[#f4f7f5] text-emerald-800'
                : 'border-amber-300 bg-amber-50 text-amber-800'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${isAntiCheatActive ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
            <span>{isAntiCheatActive ? 'ANTI-CHEAT ACTIVE' : 'ARMING PROCTORING...'}</span>
          </div>

          {/* Cam active badge */}
          <div className="flex items-center gap-2 rounded-md border border-gray-200/90 bg-[#f4f7f5] px-3 py-1 text-xs font-semibold tracking-wider text-gray-700 uppercase">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Camera className="h-3.5 w-3.5 text-gray-600" />
            <span>CAM ACTIVE</span>
          </div>

          {/* Mic active badge */}
          <div className="flex items-center gap-2 rounded-md border border-gray-200/90 bg-[#f4f7f5] px-3 py-1 text-xs font-semibold tracking-wider text-gray-700 uppercase">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Mic className="h-3.5 w-3.5 text-gray-600" />
            <span>MIC ACTIVE</span>
          </div>

          {/* Screen recording active badge */}
          {isRecording && (
            <div className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold tracking-wider text-red-700 uppercase">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-ping"></span>
              <Monitor className="h-3.5 w-3.5 text-red-600" />
              <span>SCREEN REC</span>
            </div>
          )}

          {/* Dual monitor protected badge */}
          {isMultiMonitor && (
            <div className="flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold tracking-wider text-blue-800 uppercase">
              <Monitor className="h-3.5 w-3.5 text-blue-600" />
              <span>DUAL SCREEN MONITORED</span>
            </div>
          )}

          {/* Violations counter chip if any */}
          {violations.length > 0 && (
            <div className="flex items-center gap-1 rounded-md border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{violations.length}/{MAX_ALLOWED_VIOLATIONS} VIOLATIONS</span>
            </div>
          )}
        </div>

        {/* Section Timer */}
        <div className="flex flex-col items-center rounded-lg border border-gray-200/90 bg-[#f4f7f5] px-5 py-1.5 text-center shadow-2xs">
          <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            SECTION TIMER
          </span>
          <span className="font-mono text-xl font-bold tracking-tight text-gray-900">
            {formatTime(secondsLeft)}
          </span>
        </div>
      </div>

      {/* Main Page Title */}
      <h1 className="mt-5 mb-8 font-serif text-2xl font-bold text-gray-900 md:text-3xl">
        {quiz.title} – In Progress
      </h1>

      {/* Questions list */}
      <div className="space-y-6">
        {questions.length === 0 ? (
          <div className="rounded-2xl border border-gray-200/80 bg-white p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-3 border border-amber-200">
              <TriangleAlert className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Se încarcă întrebările testului...</h3>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
              Te rugăm să aștepți câteva momente pentru inițializarea întrebărilor acestui test.
            </p>
          </div>
        ) : (
          questions.map((question) => {
            const selectedOptionId = answers[question.id]
            const isHintOpen = activeHints[question.id]

            return (
              <div
                key={question.id}
                className="rounded-2xl border border-gray-200/80 bg-white p-6 md:p-7 shadow-xs transition-shadow hover:shadow-sm"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-gray-400">
                      {question.numberLabel}
                    </span>
                    <span className="rounded border border-gray-200/60 bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-gray-600 uppercase">
                      {question.category}
                    </span>
                  </div>

                  {question.hint && (
                    <button
                      type="button"
                      onClick={() => toggleHint(question.id)}
                      className="rounded border border-gray-200/90 px-2.5 py-0.5 text-xs font-semibold tracking-wider text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-700 cursor-pointer uppercase"
                    >
                      HINT
                    </button>
                  )}
                </div>

                {/* Hint Callout */}
                {isHintOpen && question.hint && (
                  <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-amber-200/80 bg-amber-50/60 p-3 text-xs text-amber-900 animate-in fade-in">
                    <Lightbulb className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <span className="font-bold">Hint: </span>
                      {question.hint}
                    </div>
                  </div>
                )}

                {/* Question text */}
                <h2 className="mt-3.5 mb-5 text-base font-semibold text-gray-900 md:text-lg">
                  {question.question}
                </h2>

                {/* Option choices */}
                <div className="space-y-2.5">
                  {question.options.map((option) => {
                    const isSelected = selectedOptionId === option.id

                    return (
                      <div
                        key={option.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onClick={() => handleSelectOption(question.id, option.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleSelectOption(question.id, option.id)
                          }
                        }}
                        className={`group flex items-center gap-3.5 rounded-xl border p-3.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#1e3a2c] bg-emerald-50/20 text-[#1e3a2c] ring-1 ring-[#1e3a2c]'
                            : 'border-gray-200/90 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                        }`}
                      >
                        {/* Option letter circle badge */}
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                            isSelected
                              ? 'border-[#1e3a2c] bg-[#1e3a2c] text-white'
                              : 'border-gray-300 text-gray-400 group-hover:border-gray-400 group-hover:text-gray-600'
                          }`}
                        >
                          {option.label}
                        </span>

                        {/* Option text */}
                        <span className="text-sm font-medium text-gray-800">
                          {option.text}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Bottom Submit Action */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={questions.length === 0}
          className="rounded-xl bg-[#1e3a2c] px-9 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#162c21] hover:shadow-md active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit
        </button>
      </div>

      {/* Submission Results Modal */}
      {isSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              {isCompromised ? (
                <ShieldAlert className="h-10 w-10 text-red-600" />
              ) : isPassed ? (
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              ) : (
                <XCircle className="h-10 w-10 text-amber-600" />
              )}
            </div>

            <h3 className="font-serif text-2xl font-bold text-gray-900">
              {isCompromised ? 'Assessment Compromised & Terminated' : 'Assessment Completed'}
            </h3>

            <p className="mt-1.5 text-sm text-gray-500">
              {isCompromised
                ? isReloadViolation
                  ? 'Sesiunea a fost compromisă și invalidată automat prin reîncărcarea paginii (Page Reload / F5). Continuarea testului fără monitorizare hardware este strict interzisă.'
                  : `Test was forcibly auto-submitted because anti-cheat security conditions were violated.`
                : `You answered ${Object.keys(answers).length} of ${totalQuestions} questions.`}
            </p>

            <div className="my-6 rounded-xl border border-gray-200/80 bg-gray-50 p-5">
              <div className="text-3xl font-bold text-gray-900">
                {calculatedPercentage}%
              </div>
              <div
                className={`text-xs font-semibold uppercase tracking-wider mt-1.5 ${
                  isCompromised
                    ? 'text-red-700'
                    : isPassed
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}
              >
                {isCompromised
                  ? 'Academic Integrity Flagged'
                  : isPassed
                  ? `Passed (Target: ${quiz.passingScore}%)`
                  : `Needs Improvement (Target: ${quiz.passingScore}%)`}
              </div>

              {/* Violations incident breakdown */}
              {violations.length > 0 && (
                <div className="mt-4 border-t border-gray-200 pt-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                    Proctoring Incident Log ({violations.length}):
                  </div>
                  <ul className="space-y-1 text-xs text-red-700">
                    {violations.map((v, i) => (
                      <li key={v.id} className="flex items-start gap-1.5">
                        <span className="font-bold shrink-0">#{i + 1}</span>
                        <span>
                          [{v.type}] {v.description} at{' '}
                          {v.timestamp.toLocaleTimeString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            <button
              type="button"
              onClick={onFinish}
              className="w-full rounded-xl bg-[#1e3a2c] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#162c21] cursor-pointer"
            >
              Return to Catalog
            </button>
          </div>
        </div>
      )}

      {/* Single Proctoring Webcam PiP stream floating window */}
      {webcamStream && !isSubmitted && (
        <div className="fixed bottom-5 right-5 z-40 overflow-hidden rounded-xl border-2 border-[#1e3a2c] bg-gray-950 shadow-2xl transition-all w-44">
          <div className="flex items-center justify-between bg-[#1e3a2c] px-2.5 py-1.5 text-[11px] font-semibold text-white">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="tracking-wider uppercase">Proctor Cam</span>
            </div>
            <Camera className="h-3.5 w-3.5 text-emerald-300" />
          </div>
          <div className="h-28 w-full bg-black">
            <video
              ref={videoPipRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
