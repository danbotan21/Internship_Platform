import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { ApiError } from '../api/client'
import * as progressApi from '../api/progress'
import MilestoneTimeline from '../components/progress/MilestoneTimeline'
import TaskLog from '../components/progress/TaskLog'
import { FeedbackHistory } from '../components/progress/FeedbackPanel'
import CertificateCard from '../components/progress/CertificateCard'
import type { StudentProgress } from '../types/progress'

export default function InternshipProgress() {
  const { session, logout } = useAuth()

  const [progress, setProgress] = useState<StudentProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingMilestoneId, setPendingMilestoneId] = useState<string | null>(null)
  const [isLoggingTask, setIsLoggingTask] = useState(false)

  const handleApiError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        logout()
        return
      }
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
    setProgress({
      ...progress,
      milestones: progress.milestones.map((m) => (m.id === milestoneId ? { ...m, status } : m)),
    })

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

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading progress…</p>
  }

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
                  <p className="text-lg font-semibold text-gray-900">
                    {progress.milestonesTotal - progress.milestonesCompleted}
                  </p>
                  <p className="text-xs text-gray-500">Remaining</p>
                </div>
              </div>

              <h3 className="mt-5 text-xs font-medium text-gray-500">Hours logged</h3>
              <p className="text-sm text-gray-700">
                {progress.hoursLogged} / {progress.targetHours} hours
              </p>
              <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-orange-400"
                  style={{ width: `${Math.min(100, (progress.hoursLogged / progress.targetHours) * 100)}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Milestone timeline</h2>
              <MilestoneTimeline
                milestones={progress.milestones}
                pendingId={pendingMilestoneId}
                onToggle={handleToggleMilestone}
              />
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
