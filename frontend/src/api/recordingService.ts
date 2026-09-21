export interface SessionMetadata {
  sessionId: string
  studentId: string
  studentName: string
  quizId: string
  quizTitle: string
  startedAt: string
  finishedAt: string
  durationSeconds: number
  score: number
  totalQuestions: number
  percentage: number
  isPassed: boolean
  isCompromised: boolean
  violationsCount: number
  violations: Array<{
    id: string
    timestamp: string
    type: string
    description: string
  }>
}

export interface SaveRecordingResult {
  success: boolean
  videoPath?: string | null
  metadataPath?: string | null
  fileName?: string
  error?: string
}

/**
 * Saves the recorded quiz session video and metadata into the repository folder (/recorded-sessions).
 * Transmits raw binary data via FormData without Base64 or JSON conversion.
 */
export async function saveSessionRecording(
  videoBlob: Blob,
  metadata: SessionMetadata,
  extension: 'webm' | 'mp4' = 'webm'
): Promise<SaveRecordingResult> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const cleanStudentId = metadata.studentId.replace(/[^a-zA-Z0-9_-]/g, '_')
  const cleanQuizId = metadata.quizId.replace(/[^a-zA-Z0-9_-]/g, '_')
  const uniqueFilename = `${cleanStudentId}_${cleanQuizId}_${timestamp}.${extension}`

  console.log('Dimensiune Blob înainte de trimitere:', videoBlob.size, 'bytes', `(Format: ${extension.toUpperCase()})`)

  try {
    const formData = new FormData()

    // Trimite direct fișierul binar dacă există bytes înregistrați
    if (videoBlob.size > 0) {
      formData.append('video', videoBlob, uniqueFilename)
    }

    formData.append('filename', uniqueFilename)
    formData.append('metadata', JSON.stringify(metadata, null, 2))

    console.log(`[RecordingService] Trimitere binar brut via FormData către /api/recordings/upload (${uniqueFilename})...`)

    // ATENȚIE: Nu setăm manual 'Content-Type': browserul setează automat multipart boundary-ul!
    const response = await fetch('/api/recordings/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('[RecordingService] Recording successfully saved to /recorded-sessions/:', data)
    return {
      success: true,
      videoPath: data.videoPath || (videoBlob.size > 0 ? `recorded-sessions/${uniqueFilename}` : null),
      metadataPath:
        data.metadataPath ||
        `recorded-sessions/${uniqueFilename.replace(`.${extension}`, '_meta.json')}`,
      fileName: uniqueFilename,
    }
  } catch (err: unknown) {
    const error = err as Error
    console.error('[RecordingService] Failed to upload recording via FormData:', error)
    return {
      success: false,
      error: error.message || 'Network error saving recording',
      fileName: uniqueFilename,
    }
  }
}

/**
 * Fallback browser download utility for the student or mentor to save the recording locally.
 */
export function downloadRecordingLocally(videoBlob: Blob, filename: string) {
  const url = URL.createObjectURL(videoBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
