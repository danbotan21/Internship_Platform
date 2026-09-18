import type {
  CollaboratorInput,
  ContributionDetails,
  ContributionListItem,
  DraftInput,
  GitHubCommitOption,
  GitHubLiveStatus,
  GitHubPullRequestOption,
  GitHubRepositoryOption,
  ReviewInput,
} from '../types/contribution'
import type { InternshipMember } from '../types/user'
import { jsonRequest, requestBlob, requestJson } from './http'

const base = '/api/contributions'

const details = (path: string, init?: RequestInit) =>
  requestJson<ContributionDetails>(`${base}${path}`, init)

export const contributionApi = {
  // Student
  listMine: () => requestJson<ContributionListItem[]>(base),
  getMine: (id: string) => details(`/${id}`),
  create: (input: DraftInput) => details('', jsonRequest('POST', input)),
  save: (id: string, input: DraftInput) => details(`/${id}`, jsonRequest('PUT', input)),
  deleteDraft: (id: string) =>
    requestJson<void>(`${base}/${id}`, { method: 'DELETE' }),
  submit: (id: string, revisionNote?: string | null) =>
    details(`/${id}/submit`, jsonRequest('POST', { revisionNote })),

  // Evidence
  addGitHub: (id: string, url: string) =>
    details(`/${id}/evidence/github`, jsonRequest('POST', { url })),
  addLink: (id: string, name: string, url: string, caption: string) =>
    details(`/${id}/evidence/links`, jsonRequest('POST', { name, url, caption })),
  addFile: (id: string, file: File, caption: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('caption', caption)
    return details(`/${id}/evidence/files`, { method: 'POST', body: form })
  },
  removeEvidence: (id: string, evidenceId: string) =>
    details(`/${id}/evidence/${evidenceId}`, { method: 'DELETE' }),
  // `url` is the protected download URL returned in the evidence DTO.
  downloadFile: (url: string) => requestBlob(url),
  gitHubStatus: (id: string) =>
    requestJson<GitHubLiveStatus[]>(`${base}/${id}/github-status`),

  // GitHub picker
  gitHubRepositories: () =>
    requestJson<GitHubRepositoryOption[]>(`${base}/github/repositories`),
  gitHubCommits: (repository: string, branch: string) =>
    requestJson<GitHubCommitOption[]>(
      `${base}/github/commits?repository=${encodeURIComponent(repository)}&branch=${encodeURIComponent(branch)}`,
    ),
  gitHubPullRequests: (repository: string) =>
    requestJson<GitHubPullRequestOption[]>(
      `${base}/github/pull-requests?repository=${encodeURIComponent(repository)}`,
    ),

  // Collaborators (author side)
  teamMembers: () => requestJson<InternshipMember[]>(`${base}/team-members`),
  addCollaborator: (id: string, input: CollaboratorInput) =>
    details(`/${id}/collaborators`, jsonRequest('POST', input)),
  updateCollaborator: (
    id: string,
    collaboratorId: string,
    input: Omit<CollaboratorInput, 'userId'> & { resolutionNote?: string | null },
  ) => details(`/${id}/collaborators/${collaboratorId}`, jsonRequest('PUT', input)),
  removeCollaborator: (id: string, collaboratorId: string) =>
    details(`/${id}/collaborators/${collaboratorId}`, { method: 'DELETE' }),

  // Collaborator side
  listAttributed: () => requestJson<ContributionListItem[]>(`${base}/attributed`),
  getAttributed: (id: string) => details(`/attributed/${id}`),
  confirmParticipation: (id: string) =>
    details(`/attributed/${id}/confirm`, { method: 'POST' }),
  disputeParticipation: (id: string, reason: string) =>
    details(`/attributed/${id}/dispute`, jsonRequest('POST', { reason })),

  // Mentor
  listForMentor: () => requestJson<ContributionListItem[]>(`${base}/mentor`),
  getForMentor: (id: string) => details(`/mentor/${id}`),
  review: (id: string, input: ReviewInput) =>
    details(`/mentor/${id}/review`, jsonRequest('POST', input)),
}
