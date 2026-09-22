export type MilestoneStatus = 'Pending' | 'Completed' | 'Flagged'

export interface Milestone {
  id: string
  title: string
  description: string
  dueDate: string
  order: number
  requiresReview: boolean
  status: MilestoneStatus
  completedAt: string | null
  reviewedByName: string | null
  needsReview: boolean
}

export interface TaskLogEntry {
  id: string
  description: string
  hours: number
  date: string
  createdAt: string
}

export interface Feedback {
  id: string
  supervisorName: string
  punctuality: number
  initiative: number
  skillGrowth: number
  comments: string | null
  createdAt: string
}

export interface StudentProgress {
  studentId: string
  studentName: string
  milestones: Milestone[]
  milestonesCompleted: number
  milestonesTotal: number
  completionPercent: number
  hoursLogged: number
  targetHours: number
  taskLog: TaskLogEntry[]
  feedback: Feedback[]
  certificateEligible: boolean
}

export interface StudentSummary {
  studentId: string
  studentName: string
  completionPercent: number
  belowThreshold: boolean
  lastActivityDate: string | null
  hasMilestoneNeedingReview: boolean
}

export interface LogTaskPayload {
  description: string
  hours: number
  date: string
}

export interface SubmitFeedbackPayload {
  punctuality: number
  initiative: number
  skillGrowth: number
  comments: string
}
