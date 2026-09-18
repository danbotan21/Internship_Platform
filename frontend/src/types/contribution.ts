export type Role = 'student' | 'mentor'
export type Status =
  | 'Draft'
  | 'Submitted'
  | 'Changes requested'
  | 'Validated'
  | 'Rejected'
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

export type CollaboratorParticipationStatus =
  | 'Pending confirmation'
  | 'Confirmed'
  | 'Disputed'
  | 'Resolved'

export type Collaborator = {
  id: string
  name: string
  email: string
  role: string
  status: CollaboratorParticipationStatus
  disputeReason?: string
  resolutionNote?: string
  addedAt: string
  updatedAt: string
}

export type ContributionEvent = {
  id: string
  kind:
    | 'submitted'
    | 'changes-requested'
    | 'resubmitted'
    | 'validated'
    | 'rejected'
  at: string
  revision: number
  note?: string
}

export type ContributionDecision = {
  type: 'validated' | 'rejected'
  mentorId?: string
  note?: string
  reason?: string
  at?: string
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
  collaborators: Collaborator[]
  evidenceNote: string
  mentorFeedback?: string
  reviewDecision?: ContributionDecision
  revisionNote?: string
  history?: ContributionEvent[]
  revision: number
  updatedAt: string
  submittedAt?: string
  studentDisplayName?: string
}
