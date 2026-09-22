import { requestJson } from './http'
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

export function getMyProgress(): Promise<StudentProgress> {
  return requestJson<StudentProgress>('/api/progress/me')
}

export function getStudents(): Promise<StudentSummary[]> {
  return requestJson<StudentSummary[]>('/api/progress/students')
}

export function getStudentProgress(studentId: string): Promise<StudentProgress> {
  return requestJson<StudentProgress>(`/api/progress/students/${studentId}`)
}

export function logTask(payload: LogTaskPayload): Promise<TaskLogEntry> {
  return requestJson<TaskLogEntry>('/api/progress/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateMilestone(milestoneId: string, status: MilestoneStatus): Promise<Milestone> {
  return requestJson<Milestone>(`/api/progress/milestones/${milestoneId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function submitFeedback(studentId: string, payload: SubmitFeedbackPayload): Promise<Feedback> {
  return requestJson<Feedback>(`/api/progress/students/${studentId}/feedback`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
