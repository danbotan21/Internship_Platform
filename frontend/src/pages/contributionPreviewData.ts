import type { Contribution } from '../types/contribution'

export const makeContribution = (): Contribution => ({
  id: '',
  title: '',
  category: 'Development',
  workPeriod: '',
  description: '',
  linkedTask: '',
  ownRole: '',
  status: 'Draft',
  evidence: [],
  collaborators: [],
  evidenceNote: '',
  revisionNote: '',
  history: [],
  revision: 1,
  updatedAt: new Date().toISOString(),
})
