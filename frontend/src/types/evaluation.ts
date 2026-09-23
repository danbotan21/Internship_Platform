import type {
  ContributionCategory,
  EvidenceSummary,
  SubmissionCheck,
} from './contribution'
import type { InternshipMember } from './user'

// Mirrors the DTOs of the ASP.NET evaluation API.

export type EvaluationType = 'initial' | 'midTerm' | 'final'

export type EvaluationStatus = 'draft' | 'readyForReview' | 'finalized'

export type RubricVersionStatus = 'draft' | 'published' | 'archived'

export type RubricCriterion = {
  id: string
  position: number
  name: string
  description: string
  guidance: string
  weight: number
  scaleMax: number
  ratingStep: number
  isVisibleToStudents: boolean
}

export type RubricVersion = {
  id: string
  versionNumber: number
  title: string
  status: RubricVersionStatus
  changeNote?: string | null
  createdAtUtc: string
  updatedAtUtc: string
  publishedAtUtc?: string | null
  archivedAtUtc?: string | null
  totalWeight: number
  usedByEvaluations: number
  criteria: RubricCriterion[]
  publishChecks: SubmissionCheck[]
}

export type MentorRubric = {
  published?: RubricVersion | null
  draft?: RubricVersion | null
}

export type RubricVersionSummary = {
  id: string
  versionNumber: number
  title: string
  status: RubricVersionStatus
  changeNote?: string | null
  createdAtUtc: string
  publishedAtUtc?: string | null
  archivedAtUtc?: string | null
  criteriaCount: number
  totalWeight: number
  usedByEvaluations: number
}

export type StudentCriteria = {
  mentorName?: string | null
  rubricVersionNumber?: number | null
  rubricTitle?: string | null
  publishedAtUtc?: string | null
  criteria: RubricCriterion[]
}

export type EvaluationCriterionScore = {
  criterionId: string
  name: string
  description: string
  guidance: string
  weight: number
  scaleMax: number
  ratingStep: number
  rating?: number | null
  comment?: string | null
  weightedPoints?: number | null
  previousRating?: number | null
  previousScaleMax?: number | null
}

export type EvaluationFeedback = {
  strengths?: string | null
  areasForImprovement?: string | null
  nextSteps?: string | null
  overallComment?: string | null
}

export type EvaluationDetails = {
  id: string
  student: InternshipMember
  mentor: InternshipMember
  type: EvaluationType
  periodStart: string
  periodEnd: string
  status: EvaluationStatus
  rubricVersionId: string
  rubricVersionNumber: number
  rubricTitle: string
  resultsVisible: boolean
  isUpcoming: boolean
  criteria: EvaluationCriterionScore[]
  feedback: EvaluationFeedback
  criteriaScored: number
  criteriaTotal: number
  provisionalPoints: number
  provisionalMaxPoints: number
  finalScore?: number | null
  previousFinalScore?: number | null
  previousType?: EvaluationType | null
  checks: SubmissionCheck[]
  createdAtUtc: string
  updatedAtUtc: string
  readyForReviewAtUtc?: string | null
  finalizedAtUtc?: string | null
  acknowledgedAtUtc?: string | null
  studentResponse?: string | null
}

export type EvaluationListItem = {
  id: string
  student: InternshipMember
  mentorName?: string | null
  type: EvaluationType
  periodStart: string
  periodEnd: string
  status: EvaluationStatus
  rubricVersionNumber: number
  criteriaScored: number
  criteriaTotal: number
  finalScore?: number | null
  updatedAtUtc: string
  finalizedAtUtc?: string | null
  acknowledgedAtUtc?: string | null
  isUpcoming: boolean
  isDueSoon: boolean
  isOverdue: boolean
}

export type StudentEvaluationOverview = {
  student: InternshipMember
  evaluations: EvaluationListItem[]
  missingTypes: EvaluationType[]
  validatedContributionCount: number
  latestFinalScore?: number | null
}

export type EvaluationContextContribution = {
  id: string
  title: string
  category: ContributionCategory
  workStartDate?: string | null
  workEndDate?: string | null
  validatedAtUtc?: string | null
  evidence: EvidenceSummary
  collaboratorCount: number
}

export type EvaluationContext = {
  periodStart: string
  periodEnd: string
  contributions: EvaluationContextContribution[]
  previousEvaluations: EvaluationListItem[]
  unavailableSources: string[]
}

// ---- Requests --------------------------------------------------------------
export type RubricCriterionInput = Omit<RubricCriterion, 'id' | 'position'>

export type CreateEvaluationInput = {
  studentId: string
  type: EvaluationType
  periodStart: string
  periodEnd: string
}

export type SaveEvaluationInput = {
  // Optional correction of the evaluation period (draft only; both or neither).
  periodStart?: string
  periodEnd?: string
  scores: {
    criterionId: string
    rating: number | null
    comment: string | null
  }[]
  strengths: string | null
  areasForImprovement: string | null
  nextSteps: string | null
  overallComment: string | null
}
