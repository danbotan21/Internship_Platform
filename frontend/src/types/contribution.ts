import type { InternshipMember } from './user'

// Mirrors the DTOs of the ASP.NET contribution API.

export type ContributionStatus =
  | 'draft'
  | 'submitted'
  | 'changesRequested'
  | 'validated'
  | 'rejected'

export type ContributionCategory =
  | 'development'
  | 'uiUxDesign'
  | 'testing'
  | 'documentation'
  | 'research'
  | 'other'

export type EvidenceType =
  | 'link'
  | 'document'
  | 'image'
  | 'githubCommit'
  | 'githubPullRequest'

export type SignalStatus = 'passed' | 'info' | 'warning' | 'failed'

export type CollaboratorStatus = 'pending' | 'confirmed' | 'disputed'

export type ReviewOutcome = 'changesRequested' | 'validated' | 'rejected'

export type ReviewCriterion =
  | 'evidenceVerifiable'
  | 'matchesDeclaredRole'
  | 'attributionAccurate'
  | 'withinInternshipScope'
  | 'qualityAcceptable'

export type RejectionReason =
  | 'evidenceNotVerifiable'
  | 'outsideInternshipScope'
  | 'duplicate'
  | 'attributionIncorrect'
  | 'other'

export type VerificationSignal = {
  code: string
  label: string
  status: SignalStatus
}

export type GitHubFile = {
  filename: string
  status: string
  additions: number
  deletions: number
}

export type GitHubCommit = {
  sha: string
  message: string
  authorLogin?: string | null
  authoredAtUtc?: string | null
}

export type GitHubEvidence = {
  repository: string
  reference: string
  authorLogin?: string | null
  authoredAtUtc?: string | null
  additions: number
  deletions: number
  changedFiles: number
  state?: string | null
  checksConclusion?: string | null
  files: GitHubFile[]
  commits: GitHubCommit[]
  coAuthors: string[]
}

export type Evidence = {
  id: string
  type: EvidenceType
  name: string
  caption?: string | null
  url: string
  originalFileName?: string | null
  contentType?: string | null
  fileSizeBytes?: number | null
  gitHub?: GitHubEvidence | null
  signals: VerificationSignal[]
}

export type LinkedIssue = {
  repository: string
  number: number
  title?: string | null
  state?: string | null
  url: string
}

export type ContributionRevision = {
  id: string
  revisionNumber: number
  title: string
  category: ContributionCategory
  workStartDate?: string | null
  workEndDate?: string | null
  description: string
  ownRole: string
  linkedIssue?: LinkedIssue | null
  revisionNote?: string | null
  submittedAtUtc?: string | null
  evidence: Evidence[]
}

export type Collaborator = {
  id: string
  userId: string
  name: string
  email: string
  gitHubUsername?: string | null
  area: ContributionCategory
  roleDescription: string
  status: CollaboratorStatus
  disputeReason?: string | null
  resolutionNote?: string | null
  addedAtUtc: string
  updatedAtUtc: string
  confirmedAtUtc?: string | null
  disputedAtUtc?: string | null
}

export type ReviewCheck = {
  criterion: ReviewCriterion
  isMet: boolean
  comment?: string | null
}

export type FeedbackItem = {
  id: string
  position: number
  message: string
  evidenceId?: string | null
  evidenceName?: string | null
  response?: string | null
  respondedAtUtc?: string | null
}

export type ContributionReview = {
  id: string
  revisionNumber: number
  mentorId: string
  mentorName?: string | null
  outcome: ReviewOutcome
  summary: string
  rejectionReason?: RejectionReason | null
  reviewedAtUtc: string
  checks: ReviewCheck[]
  feedbackItems: FeedbackItem[]
}

export type HistoryEvent = {
  id: string
  type: 'submitted' | 'changesRequested' | 'resubmitted' | 'validated' | 'rejected'
  revisionNumber: number
  occurredAtUtc: string
  actorName?: string | null
  note?: string | null
}

export type SubmissionCheck = {
  code: string
  label: string
  passed: boolean
  detail?: string | null
}

export type RevisionComparison = {
  comparedWithRevision: number
  fieldChanges: { field: string; before?: string | null; after?: string | null }[]
  evidenceAdded: string[]
  evidenceRemoved: string[]
  hasChanges: boolean
}

export type ContributionDetails = {
  id: string
  student: InternshipMember
  status: ContributionStatus
  currentRevisionNumber: number
  createdAtUtc: string
  updatedAtUtc: string
  submittedAtUtc?: string | null
  currentRevision: ContributionRevision
  collaborators: Collaborator[]
  reviews: ContributionReview[]
  history: HistoryEvent[]
  submissionChecks: SubmissionCheck[]
  comparison?: RevisionComparison | null
  suggestedCollaborators: InternshipMember[]
  changeRequestsUsed: number
  changeRequestsLimit: number
}

export type EvidenceSummary = {
  commits: number
  pullRequests: number
  images: number
  documents: number
  links: number
  additions: number
  deletions: number
}

export type ContributionListItem = {
  id: string
  student: InternshipMember
  title: string
  category: ContributionCategory
  status: ContributionStatus
  workStartDate?: string | null
  workEndDate?: string | null
  currentRevisionNumber: number
  updatedAtUtc: string
  submittedAtUtc?: string | null
  evidence: EvidenceSummary
  collaboratorCount: number
  pendingCollaboratorCount: number
  disputedCollaboratorCount: number
  warningCount: number
  latestOutcome?: ReviewOutcome | null
  myCollaboratorId?: string | null
  myCollaboratorStatus?: CollaboratorStatus | null
}

export type GitHubRepositoryOption = {
  fullName: string
  defaultBranch: string
  branches: string[]
}

export type GitHubCommitOption = {
  sha: string
  message: string
  authoredAtUtc?: string | null
  url: string
}

export type GitHubPullRequestOption = {
  number: number
  title: string
  state: string
  createdAtUtc: string
  url: string
}

export type GitHubLiveStatus = {
  evidenceId: string
  state?: string | null
  checksConclusion?: string | null
  checkedAtUtc: string
  error?: string | null
}

// ---- Requests --------------------------------------------------------------
export type DraftInput = {
  title: string
  category: ContributionCategory
  workStartDate: string | null
  workEndDate: string | null
  description: string
  ownRole: string
  linkedIssueUrl: string | null
  revisionNote: string | null
  feedbackResponses: { feedbackItemId: string; response: string }[]
}

export type CollaboratorInput = {
  userId: string
  area: ContributionCategory
  roleDescription: string
}

export type ReviewInput = {
  outcome: ReviewOutcome
  summary: string
  rejectionReason: RejectionReason | null
  checks: ReviewCheck[]
  feedbackItems: { message: string; evidenceId: string | null }[]
}
