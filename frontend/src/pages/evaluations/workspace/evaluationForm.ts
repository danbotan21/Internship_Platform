import type { EvaluationDetails, EvaluationFeedback, SaveEvaluationInput } from '../../../types/evaluation'

export type ScoreDraft = Record<string, { rating: number | null; comment: string }>
export type FeedbackDraft = Record<keyof EvaluationFeedback, string>

// What the mentor edits in a draft evaluation.
export type EvaluationDraft = { scores: ScoreDraft; feedback: FeedbackDraft }

export function toEvaluationDraft(evaluation: EvaluationDetails): EvaluationDraft {
  return {
    scores: Object.fromEntries(
      evaluation.criteria.map((item) => [item.criterionId, { rating: item.rating ?? null, comment: item.comment ?? '' }]),
    ),
    feedback: {
      strengths: evaluation.feedback.strengths ?? '',
      areasForImprovement: evaluation.feedback.areasForImprovement ?? '',
      nextSteps: evaluation.feedback.nextSteps ?? '',
      overallComment: evaluation.feedback.overallComment ?? '',
    },
  }
}

export function toSaveInput(evaluation: EvaluationDetails, draft: EvaluationDraft): SaveEvaluationInput {
  return {
    scores: evaluation.criteria.map((item) => ({
      criterionId: item.criterionId,
      rating: draft.scores[item.criterionId]?.rating ?? null,
      comment: draft.scores[item.criterionId]?.comment.trim() || null,
    })),
    strengths: draft.feedback.strengths.trim() || null,
    areasForImprovement: draft.feedback.areasForImprovement.trim() || null,
    nextSteps: draft.feedback.nextSteps.trim() || null,
    overallComment: draft.feedback.overallComment.trim() || null,
  }
}

// Weighted points of the ratings entered so far, before saving.
export function provisionalScore(evaluation: EvaluationDetails, scores: ScoreDraft) {
  const rated = evaluation.criteria.filter((item) => scores[item.criterionId]?.rating != null)
  return {
    rated: rated.length,
    points: rated.reduce((sum, item) => sum + (scores[item.criterionId].rating! / item.scaleMax) * item.weight, 0),
    maximum: rated.reduce((sum, item) => sum + item.weight, 0),
  }
}
