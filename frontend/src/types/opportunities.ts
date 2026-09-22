export interface Opportunity {
  id: string
  title: string
  company: string
  location: string
  locationType: 'On-site' | 'Hybrid' | 'Remote' | string
  type: 'Full-time' | 'Part-time' | string
  duration: string
  durationCategory: '1-3 months' | '3-6 months' | '6+ months' | string
  field: string
  tags: string[]
  logoBg: string
  logoType: 'leaf' | 'code' | 'chart' | 'check' | string
  aboutCompany: string
  aboutInternship: string
  responsibilities: string[]
  requirements: string[]
  technologies: string[]
  companyLogo?: string | null
  deadline?: string
  startDate?: string
  endDate?: string
  createdAt?: string
  status?: 'Open' | 'Closed' | 'Draft' | string
  applicationsCount?: number
  isSaved?: boolean
  hasApplied?: boolean
}

export interface PaginationMeta {
  totalItems: number
  totalPages: number
  currentPage: number
  limit: number
}

export interface OpportunityListResult {
  items: Opportunity[]
  pagination: PaginationMeta
}

export interface OpportunityQueryParams {
  search?: string
  status?: string
  field?: string
  type?: string
  locationType?: string
  durationCategory?: string
  page?: number
  limit?: number
}

export interface CreateOpportunityPayload {
  title: string
  description: string
  location: string
  locationType: string
  type: string
  field: string
  durationCategory: string
  company: string
  companyLogo?: string | null
  logoBg?: string
  logoType?: string
  aboutCompany: string
  aboutInternship: string
  responsibilities: string[]
  requirements: string[]
  technologies: string[]
  deadline: string
  startDate?: string
  endDate?: string
  status?: 'Open' | 'Closed' | 'Draft'
}

export interface StudentApplicationListItem {
  id: string
  opportunityId: string
  opportunityTitle: string
  company: string
  status: 'Pending' | 'Under Review' | 'Accepted' | 'Rejected' | string
  appliedAt: string
  updatedAt: string
}

export interface ApplicationDetail {
  id: string
  opportunityId: string
  opportunityTitle: string
  company: string
  firstName: string
  lastName: string
  email: string
  phoneCountryCode: string
  phoneNumber: string
  educationLevel: string
  fieldOfStudy: string
  expectedGraduation: string
  availability: string
  motivation: string
  resumePath: string
  coverLetterPath?: string | null
  additionalFilePaths: string[]
  status: 'Pending' | 'Under Review' | 'Accepted' | 'Rejected' | string
  reviewFeedback?: string | null
  reviewedAt?: string | null
  appliedAt: string
}

export interface ReviewApplicationPayload {
  status: 'Pending' | 'Under Review' | 'Accepted' | 'Rejected' | string
  feedback: string
}

// Normalizer to format API data to match frontend requirements
export function normalizeOpportunity(raw: any): Opportunity {
  const normType =
    raw.type === 'FullTime' ? 'Full-time' :
    raw.type === 'PartTime' ? 'Part-time' :
    raw.type || 'Full-time'

  const normLocType =
    raw.locationType === 'OnSite' ? 'On-site' :
    raw.locationType || 'On-site'

  const duration = raw.durationCategory || '3-6 months'

  const logoBg = raw.logoBg || (
    raw.field === 'Software Engineering' ? 'bg-[#1b5e3a]' :
    raw.field === 'Web Development' ? 'bg-[#2563eb]' :
    raw.field === 'Data & Analytics' ? 'bg-[#0f172a]' :
    'bg-[#ea580c]'
  )

  const logoType = raw.logoType || (
    raw.field === 'Software Engineering' ? 'leaf' :
    raw.field === 'Web Development' ? 'code' :
    raw.field === 'Data & Analytics' ? 'chart' :
    'check'
  )

  return {
    id: String(raw.id),
    title: raw.title || '',
    company: raw.company || '',
    location: raw.location || '',
    locationType: normLocType,
    type: normType,
    duration: raw.duration || duration,
    durationCategory: raw.durationCategory || '3-6 months',
    field: raw.field || 'Software Engineering',
    tags: Array.isArray(raw.tags) && raw.tags.length > 0 ? raw.tags : [raw.field || 'Internship'],
    logoBg,
    logoType,
    aboutCompany: raw.aboutCompany || '',
    aboutInternship: raw.aboutInternship || raw.description || '',
    responsibilities: Array.isArray(raw.responsibilities) ? raw.responsibilities : [],
    requirements: Array.isArray(raw.requirements) ? raw.requirements : [],
    technologies: Array.isArray(raw.technologies) ? raw.technologies : [],
    companyLogo: raw.companyLogo,
    deadline: raw.deadline ? new Date(raw.deadline).toISOString().split('T')[0] : '',
    startDate: raw.startDate ? new Date(raw.startDate).toISOString().split('T')[0] : '',
    endDate: raw.endDate ? new Date(raw.endDate).toISOString().split('T')[0] : '',
    createdAt: raw.createdAt,
    status: raw.status || 'Open',
    applicationsCount: raw.applicationsCount || 0,
    isSaved: Boolean(raw.isSaved),
    hasApplied: Boolean(raw.hasApplied),
  }
}

