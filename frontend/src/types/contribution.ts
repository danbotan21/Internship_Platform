export type Role = 'student' | 'mentor'
export type Status = 'Draft' | 'Submitted' | 'Changes requested'
export type Category =
  | 'Development'
  | 'UI / UX design'
  | 'Testing'
  | 'Documentation'
  | 'Research'
  | 'Other'
export type Evidence = {
  id: string
  kind: 'link' | 'file'
  name: string
  url: string
}

export type ContributionEvent = {
  id: string
  kind: 'submitted' | 'changes-requested' | 'resubmitted'
  at: string
  revision: number
  note?: string
}

export type Contribution = {
  id: string
  title: string
  category: Category
  workPeriod: string
  description: string
  linkedTask: string
  ownRole: string
  status: Status
  evidence: Evidence[]
  evidenceNote: string
  mentorFeedback?: string
  revisionNote?: string
  history?: ContributionEvent[]
  revision: number
  updatedAt: string
  submittedAt?: string
  studentDisplayName?: string
}
