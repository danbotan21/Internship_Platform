export type CandidateStatus = 'ACCEPTED' | 'IN REVIEW' | 'PENDING' | 'REJECTED'

export interface RequirementWeight {
  id: string
  name: string
  gate: number // Minimum threshold gate % (e.g. 70%)
  weight: number // Weight percentage in overall match score (e.g. 30%)
  color?: string
  isQuiz?: boolean
  quizId?: string
  quizTitle?: string
}

export interface Candidate {
  id: string
  name: string
  initials: string
  role: string
  university: string
  scores: Record<string, number> // skillId -> score (0-100)
  status: CandidateStatus
  pendingTest?: boolean
  appliedDate: string
  email?: string
  phone?: string
  bio?: string
  isLiveApplicant?: boolean
}

export type SortField = 'MATCH' | 'NAME' | 'DATE'

export interface CohortOption {
  id: string
  name: string
  term: string
}
