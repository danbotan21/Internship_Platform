import { apiFetch } from './client'
import type {
  Feedback,
  LogTaskPayload,
  Milestone,
  MilestoneStatus,
  StudentProgress,
  StudentSummary,
  SubmitFeedbackPayload,
  TaskLogEntry,
} from '../types/progress'

export function getMyProgress(accessToken: string): Promise<StudentProgress> {
  return apiFetch<StudentProgress>('/api/progress/me', { accessToken })
}

export function getStudents(accessToken: string): Promise<StudentSummary[]> {
  return apiFetch<StudentSummary[]>('/api/progress/students', { accessToken })
}

export function getStudentProgress(accessToken: string, studentId: string): Promise<StudentProgress> {
  return apiFetch<StudentProgress>(`/api/progress/students/${studentId}`, { accessToken })
}

export function logTask(accessToken: string, payload: LogTaskPayload): Promise<TaskLogEntry> {
  return apiFetch<TaskLogEntry>('/api/progress/tasks', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(payload),
  })
}

export function updateMilestone(accessToken: string, milestoneId: string, status: MilestoneStatus): Promise<Milestone> {
  return apiFetch<Milestone>(`/api/progress/milestones/${milestoneId}`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify({ status }),
  })
}

export function submitFeedback(accessToken: string, studentId: string, payload: SubmitFeedbackPayload): Promise<Feedback> {
  return apiFetch<Feedback>(`/api/progress/students/${studentId}/feedback`, {
    method: 'POST',
    accessToken,
    body: JSON.stringify(payload),
  })
}
