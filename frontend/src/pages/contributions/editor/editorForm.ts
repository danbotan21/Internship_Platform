import type { ContributionDetails, ContributionReview, DraftInput } from '../../../types/contribution'

export type EditorStep = 'details' | 'evidence' | 'team' | 'submit'

export const editorSteps: { value: EditorStep; label: string; checks: string[] }[] = [
  {
    value: 'details',
    label: 'Details',
    checks: ['mentor', 'title', 'description', 'ownRole', 'workPeriod'],
  },
  { value: 'evidence', label: 'Evidence', checks: ['evidence'] },
  { value: 'team', label: 'Team', checks: ['collaborators'] },
  { value: 'submit', label: 'Review & submit', checks: ['feedback', 'revisionNote', 'changed'] },
]

export const emptyDraft = (): DraftInput => ({
  title: '',
  category: 'development',
  workStartDate: null,
  workEndDate: null,
  description: '',
  ownRole: '',
  linkedIssueUrl: null,
  revisionNote: null,
  feedbackResponses: [],
})

// The change request the student is answering, if any.
export function openChangeRequest(contribution: ContributionDetails | null): ContributionReview | null {
  if (contribution?.status !== 'changesRequested') return null
  const latest = contribution.reviews[0]
  return latest?.outcome === 'changesRequested' ? latest : null
}

export function toDraft(contribution: ContributionDetails): DraftInput {
  const revision = contribution.currentRevision
  const changeRequest = openChangeRequest(contribution)
  return {
    title: revision.title,
    category: revision.category,
    workStartDate: revision.workStartDate ?? null,
    workEndDate: revision.workEndDate ?? null,
    description: revision.description,
    ownRole: revision.ownRole,
    linkedIssueUrl: revision.linkedIssue?.url ?? null,
    revisionNote: revision.revisionNote ?? null,
    feedbackResponses:
      changeRequest?.feedbackItems.map((item) => ({
        feedbackItemId: item.id,
        response: item.response ?? '',
      })) ?? [],
  }
}

// Branch names in the team repository follow "firstname_lastname".
export function branchForName(fullName: string) {
  return fullName.trim().toLowerCase().replace(/\s+/g, '_')
}
