import { useState, useRef, useEffect } from 'react'
import {
  Shield,
  TriangleAlert,
  ArrowLeft,
  Camera,
  Mic,
  AlertCircle,
  CheckCircle2,
  Monitor,
  X,
  RotateCcw,
} from 'lucide-react'
import type { QuizCatalogItem } from '../../types/quiz'

declare global {
  interface Window {
    currentActiveStream?: MediaStream | null
  }
}

/**
 * Constrângeri video permisive cu fallback curat:
 * Solicită rezoluție ideală și comută automat pe { video: true, audio: true } dacă eșuează.
 */
export async function acquireUserMedia(customConstraints?: MediaStreamConstraints): Promise<MediaStream> {
  const defaultConstraints: MediaStreamConstraints = {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: true,
  }

  const constraints = customConstraints || defaultConstraints

  try {
    console.log('[MediaCapture] Solicitare getUserMedia cu constrângeri:', constraints)
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    console.log(
      '[MediaCapture] Stream achiziționat cu succes:',
      stream.getTracks().map((t) => `${t.kind} (readyState: ${t.readyState})`)
    )
    return stream
  } catch (err: unknown) {
    const error = err as Error
    console.warn(
      `[MediaCapture] getUserMedia cu constrângeri optime a eșuat (err.name="${error.name}", err.message="${error.message}"). Se încearcă fallback-ul...`
    )

    if (
      error.name === 'OverconstrainedError' ||
      error.name === 'AbortError' ||
      error.name === 'NotReadableError' ||
      error.name === 'TypeError'
    ) {
      try {
        const fallbackConstraints: MediaStreamConstraints = {
          video: true,
          audio: Boolean(constraints.audio),
        }
        console.log('[MediaCapture] Lansare fallback automat cu constrângeri de bază:', fallbackConstraints)
        const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints)
        console.log(
          '[MediaCapture] Fallback-ul getUserMedia a reușit cu succes!',
          fallbackStream.getTracks().map((t) => `${t.kind} (readyState: ${t.readyState})`)
        )
        return fallbackStream
      } catch (fallbackErr: unknown) {
        const fbError = fallbackErr as Error
        console.error(
          `[MediaCapture] Fallback-ul getUserMedia a eșuat de asemenea: name="${fbError.name}", message="${fbError.message}"`
        )
        throw fbError
      }
    }

    throw error
  }
}

interface StartSessionStreams {
  recordingStream: MediaStream
  webcamStream: MediaStream | null
}

interface QuizDetailProps {
  quiz: QuizCatalogItem
  onBack: () => void
  onBegin: (streams: StartSessionStreams) => void
}

export default function QuizDetail({ quiz, onBack, onBegin }: QuizDetailProps) {
  const [isRequestingMedia, setIsRequestingMedia] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [screenShareError, setScreenShareError] = useState<string | null>(null)

  // Local test preview states
  const [cameraActive, setCameraActive] = useState(false)
  const [micActive, setMicActive] = useState(false)
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null)
  const previewStreamRef = useRef<MediaStream | null>(null)
  const isStartingAssessmentRef = useRef(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Păstrează ref-ul sincronizat cu starea
  useEffect(() => {
    previewStreamRef.current = previewStream
  }, [previewStream])

  // Cleanup preview stream NUMAI la demontarea paginii de către utilizator, NU la intrarea în test
  useEffect(() => {
    return () => {
      if (!isStartingAssessmentRef.current && previewStreamRef.current) {
        console.log('[Preview] Oprire preview tracks la părăsirea paginii de detalii')
        previewStreamRef.current.getTracks().forEach((t) => t.stop())
        previewStreamRef.current = null
      }
    }
  }, [])

  // 1. Configurare identică și obligatorie pe tag-ul <video> (Pre-Start) cu redare sigură
  useEffect(() => {
    const videoElement = videoRef.current
    if (videoElement && previewStream) {
      videoElement.muted = true
      videoElement.playsInline = true
      if (videoElement.srcObject !== previewStream) {
        videoElement.srcObject = previewStream
      }
      videoElement.play().catch((err) => console.warn('[VideoPreview] Autoplay blocked/deferred:', err))
    }
  }, [previewStream, cameraActive])

  // Toggle Camera preview test
  const handleToggleCam = async () => {
    setPermissionError(null)
    if (cameraActive) {
      if (previewStreamRef.current) {
        previewStreamRef.current.getVideoTracks().forEach((t) => t.stop())
      }
      previewStreamRef.current = null
      setPreviewStream(null)
      setCameraActive(false)
    } else {
      try {
        if (previewStreamRef.current) {
          previewStreamRef.current.getVideoTracks().forEach((t) => t.stop())
        }
        const stream = await acquireUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })
        previewStreamRef.current = stream
        setPreviewStream(stream)
        setCameraActive(true)
      } catch (err: unknown) {
        const error = err as Error
        console.error(`[ToggleCam] Eroare cameră: err.name="${error.name}", err.message="${error.message}"`)
        setPermissionError(
          `Webcam access failed (${error.name}): ${error.message || 'Permission denied. Please allow camera access in your browser settings.'}`
        )
      }
    }
  }

  // Toggle Mic test
  const handleToggleMic = async () => {
    setPermissionError(null)
    if (micActive) {
      if (previewStreamRef.current) {
        previewStreamRef.current.getAudioTracks().forEach((t) => t.stop())
      }
      setMicActive(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        setMicActive(true)
        if (previewStreamRef.current) {
          stream.getAudioTracks().forEach((t) => previewStreamRef.current?.addTrack(t))
          setPreviewStream(previewStreamRef.current)
        } else {
          previewStreamRef.current = stream
          setPreviewStream(stream)
        }
      } catch (err: unknown) {
        const error = err as Error
        console.error(`[ToggleMic] Eroare microfon: err.name="${error.name}", err.message="${error.message}"`)
        setPermissionError(
          `Microphone access failed (${error.name}): ${error.message || 'Permission denied. Please allow microphone access in your browser settings.'}`
        )
      }
    }
  }

  // Asigură că la intrarea pe ecranul de lansare / pre-start se curăță flag-urile reziduale
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('quiz_active')
      sessionStorage.removeItem('proctoring_incident')
      sessionStorage.removeItem('quiz_session_active')
    }
  }, [])

  // Main Begin Assessment handler: Screen share & devices FIRST in normal window, then Fullscreen
  const handleBeginAssessment = async () => {
    setPermissionError(null)
    setScreenShareError(null)
    setIsRequestingMedia(true)

    // Resetare completă la start nou
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('quiz_active')
      sessionStorage.removeItem('proctoring_incident')
      sessionStorage.removeItem('quiz_session_active')
      sessionStorage.removeItem('quiz_session_id')
      sessionStorage.removeItem('quiz_session_started_at')
      sessionStorage.removeItem('quiz_session_answers')
      sessionStorage.removeItem('quiz_session_violations')
    }

    // Stop local preview if active
    if (previewStreamRef.current) {
      previewStreamRef.current.getTracks().forEach((t) => t.stop())
      previewStreamRef.current = null
      setPreviewStream(null)
      setCameraActive(false)
      setMicActive(false)
    }
    isStartingAssessmentRef.current = true

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsRequestingMedia(false)
        setPermissionError('Browserul tău nu suportă API-ul media (getUserMedia).')
        return
      }
      if (!navigator.mediaDevices.getDisplayMedia) {
        setIsRequestingMedia(false)
        setPermissionError('Browserul tău nu suportă partajarea ecranului (getDisplayMedia).')
        return
      }

      // PASUL 1: Solicitare și validare Screen Share cu Conditional Focus (FĂRĂ fullscreen încă, FĂRĂ comutare pe tab extern)
      const displayMediaOptions: Record<string, unknown> = {
        video: {
          displaySurface: 'monitor', // cere expres monitorul complet
        },
        audio: true,
        // Previne schimbarea automată a tab-ului în browserele suportate:
        surfaceSwitching: 'exclude',
        selfBrowserSurface: 'exclude',
      }

      // Verifică suportul pentru CaptureController și Conditional Focus
      let controller: { setFocusBehavior?: (behavior: string) => void } | null = null
      if (
        typeof window !== 'undefined' &&
        'CaptureController' in window &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'setFocusBehavior' in (window as any).CaptureController.prototype
      ) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const CaptureControllerClass = (window as any).CaptureController
          controller = new CaptureControllerClass()
          // 'no-focus-change' forțează browserul să NU sară pe fereastra/tab-ul selectat
          controller?.setFocusBehavior?.('no-focus-change')
          displayMediaOptions.controller = controller
        } catch (controllerErr) {
          console.warn('CaptureController initial configuration warning:', controllerErr)
        }
      }

      let screenStream: MediaStream
      try {
        screenStream = await navigator.mediaDevices.getDisplayMedia(
          displayMediaOptions as DisplayMediaStreamOptions
        )

        // Asigurare suplimentară că focusul rămâne pe tab-ul curent
        if (controller && typeof controller.setFocusBehavior === 'function') {
          try {
            controller.setFocusBehavior('no-focus-change')
          } catch {
            // Ignoră dacă a fost deja aplicat înainte de rezolvare
          }
        }
        console.log('[Proctoring] Entire screen captured successfully:', screenStream)
      } catch {
        setIsRequestingMedia(false)
        setScreenShareError(
          'Partajarea ecranului a fost refuzată sau anulată. Pentru a începe testul, este obligatoriu să alegi opțiunea «Entire Screen» (ecranul complet).'
        )
        return
      }

      const videoTrack = screenStream.getVideoTracks()[0]
      if (!videoTrack) {
        screenStream.getTracks().forEach((t) => t.stop())
        setIsRequestingMedia(false)
        setScreenShareError('Nu a fost detectat niciun canal video pentru partajarea ecranului.')
        return
      }

      const settings = videoTrack.getSettings() as (MediaTrackSettings & { displaySurface?: string }) | undefined
      if (settings?.displaySurface !== 'monitor') {
        // Utilizatorul a ales o fereastră sau un tab, nu întregul ecran!
        videoTrack.stop()
        screenStream.getTracks().forEach((t) => t.stop())
        setIsRequestingMedia(false)
        setScreenShareError(
          'Selectare invalidă: Este necesar să alegi opțiunea «Entire Screen» (ecranul complet), nu o fereastră individuală sau un tab.'
        )
        return
      }

      // PASUL 2: Solicitare permisiuni cameră și microfon (cu eliberare stream anterior, constrângeri ideale și fallback automat)
      let webcamStream: MediaStream | null = null
      try {
        console.log('[Proctoring] Requesting user media (webcam & microphone)...')
        webcamStream = await acquireUserMedia()
        console.log('[Proctoring] Webcam & Microphone captured successfully:', webcamStream)
      } catch (camErr: unknown) {
        screenStream.getTracks().forEach((t) => t.stop())
        setIsRequestingMedia(false)
        const err = camErr as Error
        console.error(`[Proctoring] getUserMedia Error: name="${err.name}", message="${err.message}"`)

        let friendlyMsg = err.message || 'Acces refuzat'
        if (err.name === 'NotReadableError') {
          friendlyMsg = 'Camera sau microfonul este blocat de sistem sau utilizat de o altă aplicație (Zoom, Teams, alt tab).'
        } else if (err.name === 'NotAllowedError') {
          friendlyMsg = 'Permisiunea pentru cameră și microfon a fost refuzată în browser. Te rugăm să permiți accesul din setările browserului.'
        } else if (err.name === 'NotFoundError') {
          friendlyMsg = 'Nu a fost găsită nicio cameră video sau microfon funcțional pe acest dispozitiv.'
        } else if (err.name === 'OverconstrainedError') {
          friendlyMsg = 'Camera nu suportă rezoluția solicitată.'
        }

        setPermissionError(
          `Permisiunea pentru cameră și microfon este obligatorie (${err.name}): ${friendlyMsg}`
        )
        return
      }

      // PASUL 3: Combinare ecran + audio în fluxul de înregistrare
      // Păstrează în stream-ul principal STRICT:
      // - 1 singur track video (Ecranul de test)
      // - 1 singur track audio (Microfonul studentului)
      const primaryVideoTrack = videoTrack // ecranul de test
      const primaryAudioTrack =
        webcamStream?.getAudioTracks()[0] || screenStream.getAudioTracks()[0]

      const combinedTracks: MediaStreamTrack[] = [primaryVideoTrack]
      if (primaryAudioTrack) {
        combinedTracks.push(primaryAudioTrack)
      }

      const recordingStream = new MediaStream(combinedTracks)
      console.log('[Proctoring] Combined stream created for recording (1 video + 1 audio track):', {
        videoTrack: primaryVideoTrack.label,
        audioTrack: primaryAudioTrack ? primaryAudioTrack.label : 'none',
      })

      setIsRequestingMedia(false)
      onBegin({ recordingStream, webcamStream })
    } catch (err: unknown) {
      setIsRequestingMedia(false)
      const error = err as Error
      console.error('[Proctoring] Error during assessment initialization:', error)
      setPermissionError(error.message || 'A apărut o eroare la inițierea securizării testului.')
    }
  }

  return (
    <div className="w-full">
      {/* Top back navigation */}
      <button
        type="button"
        onClick={onBack}
        className="group mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        <span>All Quizzes</span>
      </button>

      {/* Permission Error Banner */}
      {permissionError && (
        <div className="mx-auto mb-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-left shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-900">
                Proctoring Authorization Required
              </h4>
              <p className="mt-1 text-xs text-red-700 leading-relaxed">
                {permissionError}
              </p>
              <div className="mt-2 text-xs font-medium text-red-800 flex items-center gap-1.5">
                <Monitor className="h-3.5 w-3.5" />
                <span>Camera, microphone, and screen-sharing permissions must be granted to initiate assessment.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Centered Assessment Content */}
      <div className="mx-auto max-w-2xl pt-2 text-center">
        {/* Large Brand Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1e3a2c] text-white shadow-sm transition-transform hover:scale-105">
          <Shield className="h-10 w-10" strokeWidth={1.75} />
        </div>

        {/* Title & Description */}
        <h1 className="font-serif text-3xl font-bold text-gray-900 tracking-tight md:text-4xl">
          {quiz.title}
        </h1>
        <p className="mt-2.5 text-sm text-gray-500 md:text-base">
          {quiz.description}. Timer starts on launch.
        </p>

        {/* 3 Stat Boxes */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200/80 bg-white py-5 px-4 shadow-xs">
            <div className="text-2xl font-bold text-gray-900 md:text-3xl">
              {quiz.questions?.length ?? quiz.questionCount}
            </div>
            <div className="mt-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              QUESTIONS
            </div>
          </div>

          <div className="rounded-xl border border-gray-200/80 bg-white py-5 px-4 shadow-xs">
            <div className="text-2xl font-bold text-gray-900 md:text-3xl">
              {quiz.durationMinutes} min
            </div>
            <div className="mt-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              DURATION
            </div>
          </div>

          <div className="rounded-xl border border-gray-200/80 bg-white py-5 px-4 shadow-xs">
            <div className="text-2xl font-bold text-gray-900 md:text-3xl">
              {quiz.passingScore}%
            </div>
            <div className="mt-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              PASS MARK
            </div>
          </div>
        </div>

        {/* Anti-cheat Warning Banner */}
        <div className="mt-6 flex items-center justify-center gap-3 rounded-xl border border-amber-200/70 bg-[#fff8f2] px-5 py-4 text-center">
          <TriangleAlert className="h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-xs font-medium text-amber-900 md:text-sm">
            Anti-cheat monitoring is active. Tab switches, screen, camera, and microphone will be recorded for review.
          </p>
        </div>

        {/* Live Camera preview widget if toggled for testing */}
        {cameraActive && (
          <div className="mt-5 mx-auto w-48 overflow-hidden rounded-xl border-2 border-emerald-500 shadow-md">
            <div className="h-32 w-full bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div className="bg-emerald-600 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              Camera Live Preview
            </div>
          </div>
        )}

        {/* Inline Screen Share Error Banner placed right above action button */}
        {screenShareError && (
          <div className="mx-auto mt-6 w-full max-w-xl rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-left shadow-xs transition-all animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-[#991B1B] mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-[#991B1B]">
                    Atenție la partajarea ecranului
                  </h4>
                  <p className="text-xs text-[#991B1B]/90 leading-relaxed">
                    {screenShareError}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setScreenShareError(null)}
                aria-label="Închide mesajul"
                className="rounded-lg p-1 text-[#991B1B]/70 hover:bg-red-100 hover:text-[#991B1B] transition-colors cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-end gap-2 border-t border-[#FCA5A5]/40 pt-2.5">
              <button
                type="button"
                onClick={() => {
                  setScreenShareError(null)
                  handleBeginAssessment()
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#991B1B] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#7F1D1D] active:scale-98 transition-all cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Begin Assessment Action Button */}
        <div className="mt-8 flex flex-col items-center">
          <button
            type="button"
            disabled={isRequestingMedia}
            onClick={handleBeginAssessment}
            className="w-64 rounded-xl bg-[#1e3a2c] py-3.5 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#162c21] hover:shadow-md active:scale-98 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isRequestingMedia ? 'Verifying Devices & Screen...' : 'Begin Assessment'}
          </button>

          {/* Secondary test buttons */}
          <div className="mt-5 flex items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleCam}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-1 font-mono text-xs transition-colors cursor-pointer ${
                cameraActive
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200/80 bg-white/70 text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              }`}
            >
              {cameraActive ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
              <span>toggle cam {cameraActive ? '(live)' : ''}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleMic}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-1 font-mono text-xs transition-colors cursor-pointer ${
                micActive
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200/80 bg-white/70 text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              }`}
            >
              {micActive ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Mic className="h-3.5 w-3.5" />
              )}
              <span>toggle mic {micActive ? '(live)' : ''}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
