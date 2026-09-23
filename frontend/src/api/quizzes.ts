import { apiGet, apiSend } from './client'
import type { QuizDifficulty } from '../types/quiz'
import type { AnalyticsSummary, UserQuizAttempt } from '../services/quizResultsDb'

export interface QuizDto {
  id: string
  slug: string
  title: string
  description: string
  category: string
  questionCount: number
  durationMinutes: number
  passingScore: number
  difficulty: QuizDifficulty
  isCustom: boolean
  mentorId?: string | null
  createdAt: string
  questions?: QuizQuestionDto[]
}

export interface QuizQuestionOptionDto {
  id: string
  label: 'A' | 'B' | 'C' | 'D' | string
  text: string
}

export interface QuizQuestionDto {
  id: string
  numberLabel: string
  category: string
  questionText: string
  hint?: string
  options: QuizQuestionOptionDto[]
  correctOptionId: string
  orderIndex: number
}

export interface QuizDetailDto extends QuizDto {
  questions: QuizQuestionDto[]
}

export interface CreateQuizQuestionPayload {
  numberLabel: string
  category: string
  questionText: string
  hint?: string
  options: QuizQuestionOptionDto[]
  correctOptionId: string
}

export interface CreateQuizPayload {
  title: string
  description: string
  category: string
  durationMinutes: number
  passingScore: number
  difficulty: QuizDifficulty
  questions: CreateQuizQuestionPayload[]
}

export interface SubmitQuizAttemptPayload {
  quizId?: string
  quizSlug?: string
  score: number
  totalQuestions: number
  percentage: number
  passingScore: number
  status?: string
  timeSpentSeconds: number
  isFlagged: boolean
  flagReason?: string
  violations?: { id: string; timestamp: string; type: string; description: string }[]
  answers?: {
    questionId?: string
    questionNumberLabel?: string
    selectedOptionId: string
    isCorrect: boolean
    category?: string
  }[]
  cohortWeek?: number
}

export async function fetchQuizzes(): Promise<QuizDto[]> {
  return apiGet<QuizDto[]>('/api/quizzes')
}

export async function fetchQuizByIdOrSlug(idOrSlug: string): Promise<QuizDetailDto> {
  return apiGet<QuizDetailDto>(`/api/quizzes/${idOrSlug}`)
}

export async function createCustomQuiz(payload: CreateQuizPayload): Promise<QuizDetailDto> {
  return apiSend<QuizDetailDto>('POST', '/api/quizzes', payload)
}

export async function updateCustomQuiz(id: string, payload: CreateQuizPayload): Promise<QuizDetailDto> {
  return apiSend<QuizDetailDto>('PUT', `/api/quizzes/${id}`, payload)
}

export async function deleteCustomQuiz(id: string): Promise<void> {
  return apiSend<void>('DELETE', `/api/quizzes/${id}`)
}

export async function submitQuizAttempt(
  idOrSlug: string,
  payload: SubmitQuizAttemptPayload
): Promise<UserQuizAttempt> {
  return apiSend<UserQuizAttempt>('POST', `/api/quizzes/${idOrSlug}/attempts`, payload)
}

export async function fetchQuizAnalytics(quizId?: string): Promise<AnalyticsSummary> {
  const query = quizId && quizId !== 'ALL' ? `?quizId=${encodeURIComponent(quizId)}` : ''
  return apiGet<AnalyticsSummary>(`/api/quizzes/analytics${query}`)
}

export async function fetchMyQuizAttempts(): Promise<UserQuizAttempt[]> {
  return apiGet<UserQuizAttempt[]>('/api/quizzes/attempts/my')
}
