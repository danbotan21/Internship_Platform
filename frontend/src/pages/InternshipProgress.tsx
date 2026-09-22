import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../hooks/authContext'
import { ApiError } from '../api/client'
import * as progressApi from '../api/progress'
import MilestoneTimeline from '../components/progress/MilestoneTimeline'
import TaskLog from '../components/progress/TaskLog'
import { FeedbackHistory } from '../components/progress/FeedbackPanel'
import CertificateCard from '../components/progress/CertificateCard'
import type { StudentProgress, StudentSummary } from '../types/progress'
import { ArrowLeft, Users } from 'lucide-react'

// ─── Student view ────────────────────────────────────────────────────────────

function StudentProgressView() {
  const { session, logout } = useAuth()
  const [progress, setProgress] = useState<StudentProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingMilestoneId, setPendingMilestoneId] = useState<string | null>(null)
  const [isLoggingTask, setIsLoggingTask] = useState(false)

  const handleApiError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) { logout(); return }
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    },
    [logout],
  )

  const loadProgress = useCallback(async () => {
    if (!session) return
    try {
      const data = await progressApi.getMyProgress(session.accessToken)
      setError(null)
      setProgress(data)
    } catch (err) {
      handleApiError(err)
    }
  }, [session, handleApiError])

  useEffect(() => {
    if (!session) return
    void (async () => {
      await loadProgress()
      setIsLoading(false)
    })()
  }, [session, loadProgress])

  async function handleToggleMilestone(milestoneId: string, completed: boolean) {
    if (!session || !progress) return
    const status = completed ? 'Completed' : 'Pending'
    setPendingMilestoneId(milestoneId)
    setProgress({ ...progress, milestones: progress.milestones.map((m) => (m.id === milestoneId ? { ...m, status } : m)) })
    try {
      await progressApi.updateMilestone(session.accessToken, milestoneId, status)
    } catch (err) {
      handleApiError(err)
    } finally {
      await loadProgress()
      setPendingMilestoneId(null)
    }
  }

  async function handleLogTask(description: string, hours: number, date: string) {
    if (!session) return
    setIsLoggingTask(true)
    try {
      await progressApi.logTask(session.accessToken, { description, hours, date })
      await loadProgress()
    } catch (err) {
      handleApiError(err)
    } finally {
      setIsLoggingTask(false)
    }
  }

  if (isLoading) return <p className="text-sm text-gray-400">Loading progress…</p>

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Progress</h1>
      <p className="mt-1 text-sm text-gray-500">Track your internship milestones from onboarding to final showcase.</p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {progress && (
        <div className="mt-6 flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Overall completion</h2>
              <p className="mt-2 text-4xl font-bold text-gray-900">
                {progress.completionPercent}
                <span className="text-base font-medium text-gray-400"> % of the program</span>
              </p>
              <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-[#1e3a2c]" style={{ width: `${progress.completionPercent}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-green-50 p-3">
                  <p className="text-lg font-semibold text-gray-900">{progress.milestonesCompleted}</p>
                  <p className="text-xs text-gray-500">Milestones done</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3">
                  <p className="text-lg font-semibold text-gray-900">{progress.milestonesTotal - progress.milestonesCompleted}</p>
                  <p className="text-xs text-gray-500">Remaining</p>
                </div>
              </div>
              <h3 className="mt-5 text-xs font-medium text-gray-500">Hours logged</h3>
              <p className="text-sm text-gray-700">{progress.hoursLogged} / {progress.targetHours} hours</p>
              <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-orange-400" style={{ width: `${Math.min(100, (progress.hoursLogged / progress.targetHours) * 100)}%` }} />
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Milestone timeline</h2>
              <MilestoneTimeline milestones={progress.milestones} pendingId={pendingMilestoneId} onToggle={handleToggleMilestone} />
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Activity log</h2>
            <TaskLog entries={progress.taskLog} canLog isSubmitting={isLoggingTask} onLog={handleLogTask} />
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Supervisor feedback</h2>
            <FeedbackHistory feedback={progress.feedback} />
          </div>
          {progress.certificateEligible && <CertificateCard progress={progress} />}
        </div>
      )}
    </div>
  )
}

// ─── Mentor view ─────────────────────────────────────────────────────────────

function MentorProgressView() {
  const { session, logout } = useAuth()
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [selected, setSelected] = useState<StudentProgress | null>(null)
  const [selectedName, setSelectedName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleApiError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) { logout(); return }
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    },
    [logout],
  )

  useEffect(() => {
    if (!session) return
    progressApi.getStudents(session.accessToken)
      .then((data) => { setStudents(data); setIsLoading(false) })
      .catch((err: unknown) => { handleApiError(err); setIsLoading(false) })
  }, [session, handleApiError])

  async function openStudent(summary: StudentSummary) {
    if (!session) return
    setError(null)
    setSelected(null)
    setSelectedName(summary.studentName)
    try {
      const data = await progressApi.getStudentProgress(session.accessToken, summary.studentId)
      setSelected(data)
    } catch (err) {
      handleApiError(err)
    }
  }

  if (selected) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e3a2c] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to students
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">{selectedName}</h1>
        <p className="mt-1 text-sm text-gray-500">Internship progress overview.</p>
        <div className="mt-6 flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-900">Overall completion</h2>
              <p className="mt-2 text-4xl font-bold text-gray-900">
                {selected.completionPercent}
                <span className="text-base font-medium text-gray-400"> % of the program</span>
              </p>
              <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-[#1e3a2c]" style={{ width: `${selected.completionPercent}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-green-50 p-3">
                  <p className="text-lg font-semibold text-gray-900">{selected.milestonesCompleted}</p>
                  <p className="text-xs text-gray-500">Milestones done</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3">
                  <p className="text-lg font-semibold text-gray-900">{selected.milestonesTotal - selected.milestonesCompleted}</p>
                  <p className="text-xs text-gray-500">Remaining</p>
                </div>
              </div>
              <h3 className="mt-5 text-xs font-medium text-gray-500">Hours logged</h3>
              <p className="text-sm text-gray-700">{selected.hoursLogged} / {selected.targetHours} hours</p>
              <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-orange-400" style={{ width: `${Math.min(100, (selected.hoursLogged / selected.targetHours) * 100)}%` }} />
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Milestone timeline</h2>
              <MilestoneTimeline
                milestones={selected.milestones}
                pendingId={null}
                onToggle={() => {/* read-only for mentor */}}
              />
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Activity log</h2>
            <TaskLog entries={selected.taskLog} canLog={false} isSubmitting={false} onLog={async () => {}} />
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Supervisor feedback</h2>
            <FeedbackHistory feedback={selected.feedback} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Internship Progress</h1>
      <p className="mt-1 text-sm text-gray-500">Monitor progress for each intern you supervise.</p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {isLoading ? (
        <p className="mt-6 text-sm text-gray-400">Loading students…</p>
      ) : students.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <Users className="h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">No students assigned to you yet.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((s) => (
            <button
              key={s.studentId}
              type="button"
              onClick={() => void openStudent(s)}
              className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-5 text-left hover:border-[#1e3a2c]/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900 truncate">{s.studentName}</p>
                {s.hasMilestoneNeedingReview && (
                  <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-medium text-orange-700">
                    Needs review
                  </span>
                )}
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100">
                <div className="h-1.5 rounded-full bg-[#1e3a2c]" style={{ width: `${s.completionPercent}%` }} />
              </div>
              <p className="text-xs text-gray-500">{s.completionPercent}% complete</p>
              {s.belowThreshold && (
                <p className="text-xs font-medium text-red-600">Below threshold — needs attention</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export default function InternshipProgress() {
  const { session } = useAuth()
  if (session?.role === 'Mentor') return <MentorProgressView />
  return <StudentProgressView />
}
