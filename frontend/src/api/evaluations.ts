import type {
  CreateEvaluationInput,
  EvaluationContext,
  EvaluationDetails,
  EvaluationListItem,
  MentorRubric,
  RubricCriterionInput,
  RubricVersion,
  RubricVersionSummary,
  SaveEvaluationInput,
  StudentCriteria,
  StudentEvaluationOverview,
} from '../types/evaluation'
import { jsonRequest, requestJson } from './http'

const base = '/api/evaluations'

const rubric = (path: string, init?: RequestInit) =>
  requestJson<MentorRubric>(`${base}/rubric${path}`, init)

const mentorEvaluation = (path: string, init?: RequestInit) =>
  requestJson<EvaluationDetails>(`${base}/mentor${path}`, init)

export const evaluationApi = {
  // Mentor: rubric
  getRubric: () => rubric(''),
  rubricHistory: () =>
    requestJson<RubricVersionSummary[]>(`${base}/rubric/versions`),
  rubricVersion: (id: string) =>
    requestJson<RubricVersion>(`${base}/rubric/versions/${id}`),
  createDraft: (source: 'published' | 'template' | 'empty') =>
    rubric('/draft', jsonRequest('POST', { source })),
  updateDraft: (title: string, changeNote: string | null) =>
    rubric('/draft', jsonRequest('PUT', { title, changeNote })),
  discardDraft: () => rubric('/draft', { method: 'DELETE' }),
  addCriterion: (input: RubricCriterionInput) =>
    rubric('/draft/criteria', jsonRequest('POST', input)),
  updateCriterion: (id: string, input: RubricCriterionInput) =>
    rubric(`/draft/criteria/${id}`, jsonRequest('PUT', input)),
  moveCriterion: (id: string, offset: -1 | 1) =>
    rubric(`/draft/criteria/${id}/move`, jsonRequest('POST', { offset })),
  removeCriterion: (id: string) =>
    rubric(`/draft/criteria/${id}`, { method: 'DELETE' }),
  publishDraft: () => rubric('/draft/publish', { method: 'POST' }),

  // Mentor: evaluations
  listForMentor: () => requestJson<EvaluationListItem[]>(`${base}/mentor`),
  mentorStudents: () =>
    requestJson<StudentEvaluationOverview[]>(`${base}/mentor/students`),
  create: (input: CreateEvaluationInput) =>
    mentorEvaluation('', jsonRequest('POST', input)),
  getForMentor: (id: string) => mentorEvaluation(`/${id}`),
  save: (id: string, input: SaveEvaluationInput) =>
    mentorEvaluation(`/${id}`, jsonRequest('PUT', input)),
  remove: (id: string) =>
    requestJson<void>(`${base}/mentor/${id}`, { method: 'DELETE' }),
  markReady: (id: string) =>
    mentorEvaluation(`/${id}/ready`, { method: 'POST' }),
  reopen: (id: string) => mentorEvaluation(`/${id}/reopen`, { method: 'POST' }),
  finalize: (id: string) =>
    mentorEvaluation(`/${id}/finalize`, { method: 'POST' }),
  context: (id: string) =>
    requestJson<EvaluationContext>(`${base}/mentor/${id}/context`),

  // Student
  listMine: () => requestJson<EvaluationListItem[]>(`${base}/student`),
  getMine: (id: string) =>
    requestJson<EvaluationDetails>(`${base}/student/${id}`),
  myCriteria: () => requestJson<StudentCriteria>(`${base}/student/criteria`),
  acknowledge: (id: string, response: string | null) =>
    requestJson<EvaluationDetails>(
      `${base}/student/${id}/acknowledge`,
      jsonRequest('POST', { response }),
    ),
}
