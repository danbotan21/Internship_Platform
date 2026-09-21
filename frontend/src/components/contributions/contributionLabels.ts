import {
  BookOpen,
  Code2,
  FileText,
  FlaskConical,
  GitCommitHorizontal,
  GitPullRequest,
  Image,
  Link2,
  Palette,
  Shapes,
  Telescope,
  type LucideIcon,
} from 'lucide-react'
import type {
  CollaboratorStatus,
  ContributionCategory,
  ContributionStatus,
  EvidenceType,
  RejectionReason,
  ReviewCriterion,
  ReviewOutcome,
} from '../../types/contribution'

// Display texts for the codes returned by the API, kept in one place.

export const statusMeta: Record<
  ContributionStatus,
  { label: string; tone: string; dot: string }
> = {
  draft: { label: 'Draft', tone: 'bg-[#fff4de] text-[#8a5200]', dot: 'bg-[#d99a2b]' },
  submitted: { label: 'In review', tone: 'bg-[#eaf0ff] text-[#2f5aa8]', dot: 'bg-[#4b76c9]' },
  changesRequested: {
    label: 'Changes requested',
    tone: 'bg-[#fdefe3] text-[#a3530f]',
    dot: 'bg-[#e07a26]',
  },
  validated: { label: 'Validated', tone: 'bg-[#e3f3ea] text-[#17603f]', dot: 'bg-[#2c8a5a]' },
  rejected: { label: 'Rejected', tone: 'bg-[#fde8e7] text-[#a1332b]', dot: 'bg-[#c9483e]' },
}

export const categoryMeta: Record<
  ContributionCategory,
  { label: string; icon: LucideIcon; requirement: string }
> = {
  development: {
    label: 'Development',
    icon: Code2,
    requirement: 'At least one commit or pull request authored by you.',
  },
  uiUxDesign: {
    label: 'UI / UX design',
    icon: Palette,
    requirement: 'A screenshot or a design link (e.g. Figma).',
  },
  testing: {
    label: 'Testing',
    icon: FlaskConical,
    requirement: 'A commit / pull request authored by you or a test report (PDF).',
  },
  documentation: {
    label: 'Documentation',
    icon: BookOpen,
    requirement: 'A document (PDF) or a commit authored by you.',
  },
  research: {
    label: 'Research',
    icon: Telescope,
    requirement: 'A document (PDF) or a reference link.',
  },
  other: {
    label: 'Other',
    icon: Shapes,
    requirement: 'At least one screenshot, document or GitHub item.',
  },
}

export const categories = Object.keys(categoryMeta) as ContributionCategory[]

export const evidenceTypeMeta: Record<EvidenceType, { label: string; icon: LucideIcon }> = {
  githubCommit: { label: 'Commit', icon: GitCommitHorizontal },
  githubPullRequest: { label: 'Pull request', icon: GitPullRequest },
  image: { label: 'Screenshot', icon: Image },
  document: { label: 'Document', icon: FileText },
  link: { label: 'Link', icon: Link2 },
}

export const criterionMeta: Record<ReviewCriterion, { label: string; question: string }> = {
  evidenceVerifiable: {
    label: 'Evidence is verifiable',
    question: 'Does the evidence really show the described work?',
  },
  matchesDeclaredRole: {
    label: 'Matches the declared role',
    question: 'Did the student personally do what they claim?',
  },
  attributionAccurate: {
    label: 'Attribution is accurate',
    question: 'Are all collaborators and their roles correct?',
  },
  withinInternshipScope: {
    label: 'Within internship scope',
    question: 'Is this work part of the internship project?',
  },
  qualityAcceptable: {
    label: 'Quality is acceptable',
    question: 'Is the delivered work of acceptable quality?',
  },
}

export const criteria = Object.keys(criterionMeta) as ReviewCriterion[]

export const outcomeMeta: Record<ReviewOutcome, { label: string; tone: string }> = {
  validated: { label: 'Validated', tone: 'text-[#17603f]' },
  changesRequested: { label: 'Changes requested', tone: 'text-[#a3530f]' },
  rejected: { label: 'Rejected', tone: 'text-[#a1332b]' },
}

export const rejectionReasonLabels: Record<RejectionReason, string> = {
  evidenceNotVerifiable: 'Evidence cannot be verified',
  outsideInternshipScope: 'Work is outside the internship scope',
  duplicate: 'Duplicate of another contribution',
  attributionIncorrect: 'Attribution is incorrect',
  other: 'Other',
}

export const collaboratorStatusMeta: Record<CollaboratorStatus, { label: string; tone: string }> = {
  pending: { label: 'Awaiting confirmation', tone: 'bg-[#fff4de] text-[#8a5200]' },
  confirmed: { label: 'Confirmed', tone: 'bg-[#e3f3ea] text-[#17603f]' },
  disputed: { label: 'Disputed', tone: 'bg-[#fde8e7] text-[#a1332b]' },
}
