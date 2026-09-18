import type {
  Category,
  Collaborator,
  CollaboratorParticipationStatus,
  Contribution,
  ContributionEvent,
  Evidence,
  Status,
} from '../types/contribution'

type EvidenceDto = {
  id: string
  type: 'link' | 'file'
  name: string
  url: string
}
type CollaboratorDto = {
  id: string
  name: string
  email: string
  role: string
  status: CollaboratorParticipationStatus
  disputeReason?: string
  resolutionNote?: string
  addedAtUtc: string
  updatedAtUtc: string
}
type ReviewDto = {
  id?: string
  mentorId?: string
  feedback?: string
  note?: string
  reason?: string
  decision?: 'Validated' | 'Rejected' | 'validated' | 'rejected'
  decidedAtUtc?: string
  changesRequestedAtUtc?: string
}
type RevisionDto = {
  revisionNumber: number
  title: string
  category: Category
  workPeriod: string
  description: string
  ownRole: string
  linkedTaskReference?: string
  evidenceNote?: string
  revisionNote?: string
  evidence: EvidenceDto[]
}
type HistoryDto = {
  id: string
  type:
    | 'Submitted'
    | 'ChangesRequested'
    | 'Resubmitted'
    | 'Validated'
    | 'Rejected'
  revisionNumber: number
  occurredAtUtc: string
  note?: string
}
type ContributionDetailsDto = {
  id: string
  studentDisplayName?: string
  status: Status
  currentRevisionNumber: number
  updatedAtUtc: string
  submittedAtUtc?: string
  currentRevision: RevisionDto
  collaborators?: CollaboratorDto[]
  latestReview?: ReviewDto
  latestDecision?: ReviewDto
  history: HistoryDto[]
}
type ContributionListItemDto = { id: string }

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/contributions${path}`, init)
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string
    } | null
    throw new Error(body?.message || `Request failed (${response.status}).`)
  }
  return (await response.json()) as T
}

function mapDetails(dto: ContributionDetailsDto): Contribution {
  const revision = dto.currentRevision
  const evidence: Evidence[] = revision.evidence.map((item) => ({
    id: item.id,
    kind: item.type,
    name: item.name,
    url: item.url,
  }))
  const kinds: Record<HistoryDto['type'], ContributionEvent['kind']> = {
    Submitted: 'submitted',
    ChangesRequested: 'changes-requested',
    Resubmitted: 'resubmitted',
    Validated: 'validated',
    Rejected: 'rejected',
  }
  const decisionDto =
    dto.latestDecision ??
    (dto.latestReview?.decision ? dto.latestReview : undefined)
  const decisionType = decisionDto?.decision?.toLowerCase()
  const collaborators: Collaborator[] = (dto.collaborators ?? []).map(
    (item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      role: item.role,
      status: item.status,
      disputeReason: item.disputeReason,
      resolutionNote: item.resolutionNote,
      addedAt: item.addedAtUtc,
      updatedAt: item.updatedAtUtc,
    }),
  )
  return {
    id: dto.id,
    title: revision.title,
    category: revision.category,
    workPeriod: revision.workPeriod,
    description: revision.description,
    linkedTask: revision.linkedTaskReference ?? '',
    ownRole: revision.ownRole,
    status: dto.status,
    evidence,
    collaborators,
    evidenceNote: revision.evidenceNote ?? '',
    mentorFeedback: dto.latestReview?.feedback,
    reviewDecision:
      decisionType === 'validated' || decisionType === 'rejected'
        ? {
            type: decisionType,
            mentorId: decisionDto?.mentorId,
            note: decisionDto?.note ?? decisionDto?.feedback,
            reason: decisionDto?.reason,
            at: decisionDto?.decidedAtUtc,
          }
        : undefined,
    revisionNote: revision.revisionNote ?? '',
    history: dto.history.map((item) => ({
      id: item.id,
      kind: kinds[item.type],
      at: item.occurredAtUtc,
      revision: item.revisionNumber,
      note: item.note,
    })),
    revision: dto.currentRevisionNumber,
    updatedAt: dto.updatedAtUtc,
    submittedAt: dto.submittedAtUtc,
    studentDisplayName: dto.studentDisplayName,
  }
}

function draftPayload(item: Contribution) {
  return {
    title: item.title,
    category: item.category,
    workPeriod: item.workPeriod,
    description: item.description,
    ownRole: item.ownRole,
    linkedTaskReference: item.linkedTask || undefined,
    evidenceNote: item.evidenceNote || undefined,
    revisionNote: item.revisionNote || undefined,
  }
}

async function hydrateList(path: string, mentor = false) {
  const list = await api<ContributionListItemDto[]>(path)
  return Promise.all(
    list.map((item) =>
      api<ContributionDetailsDto>(
        mentor ? `/mentor/${item.id}` : `/${item.id}`,
      ).then(mapDetails),
    ),
  )
}

export const contributionApi = {
  listStudent: () => hydrateList(''),
  listMentor: () => hydrateList('/mentor/queue', true),
  getStudent: (id: string) =>
    api<ContributionDetailsDto>(`/${id}`).then(mapDetails),
  getMentor: (id: string) =>
    api<ContributionDetailsDto>(`/mentor/${id}`).then(mapDetails),
  saveDraft: (item: Contribution) =>
    api<ContributionDetailsDto>(item.id ? `/${item.id}` : '', {
      method: item.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draftPayload(item)),
    }).then(mapDetails),
  addLink: (id: string, name: string, url: string) =>
    api<ContributionDetailsDto>(`/${id}/evidence/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url }),
    }).then(mapDetails),
  addFile: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    form.append('name', file.name)
    return api<ContributionDetailsDto>(`/${id}/evidence/files`, {
      method: 'POST',
      body: form,
    }).then(mapDetails)
  },
  removeEvidence: (id: string, evidenceId: string) =>
    api<ContributionDetailsDto>(`/${id}/evidence/${evidenceId}`, {
      method: 'DELETE',
    }).then(mapDetails),
  submit: (item: Contribution) =>
    api<ContributionDetailsDto>(`/${item.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revisionNote: item.revisionNote || undefined }),
    }).then(mapDetails),
  requestChanges: (id: string, feedback: string) =>
    api<ContributionDetailsDto>(`/mentor/${id}/request-changes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback }),
    }).then(mapDetails),
  validate: (id: string, note?: string) =>
    api<ContributionDetailsDto>(`/mentor/${id}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: note?.trim() || undefined }),
    }).then(mapDetails),
  reject: (id: string, reason: string, explanation: string) =>
    api<ContributionDetailsDto>(`/mentor/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, feedback: explanation.trim() }),
    }).then(mapDetails),
  addCollaborator: (
    id: string,
    input: { name: string; email: string; role: string },
  ) =>
    api<ContributionDetailsDto>(`/${id}/collaborators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }).then(mapDetails),
  updateCollaboratorRole: (id: string, collaboratorId: string, role: string) =>
    api<ContributionDetailsDto>(`/${id}/collaborators/${collaboratorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    }).then(mapDetails),
  confirmParticipation: (id: string, collaboratorId: string) =>
    api<ContributionDetailsDto>(
      `/${id}/collaborators/${collaboratorId}/confirm`,
      {
        method: 'POST',
        headers: { 'X-Collaborator-Id': collaboratorId },
      },
    ).then(mapDetails),
  disputeParticipation: (id: string, collaboratorId: string, reason: string) =>
    api<ContributionDetailsDto>(
      `/${id}/collaborators/${collaboratorId}/dispute`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Collaborator-Id': collaboratorId,
        },
        body: JSON.stringify({ reason }),
      },
    ).then(mapDetails),
  resolveAttribution: (id: string, collaboratorId: string, note: string) =>
    api<ContributionDetailsDto>(
      `/${id}/collaborators/${collaboratorId}/resolve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      },
    ).then(mapDetails),
}
