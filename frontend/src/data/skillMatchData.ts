import type { Candidate, RequirementWeight, CohortOption, CandidateStatus } from '../types/skillMatch'

export const initialCohorts: CohortOption[] = [
  { id: 'fall-2026-fe', name: 'Frontend Internship', term: 'Fall 2026 Cohort' },
  { id: 'summer-2026-fs', name: 'Full-Stack Engineering', term: 'Summer 2026 Cohort' },
  { id: 'fall-2026-be', name: 'Backend & Cloud Systems', term: 'Fall 2026 Cohort' },
  { id: 'spring-2027-ai', name: 'Data & Machine Learning', term: 'Spring 2027 Cohort' },
]

export const initialRequirements: RequirementWeight[] = [
  { id: 'quiz-custom-test-6ffe4a', name: 'Test', gate: 70, weight: 35, isQuiz: true, quizId: 'custom-test-6ffe4a' },
  { id: 'quiz-custom-test-2-e9993e', name: 'Test 2', gate: 70, weight: 35, isQuiz: true, quizId: 'custom-test-2-e9993e' },
  { id: 'quiz-custom-test-3-e33917', name: 'Test 3', gate: 70, weight: 30, isQuiz: true, quizId: 'custom-test-3-e33917' },
]

export const initialCandidates: Candidate[] = [
  {
    id: 'd8f070b8-1597-45cf-b276-fce7d00f6582',
    name: 'Daniel 123',
    initials: 'D1',
    role: 'Software Development Intern',
    university: 'Technical University of Moldova',
    scores: {
      github: 100,
      python: 100,
      react: 100,
      sql: 100,
      'system-design': 100,
      'custom-test-6ffe4a': 100,
      'quiz-custom-test-6ffe4a': 100,
      'custom-test-2-e9993e': 100,
      'quiz-custom-test-2-e9993e': 100,
      'custom-test-3-e33917': 100,
      'quiz-custom-test-3-e33917': 100,
      Test: 100,
      'Test 2': 100,
      'Test 3': 100,
      test: 100,
      'test-2': 100,
      'test-3': 100,
    },
    status: 'ACCEPTED',
    isLiveApplicant: true,
    appliedDate: '2026-09-23',
    email: 'dan1@gmail.com',
    phone: '+373 69 123456',
    bio: 'Software Engineering student with 100% completion on all required assessment tests.',
  },
]

/**
 * Deterministically computes a realistic score for benchmark cohort profiles
 * based on candidate caliber / status and requirement name.
 */
export function getBenchmarkTierScore(
  candidateId: string,
  candidateStatus: CandidateStatus,
  baseScores: Record<string, number> = {},
  reqId: string = '',
  reqName: string = ''
): number {
  if (reqId && baseScores[reqId] !== undefined && baseScores[reqId] > 0) {
    return baseScores[reqId]
  }
  const cleanKey = (reqName || reqId).toLowerCase().replace(/[^a-z0-9]/g, '-')
  if (baseScores[cleanKey] !== undefined && baseScores[cleanKey] > 0) {
    return baseScores[cleanKey]
  }

  // Any quiz assessment: for 1-question or assessment quizzes, score is binary (100% or 0%)
  const isCustomQuiz = reqId.startsWith('custom-test') || reqName.toLowerCase().startsWith('test')
  if (isCustomQuiz) {
    switch (candidateStatus) {
      case 'ACCEPTED':
        return 100 // 1/1 questions correct
      case 'IN REVIEW':
        // Passed some, not all
        return ((candidateId.charCodeAt(candidateId.length - 1) + reqName.length) % 2 === 0) ? 100 : 0
      case 'PENDING':
      case 'REJECTED':
        return 0
      default:
        return 100
    }
  }

  const existingValues = Object.values(baseScores).filter((v) => typeof v === 'number' && v > 0)
  const avg =
    existingValues.length > 0
      ? existingValues.reduce((a, b) => a + b, 0) / existingValues.length
      : 75

  const idChar = candidateId ? candidateId.charCodeAt(candidateId.length - 1) : 65
  const nameLen = (reqName || reqId).length
  const seed = (idChar * 7 + nameLen * 11) % 7 - 3

  switch (candidateStatus) {
    case 'ACCEPTED':
      return 100
    case 'IN REVIEW':
      return Math.min(85, Math.max(74, Math.round(Math.max(avg, 79) + seed)))
    case 'PENDING':
      return Math.min(75, Math.max(65, Math.round(Math.max(avg, 70) + seed)))
    case 'REJECTED':
      return Math.min(62, Math.max(40, Math.round(Math.min(avg, 54) + seed)))
    default:
      return Math.round(avg + seed)
  }
}

/**
 * Helper to resolve candidate score for any requirement (matching by id, quizId, or normalized name).
 */
export function getCandidateSkillScore(
  candidate: Candidate,
  req: RequirementWeight
): number {
  if (candidate.scores[req.id] !== undefined) {
    return candidate.scores[req.id]
  }
  const stripId = req.id.replace(/^quiz-/, '')
  if (candidate.scores[stripId] !== undefined) {
    return candidate.scores[stripId]
  }
  const withQuizId = `quiz-${stripId}`
  if (candidate.scores[withQuizId] !== undefined) {
    return candidate.scores[withQuizId]
  }
  if (req.quizId && candidate.scores[req.quizId] !== undefined) {
    return candidate.scores[req.quizId]
  }
  if (req.name && candidate.scores[req.name] !== undefined) {
    return candidate.scores[req.name]
  }
  const cleanKey = req.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
  if (candidate.scores[cleanKey] !== undefined) {
    return candidate.scores[cleanKey]
  }
  const lowerName = req.name.toLowerCase()
  if (candidate.scores[lowerName] !== undefined) {
    return candidate.scores[lowerName]
  }
  // For benchmark profiles without an explicit score entry, dynamically derive it
  if (!candidate.isLiveApplicant) {
    return getBenchmarkTierScore(candidate.id, candidate.status, candidate.scores, req.id, req.name)
  }
  return 0
}

/**
 * Calculates a candidate's weighted match score given the active requirement weights.
 */
export function calculateMatchScore(
  candidate: Candidate,
  requirements: RequirementWeight[]
): number {
  const totalWeight = requirements.reduce((sum, r) => sum + r.weight, 0)
  if (totalWeight === 0) return 0

  let weightedScoreSum = 0
  for (const req of requirements) {
    const candidateScore = getCandidateSkillScore(candidate, req)
    weightedScoreSum += candidateScore * (req.weight / totalWeight)
  }

  return Math.round(weightedScoreSum)
}

/**
 * Checks if a candidate satisfies all individual skill gate thresholds.
 */
export function checkMeetsAllGates(
  candidate: Candidate,
  requirements: RequirementWeight[]
): boolean {
  return requirements.every((req) => {
    const candidateScore = getCandidateSkillScore(candidate, req)
    return candidateScore >= req.gate
  })
}

