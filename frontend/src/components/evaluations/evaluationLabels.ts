import type { EvaluationStatus, EvaluationType, RubricVersionStatus } from '../../types/evaluation'

// Display texts for the codes returned by the evaluation API.

export const typeMeta: Record<EvaluationType, { label: string; short: string; meaning: string }> = {
  initial: {
    label: 'Initial evaluation',
    short: 'Initial',
    meaning: 'Early baseline after the first weeks of the internship.',
  },
  midTerm: {
    label: 'Mid-term evaluation',
    short: 'Mid-term',
    meaning: 'Progress over the middle period of the internship.',
  },
  final: {
    label: 'Final evaluation',
    short: 'Final',
    meaning: 'Overall internship performance at the end.',
  },
}

export const evaluationTypes = Object.keys(typeMeta) as EvaluationType[]

export const evaluationStatusMeta: Record<EvaluationStatus, { label: string; tone: string; dot: string }> = {
  draft: { label: 'Draft', tone: 'bg-[#fff4de] text-[#8a5200]', dot: 'bg-[#d99a2b]' },
  readyForReview: { label: 'Ready to finalize', tone: 'bg-[#eaf0ff] text-[#2f5aa8]', dot: 'bg-[#4b76c9]' },
  finalized: { label: 'Finalized', tone: 'bg-[#e3f3ea] text-[#17603f]', dot: 'bg-[#2c8a5a]' },
}

export const rubricStatusMeta: Record<RubricVersionStatus, { label: string; tone: string }> = {
  draft: { label: 'Draft', tone: 'bg-[#fff4de] text-[#8a5200]' },
  published: { label: 'Published', tone: 'bg-[#e3f3ea] text-[#17603f]' },
  archived: { label: 'Archived', tone: 'bg-[#eef1ef] text-[#5d6b64]' },
}

export function formatScore(value?: number | null) {
  return value === null || value === undefined ? '—' : Number(value).toFixed(1).replace(/\.0$/, '')
}

export function formatRating(value?: number | null) {
  return value === null || value === undefined ? '—' : Number(value).toFixed(1)
}

// A short verbal band for a 0–100 result.
export function scoreBand(score: number) {
  if (score >= 90) return { label: 'Excellent', tone: 'text-[#17603f]' }
  if (score >= 75) return { label: 'Strong', tone: 'text-[#17603f]' }
  if (score >= 60) return { label: 'Meets expectations', tone: 'text-[#2f5aa8]' }
  if (score >= 45) return { label: 'Needs improvement', tone: 'text-[#a3530f]' }
  return { label: 'Below expectations', tone: 'text-[#a1332b]' }
}
