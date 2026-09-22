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

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    title: 'Software Development Intern',
    company: 'GreenTech Solutions',
    location: 'Chișinău, MD',
    locationType: 'On-site',
    type: 'Full-time',
    duration: '3–6 months',
    durationCategory: '3-6 months',
    field: 'Software Engineering',
    tags: ['Software Engineering', 'Internship'],
    logoBg: 'bg-[#1b5e3a]',
    logoType: 'leaf',
    aboutCompany:
      'GreenTech Solutions is a technology company focused on creating innovative solutions for a more sustainable future. We develop digital products that help businesses reduce their environmental footprint and operate more efficiently.',
    aboutInternship:
      'Join our engineering team and work on real products that make a difference. As a Software Development Intern, you will collaborate with experienced developers, contribute to meaningful features, and gain hands-on experience with modern technologies.',
    responsibilities: [
      'Work on backend and/or frontend features',
      'Collaborate with the development team',
      'Write clean, maintainable code',
      'Participate in code reviews',
      'Learn and apply best practices',
    ],
    requirements: [
      'Currently enrolled in a relevant field (Computer Science, Software Engineering, etc.)',
      'Basic knowledge of C# and .NET (or C / C++)',
      'Eagerness to learn and a problem-solving mindset',
      'Good communication skills',
      'Passion for technology and sustainability',
    ],
    technologies: ['C#', '.NET', 'SQL', 'C++', 'Azure', 'Git', 'Docker'],
  },
  {
    id: '2',
    title: 'Frontend Intern',
    company: 'TechVision',
    location: 'Remote',
    locationType: 'Remote',
    type: 'Part-time',
    duration: '3 months',
    durationCategory: '1-3 months',
    field: 'Web Development',
    tags: ['Web Development', 'Internship'],
    logoBg: 'bg-[#2563eb]',
    logoType: 'code',
    aboutCompany:
      'TechVision is a leading digital studio crafting high-performance web and mobile applications for clients around the globe. We push the boundaries of user experience and visual design.',
    aboutInternship:
      'We are looking for an enthusiastic Frontend Intern to build responsive, modern interfaces using React and modern CSS. You will work closely with UI designers and senior frontend developers to deliver polished web experiences.',
    responsibilities: [
      'Develop scalable React components and web interfaces',
      'Translate UI design mockups into pixel-perfect web pages',
      'Optimize application performance and responsiveness',
      'Fix UI bugs and improve user accessibility',
      'Participate in daily standups and sprint planning',
    ],
    requirements: [
      'Proficiency in JavaScript/TypeScript, HTML5, and CSS3',
      'Familiarity with React and modern frontend build tools',
      'Understanding of responsive design principles',
      'Strong attention to detail and UI aesthetic sense',
      'Ability to work remotely and manage time effectively',
    ],
    technologies: [
      'TypeScript',
      'React',
      'JavaScript',
      'Tailwind CSS',
      'Vite',
      'Git',
      'REST API',
    ],
  },
  {
    id: '3',
    title: 'Data Analytics Intern',
    company: 'NextGen Analytics',
    location: 'Chișinău, MD',
    locationType: 'Hybrid',
    type: 'Full-time',
    duration: '6 months',
    durationCategory: '6+ months',
    field: 'Data & Analytics',
    tags: ['Data & Analytics', 'Internship'],
    logoBg: 'bg-[#0f172a]',
    logoType: 'chart',
    aboutCompany:
      'NextGen Analytics builds enterprise data pipelines, predictive AI models, and real-time visualization dashboards for global clients.',
    aboutInternship:
      'Gain hands-on experience building SQL queries, Python data analysis scripts, and Business Intelligence dashboards working directly with data engineers.',
    responsibilities: [
      'Analyze complex dataset queries using SQL and Python',
      'Build BI reports and automated data pipelines',
      'Assist senior data scientists with data cleaning and ETL process',
    ],
    requirements: [
      'Knowledge of Python, SQL, and basic statistical analysis',
      'Familiarity with Pandas, NumPy, or PowerBI',
      'Analytical mindset with strong problem-solving skills',
    ],
    technologies: ['Python', 'SQL', 'PowerBI', 'Pandas', 'PostgreSQL'],
  },
  {
    id: '4',
    title: 'QA Automation Intern',
    company: 'AlphaSystems',
    location: 'Chișinău, MD',
    locationType: 'On-site',
    type: 'Full-time',
    duration: '3 months',
    durationCategory: '1-3 months',
    field: 'Quality Assurance',
    tags: ['Quality Assurance', 'Internship'],
    logoBg: 'bg-[#ea580c]',
    logoType: 'check',
    aboutCompany:
      'AlphaSystems delivers high-reliability fintech software used by millions of transaction users.',
    aboutInternship:
      'Learn automated testing frameworks, write Java/Python automation test suites, and perform manual & API testing for enterprise web services.',
    responsibilities: [
      'Write end-to-end automation scripts using Java and Selenium',
      'Perform API integration testing with Postman',
      'Document bug reports and verify fix releases',
    ],
    requirements: [
      'Basic knowledge of Java or Python programming',
      'Understanding of software testing fundamentals',
      'Strong logical thinking and attention to edge cases',
    ],
    technologies: ['Java', 'Selenium', 'Python', 'Postman', 'Git'],
  },
]
