import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  X,
  Leaf,
  Code2,
  BarChart3,
  CheckCircle2,
  Users,
  Pencil,
} from 'lucide-react'
import { CustomSelect } from '../components/CustomSelect'

interface MentorOpportunity {
  id: string
  title: string
  company: string
  location: string
  locationType: 'On-site' | 'Hybrid' | 'Remote'
  type: 'Full-time' | 'Part-time'
  duration: string
  applicationsCount: number
  status: 'Open' | 'Closed' | 'Draft'
  createdOn: string
  deadline: string
  logoBg: string
  logoType: 'leaf' | 'code' | 'chart' | 'check'
  tags: string[]
  aboutCompany: string
  aboutInternship: string
  responsibilities: string[]
  requirements: string[]
  technologies: string[]
}

const MOCK_MENTOR_OPPORTUNITIES: MentorOpportunity[] = [
  {
    id: '1',
    title: 'Software Development Intern',
    company: 'GreenTech Solutions',
    location: 'Chișinău, MD',
    locationType: 'On-site',
    type: 'Full-time',
    duration: '3–6 months',
    applicationsCount: 12,
    status: 'Open',
    createdOn: 'Sep 10, 2025',
    deadline: 'Dec 31, 2025',
    logoBg: 'bg-[#1b5e3a]',
    logoType: 'leaf',
    tags: ['Software Engineering', 'Internship'],
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
    ],
    technologies: ['C#', '.NET', 'SQL', 'C++', 'Azure', 'Git', 'Docker'],
  },
  {
    id: '3',
    title: 'Data Analytics Intern',
    company: 'NextGen Analytics',
    location: 'Chișinău, MD',
    locationType: 'Hybrid',
    type: 'Full-time',
    duration: '6 months',
    applicationsCount: 8,
    status: 'Open',
    createdOn: 'Aug 28, 2025',
    deadline: 'Nov 30, 2025',
    logoBg: 'bg-[#0f172a]',
    logoType: 'chart',
    tags: ['Data & Analytics', 'Internship'],
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
    location: 'Remote',
    locationType: 'Remote',
    type: 'Part-time',
    duration: '3 months',
    applicationsCount: 5,
    status: 'Closed',
    createdOn: 'Aug 1, 2025',
    deadline: 'Sep 15, 2025',
    logoBg: 'bg-[#ea580c]',
    logoType: 'check',
    tags: ['Quality Assurance', 'Internship'],
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
  {
    id: '2',
    title: 'Frontend Intern',
    company: 'TechVision',
    location: 'Chișinău, MD',
    locationType: 'Remote',
    type: 'Full-time',
    duration: '3 months',
    applicationsCount: 20,
    status: 'Open',
    createdOn: 'Jul 15, 2025',
    deadline: 'Oct 31, 2025',
    logoBg: 'bg-[#2563eb]',
    logoType: 'code',
    tags: ['Web Development', 'Internship'],
    aboutCompany:
      'TechVision is a leading digital studio crafting high-performance web and mobile applications for clients around the globe.',
    aboutInternship:
      'We are looking for an enthusiastic Frontend Intern to build responsive, modern interfaces using React and modern CSS.',
    responsibilities: [
      'Develop scalable React components and web interfaces',
      'Translate UI design mockups into pixel-perfect web pages',
      'Optimize application performance and responsiveness',
      'Fix UI bugs and improve user accessibility',
    ],
    requirements: [
      'Proficiency in JavaScript/TypeScript, HTML5, and CSS3',
      'Familiarity with React and modern frontend build tools',
      'Understanding of responsive design principles',
      'Strong attention to detail and UI aesthetic sense',
    ],
    technologies: ['TypeScript', 'React', 'JavaScript', 'Tailwind CSS', 'Vite', 'Git'],
  },
  {
    id: '5',
    title: 'Technical Writing Intern',
    company: 'GreenTech Solutions',
    location: 'Remote',
    locationType: 'Remote',
    type: 'Part-time',
    duration: '2 months',
    applicationsCount: 3,
    status: 'Draft',
    createdOn: 'Jul 5, 2025',
    deadline: '—',
    logoBg: 'bg-gray-600',
    logoType: 'code',
    tags: ['Technical Writing', 'Internship'],
    aboutCompany:
      'GreenTech Solutions is a technology company focused on creating innovative solutions for a more sustainable future.',
    aboutInternship:
      'As a Technical Writing Intern, you will work with our engineering and product teams to produce high-quality documentation, guides, and knowledge-base articles.',
    responsibilities: [
      'Write and maintain technical documentation',
      'Create user guides and API references',
      'Collaborate with developers to understand product features',
    ],
    requirements: [
      'Excellent written English communication skills',
      'Ability to understand technical concepts',
      'Experience with Markdown or documentation tools',
    ],
    technologies: ['Markdown', 'Git', 'Confluence', 'Jira'],
  },
  {
    id: '6',
    title: 'Sustainability Research Intern',
    company: 'GreenTech Solutions',
    location: 'Chișinău, MD',
    locationType: 'On-site',
    type: 'Full-time',
    duration: '4 months',
    applicationsCount: 15,
    status: 'Closed',
    createdOn: 'Jun 20, 2025',
    deadline: 'Aug 31, 2025',
    logoBg: 'bg-[#1b5e3a]',
    logoType: 'leaf',
    tags: ['Research', 'Sustainability'],
    aboutCompany:
      'GreenTech Solutions is a technology company focused on creating innovative solutions for a more sustainable future.',
    aboutInternship:
      'Join our research team to study environmental data and contribute to sustainability reports.',
    responsibilities: [
      'Conduct environmental impact research',
      'Analyze sustainability data and metrics',
      'Prepare research reports and presentations',
    ],
    requirements: [
      'Background in Environmental Science or related field',
      'Strong analytical and writing skills',
      'Proficiency in data analysis tools',
    ],
    technologies: ['Excel', 'Python', 'R', 'PowerBI'],
  },
  {
    id: '7',
    title: 'Business Analysis Intern',
    company: 'NextGen Analytics',
    location: 'Remote',
    locationType: 'Remote',
    type: 'Full-time',
    duration: '3–6 months',
    applicationsCount: 9,
    status: 'Open',
    createdOn: 'Jun 10, 2025',
    deadline: 'Sep 30, 2025',
    logoBg: 'bg-[#0f172a]',
    logoType: 'chart',
    tags: ['Business Analysis', 'Internship'],
    aboutCompany:
      'NextGen Analytics builds enterprise data pipelines, predictive AI models, and real-time visualization dashboards for global clients.',
    aboutInternship:
      'As a Business Analysis Intern, you will help translate complex business requirements into actionable data insights.',
    responsibilities: [
      'Gather and document business requirements',
      'Analyze business processes and workflows',
      'Create data-driven reports and dashboards',
    ],
    requirements: [
      'Interest in business analysis and data',
      'Strong communication and documentation skills',
      'Basic knowledge of SQL or Excel',
    ],
    technologies: ['SQL', 'Excel', 'PowerBI', 'Jira'],
  },
  {
    id: '8',
    title: 'Marketing Intern',
    company: 'TechVision',
    location: 'Chișinău, MD',
    locationType: 'On-site',
    type: 'Part-time',
    duration: '2–3 months',
    applicationsCount: 6,
    status: 'Closed',
    createdOn: 'May 18, 2025',
    deadline: 'Jul 31, 2025',
    logoBg: 'bg-[#ea580c]',
    logoType: 'check',
    tags: ['Marketing', 'Internship'],
    aboutCompany:
      'TechVision is a leading digital studio crafting high-performance web and mobile applications for clients around the globe.',
    aboutInternship:
      'Join our marketing team to run campaigns, analyze engagement data, and help grow our brand presence.',
    responsibilities: [
      'Plan and execute digital marketing campaigns',
      'Monitor social media metrics and engagement',
      'Create content for web and social channels',
    ],
    requirements: [
      'Interest in digital marketing',
      'Basic knowledge of social media platforms',
      'Creative thinking and strong written skills',
    ],
    technologies: ['Google Analytics', 'Meta Ads', 'Canva', 'HubSpot'],
  },
]

export default function MyOpportunities() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterWorkType, setFilterWorkType] = useState('All')
  const [filterLocation, setFilterLocation] = useState('All')
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<MentorOpportunity | null>(null)
  // Local status overrides keyed by opportunity id
  const [statusOverrides, setStatusOverrides] = useState<Record<string, MentorOpportunity['status']>>({})

  const getEffectiveStatus = (opp: MentorOpportunity): MentorOpportunity['status'] =>
    statusOverrides[opp.id] ?? opp.status

  const totalCount = MOCK_MENTOR_OPPORTUNITIES.length
  const openCount = MOCK_MENTOR_OPPORTUNITIES.filter(
    (o) => getEffectiveStatus(o) === 'Open'
  ).length
  const closedCount = MOCK_MENTOR_OPPORTUNITIES.filter(
    (o) => getEffectiveStatus(o) === 'Closed'
  ).length
  const draftCount = MOCK_MENTOR_OPPORTUNITIES.filter(
    (o) => getEffectiveStatus(o) === 'Draft'
  ).length

  const filtered = MOCK_MENTOR_OPPORTUNITIES.filter((opp) => {
    const q = searchQuery.toLowerCase()
    const matchesQuery =
      opp.title.toLowerCase().includes(q) ||
      opp.location.toLowerCase().includes(q)

    if (!matchesQuery) return false

    const effectiveStatus = getEffectiveStatus(opp)
    if (filterStatus !== 'All' && effectiveStatus !== filterStatus) return false
    if (filterWorkType !== 'All' && opp.type !== filterWorkType) return false
    if (filterLocation !== 'All' && opp.locationType !== filterLocation)
      return false

    return true
  })

  const resetFilters = () => {
    setSearchQuery('')
    setFilterStatus('All')
    setFilterWorkType('All')
    setFilterLocation('All')
  }

  const getStatusBadge = (status: MentorOpportunity['status']) => {
    if (status === 'Open') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/70 text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          Open
        </span>
      )
    }
    if (status === 'Closed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100/70 text-amber-800">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Closed
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
        <span className="w-2 h-2 rounded-full bg-gray-400" />
        Draft
      </span>
    )
  }

  const getLogoIcon = (logoType: MentorOpportunity['logoType'], size = 'w-6 h-6') => {
    if (logoType === 'leaf') return <Leaf className={size} />
    if (logoType === 'code') return <Code2 className={size} />
    if (logoType === 'chart') return <BarChart3 className={size} />
    return <CheckCircle2 className={size} />
  }

  // Handle Publish / Unpublish
  const handlePublishToggle = (opp: MentorOpportunity) => {
    const current = getEffectiveStatus(opp)
    if (current === 'Draft') {
      setStatusOverrides((prev) => ({ ...prev, [opp.id]: 'Open' }))
    } else {
      setStatusOverrides((prev) => ({ ...prev, [opp.id]: 'Draft' }))
    }
    setSelectedOpportunity(null)
  }

  // Handle Open / Close
  const handleOpenCloseToggle = (opp: MentorOpportunity) => {
    const current = getEffectiveStatus(opp)
    if (current === 'Closed') {
      setStatusOverrides((prev) => ({ ...prev, [opp.id]: 'Open' }))
    } else {
      setStatusOverrides((prev) => ({ ...prev, [opp.id]: 'Closed' }))
    }
    setSelectedOpportunity(null)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Opportunities</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage the internship opportunities you've created.
          </p>
        </div>

        <Link
          to="/my-opportunities/create"
          className="bg-[#ff5500] hover:bg-[#e64d00] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shrink-0 inline-flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Opportunity</span>
        </Link>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Opportunities */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-800 shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            <p className="text-xs font-medium text-gray-500">
              Total Opportunities
            </p>
          </div>
        </div>

        {/* Currently Open */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <span className="w-4 h-4 rounded-full bg-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{openCount}</p>
            <p className="text-xs font-medium text-gray-500">Currently Open</p>
          </div>
        </div>

        {/* Closed */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <span className="w-4 h-4 rounded-full bg-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{closedCount}</p>
            <p className="text-xs font-medium text-gray-500">Closed</p>
          </div>
        </div>

        {/* Draft */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
            <span className="w-4 h-4 rounded-full bg-gray-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{draftCount}</p>
            <p className="text-xs font-medium text-gray-500">Draft</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full bg-white rounded-xl border border-gray-200/80 shadow-xs flex items-center px-3.5 py-2">
          <Search className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description or keyword..."
            className="w-full bg-transparent text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <div className="w-36">
            <CustomSelect
              size="sm"
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: 'All', label: 'Status: All' },
                { value: 'Open', label: 'Open' },
                { value: 'Closed', label: 'Closed' },
                { value: 'Draft', label: 'Draft' },
              ]}
            />
          </div>

          <div className="w-36">
            <CustomSelect
              size="sm"
              value={filterWorkType}
              onChange={setFilterWorkType}
              options={[
                { value: 'All', label: 'Work Type: All' },
                { value: 'Full-time', label: 'Full-time' },
                { value: 'Part-time', label: 'Part-time' },
              ]}
            />
          </div>

          <div className="w-36">
            <CustomSelect
              size="sm"
              value={filterLocation}
              onChange={setFilterLocation}
              options={[
                { value: 'All', label: 'Location: All' },
                { value: 'On-site', label: 'On-site' },
                { value: 'Hybrid', label: 'Hybrid' },
                { value: 'Remote', label: 'Remote' },
              ]}
            />
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-600">
            <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-5 py-3.5">
                  Title
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Applications
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Created On
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Deadline
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((opp) => (
                <tr key={opp.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Title & Meta */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl ${opp.logoBg} flex items-center justify-center text-white shrink-0 shadow-xs`}
                      >
                        {getLogoIcon(opp.logoType, 'w-4 h-4')}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{opp.title}</p>
                        <p className="text-xs text-gray-400 font-medium">
                          {opp.location} • {opp.type}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Applications count */}
                  <td className="px-5 py-4 font-semibold text-gray-800">
                    {opp.applicationsCount}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">{getStatusBadge(getEffectiveStatus(opp))}</td>

                  {/* Created On */}
                  <td className="px-5 py-4 text-gray-500 font-medium">
                    {opp.createdOn}
                  </td>

                  {/* Deadline */}
                  <td className="px-5 py-4 text-gray-500 font-medium">
                    {opp.deadline}
                  </td>

                  {/* Actions — only View button, no 3-dot menu */}
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedOpportunity(opp)}
                      className="bg-[#ff5500] hover:bg-[#e64d00] text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-gray-500 font-medium"
                  >
                    No opportunities found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="bg-gray-50/50 border-t border-gray-100 px-5 py-3 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing 1-{filtered.length} of {totalCount} opportunities
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="p-1 border border-gray-200 rounded-lg bg-white text-gray-400 hover:text-gray-700 disabled:opacity-40"
              disabled
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="w-7 h-7 bg-[#1b5e3a] text-white font-bold rounded-lg flex items-center justify-center text-xs">
              1
            </span>
            <button
              type="button"
              className="p-1 border border-gray-200 rounded-lg bg-white text-gray-400 hover:text-gray-700 disabled:opacity-40"
              disabled
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Opportunity Detail Modal */}
      {selectedOpportunity && (() => {
        const effectiveStatus = getEffectiveStatus(selectedOpportunity)
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-6 overflow-hidden"
            onClick={() => setSelectedOpportunity(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto no-scrollbar p-5 sm:p-7 md:p-8 shadow-2xl relative space-y-4 sm:space-y-5 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Close Button */}
              <button
                type="button"
                onClick={() => setSelectedOpportunity(null)}
                className="absolute top-5 right-5 sm:top-6 sm:right-6 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pr-8">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${selectedOpportunity.logoBg} flex items-center justify-center text-white shrink-0 shadow-sm`}
                  >
                    {getLogoIcon(selectedOpportunity.logoType, 'w-7 h-7 sm:w-8 sm:h-8')}
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                      {selectedOpportunity.title}
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-gray-500">
                      {selectedOpportunity.company}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedOpportunity.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                      {getStatusBadge(effectiveStatus)}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-1 sm:pt-0 shrink-0 min-w-[130px]">
                  {/* Publish / Unpublish — only shown when Draft or Open */}
                  {effectiveStatus !== 'Closed' && (
                    <button
                      type="button"
                      onClick={() => handlePublishToggle(selectedOpportunity)}
                      className="bg-[#ff5500] hover:bg-[#e64d00] text-white font-medium text-sm px-6 py-2 sm:py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs w-full text-center"
                    >
                      {effectiveStatus === 'Draft' ? 'Publish' : 'Unpublish'}
                    </button>
                  )}

                  {/* Open / Close — only shown when Open or Closed (not Draft) */}
                  {effectiveStatus !== 'Draft' && (
                    <button
                      type="button"
                      onClick={() => handleOpenCloseToggle(selectedOpportunity)}
                      className={`border font-medium text-sm px-5 py-1.5 sm:py-2 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs w-full ${
                        effectiveStatus === 'Closed'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {effectiveStatus === 'Closed' ? 'Open' : 'Close'}
                    </button>
                  )}
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Key Metadata Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-1 text-center justify-items-center">
                <div className="flex items-center gap-2.5 justify-center text-left">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">
                      {selectedOpportunity.location}
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-400 font-medium">Location</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 justify-center text-left">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">
                      {selectedOpportunity.type}
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-400 font-medium">Work type</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 justify-center text-left">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">
                      {selectedOpportunity.duration}
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-400 font-medium">Duration</p>
                  </div>
                </div>
              </div>

              {/* About the Company */}
              <div className="space-y-1.5 pt-1">
                <h3 className="text-sm sm:text-base font-bold text-[#0c382b]">
                  About the Company
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {selectedOpportunity.aboutCompany}
                </p>
              </div>

              {/* About the Internship */}
              <div className="space-y-1.5">
                <h3 className="text-sm sm:text-base font-bold text-[#0c382b]">
                  About the Internship
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {selectedOpportunity.aboutInternship}
                </p>
              </div>

              {/* Responsibilities & Requirements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-1">
                {/* Responsibilities */}
                <div className="space-y-2">
                  <h3 className="text-sm sm:text-base font-bold text-[#0c382b]">
                    Responsibilities
                  </h3>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600">
                    {selectedOpportunity.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-gray-800 font-bold">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Requirements */}
                <div className="space-y-2">
                  <h3 className="text-sm sm:text-base font-bold text-[#0c382b]">
                    Requirements
                  </h3>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600">
                    {selectedOpportunity.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-gray-800 font-bold">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Technologies */}
              <div className="space-y-2 pt-1">
                <h3 className="text-sm sm:text-base font-bold text-[#0c382b]">
                  Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedOpportunity.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Footer: action buttons */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
                {/* Left: View Applications + Edit */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOpportunity(null)
                      navigate(`/my-opportunities/applications?id=${selectedOpportunity.id}`)
                    }}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white bg-[#1b5e3a] hover:bg-[#154d2f] px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    <Users className="w-4 h-4" />
                    View Applications
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOpportunity(null)
                      navigate(`/my-opportunities/edit?id=${selectedOpportunity.id}`)
                    }}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#ff5500] border border-[#ff5500] hover:bg-orange-50 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {selectedOpportunity.applicationsCount} applicant{selectedOpportunity.applicationsCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
