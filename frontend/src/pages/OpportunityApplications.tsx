import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Users,
  FileText,
  Download,
  GraduationCap,
  Mail,
  Phone,
  Clock3,
  CheckCircle2,
  Leaf,
  Code2,
  BarChart3,
  MapPin,
  Briefcase,
  Calendar,
  X,
  ClipboardCheck,
  Loader2,
} from 'lucide-react'
import {
  getApplicationsByOpportunity,
  getOpportunityById,
} from '../api/opportunities'

interface ApplicantFile {
  name: string
  size: string
  type: string
}

interface Applicant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  educationLevel: string
  fieldOfStudy: string
  expectedGraduation: string
  availability: string
  motivation: string
  appliedDate: string
  status: 'Under Review' | 'Accepted' | 'Rejected' | 'Pending'
  files: ApplicantFile[]
  avatar: string
}

interface MentorOpp {
  id: string
  title: string
  company: string
  location: string
  locationType: string
  type: string
  duration: string
  logoBg: string
  logoType: 'leaf' | 'code' | 'chart' | 'check'
  applicantsCount: number
}

const MOCK_OPP_META: Record<string, MentorOpp> = {
  '1': { id: '1', title: 'Software Development Intern', company: 'GreenTech Solutions', location: 'Chișinău, MD', locationType: 'On-site', type: 'Full-time', duration: '3–6 months', logoBg: 'bg-[#1b5e3a]', logoType: 'leaf', applicantsCount: 12 },
  '2': { id: '2', title: 'Frontend Intern', company: 'TechVision', location: 'Remote', locationType: 'Remote', type: 'Full-time', duration: '3 months', logoBg: 'bg-[#2563eb]', logoType: 'code', applicantsCount: 20 },
  '3': { id: '3', title: 'Data Analytics Intern', company: 'NextGen Analytics', location: 'Chișinău, MD', locationType: 'Hybrid', type: 'Full-time', duration: '6 months', logoBg: 'bg-[#0f172a]', logoType: 'chart', applicantsCount: 8 },
  '4': { id: '4', title: 'QA Automation Intern', company: 'AlphaSystems', location: 'Remote', locationType: 'Remote', type: 'Part-time', duration: '3 months', logoBg: 'bg-[#ea580c]', logoType: 'check', applicantsCount: 5 },
  '5': { id: '5', title: 'Technical Writing Intern', company: 'GreenTech Solutions', location: 'Remote', locationType: 'Remote', type: 'Part-time', duration: '2 months', logoBg: 'bg-gray-600', logoType: 'code', applicantsCount: 3 },
  '6': { id: '6', title: 'Sustainability Research Intern', company: 'GreenTech Solutions', location: 'Chișinău, MD', locationType: 'On-site', type: 'Full-time', duration: '4 months', logoBg: 'bg-[#1b5e3a]', logoType: 'leaf', applicantsCount: 15 },
  '7': { id: '7', title: 'Business Analysis Intern', company: 'NextGen Analytics', location: 'Remote', locationType: 'Remote', type: 'Full-time', duration: '3–6 months', logoBg: 'bg-[#0f172a]', logoType: 'chart', applicantsCount: 9 },
  '8': { id: '8', title: 'Marketing Intern', company: 'TechVision', location: 'Chișinău, MD', locationType: 'On-site', type: 'Part-time', duration: '2–3 months', logoBg: 'bg-[#ea580c]', logoType: 'check', applicantsCount: 6 },
}

const generateApplicants = (oppId: string): Applicant[] => {
  const base: Applicant[] = [
    {
      id: 'a1', firstName: 'Daniel', lastName: 'Chițanu',
      email: 'daniel.chitanu@gmail.com', phone: '+373 68 123 456',
      educationLevel: "Bachelor's Degree", fieldOfStudy: 'Computer Science',
      expectedGraduation: 'June 2026', availability: 'Full-time',
      motivation: 'I am passionate about software development and want to gain hands-on experience in a company that builds innovative and sustainable solutions. I believe this internship will significantly accelerate my learning curve.',
      appliedDate: 'Sep 15, 2026', status: 'Under Review', avatar: 'bg-[#1b5e3a]',
      files: [
        { name: 'Resume_Daniel_Chitanu.pdf', size: '245 KB', type: 'PDF' },
        { name: 'Cover_Letter.pdf', size: '180 KB', type: 'PDF' },
        { name: 'Transcript.pdf', size: '350 KB', type: 'PDF' },
      ],
    },
    {
      id: 'a2', firstName: 'Maria', lastName: 'Ionescu',
      email: 'maria.ionescu@student.utm.md', phone: '+373 79 456 789',
      educationLevel: "Master's Degree", fieldOfStudy: 'Software Engineering',
      expectedGraduation: 'January 2027', availability: 'Part-time',
      motivation: 'With a strong background in software engineering and a genuine interest in building scalable applications, I am eager to contribute to your team and grow professionally.',
      appliedDate: 'Sep 14, 2026', status: 'Accepted', avatar: 'bg-[#2563eb]',
      files: [
        { name: 'Maria_Ionescu_CV.pdf', size: '312 KB', type: 'PDF' },
        { name: 'Portfolio_Links.pdf', size: '95 KB', type: 'PDF' },
      ],
    },
    {
      id: 'a3', firstName: 'Alexandru', lastName: 'Moraru',
      email: 'alex.moraru@mail.com', phone: '+373 60 789 012',
      educationLevel: "Bachelor's Degree", fieldOfStudy: 'Information Technology',
      expectedGraduation: 'July 2026', availability: 'Full-time',
      motivation: "I have been following the company's work for over a year and deeply admire the focus on sustainability. I want to apply my technical skills towards meaningful impact.",
      appliedDate: 'Sep 13, 2026', status: 'Pending', avatar: 'bg-[#ea580c]',
      files: [
        { name: 'CV_Alexandru_Moraru.pdf', size: '198 KB', type: 'PDF' },
        { name: 'Cover_Letter_AlexMoraru.pdf', size: '155 KB', type: 'PDF' },
        { name: 'Recommendation_Letter.pdf', size: '420 KB', type: 'PDF' },
      ],
    },
    {
      id: 'a4', firstName: 'Elena', lastName: 'Popescu',
      email: 'elena.popescu@techuni.md', phone: '+373 69 321 654',
      educationLevel: "Bachelor's Degree", fieldOfStudy: 'Computer Engineering',
      expectedGraduation: 'May 2026', availability: 'Full-time',
      motivation: 'As a driven student with hands-on project experience in React and TypeScript, I am confident I can contribute to your frontend team from day one while continuing to grow my skills.',
      appliedDate: 'Sep 12, 2026', status: 'Rejected', avatar: 'bg-[#0f172a]',
      files: [
        { name: 'Elena_Popescu_Resume.pdf', size: '267 KB', type: 'PDF' },
        { name: 'GitHub_Portfolio.pdf', size: '88 KB', type: 'PDF' },
      ],
    },
    {
      id: 'a5', firstName: 'Andrei', lastName: 'Văcaru',
      email: 'andrei.vacaru@gmail.com', phone: '+373 62 654 321',
      educationLevel: "Bachelor's Degree", fieldOfStudy: 'Mathematics & Informatics',
      expectedGraduation: 'September 2026', availability: 'Full-time',
      motivation: "I have a strong foundation in algorithms and data structures, and I've built several personal projects using modern frameworks. I am excited to bring my enthusiasm and skills to a real-world team.",
      appliedDate: 'Sep 10, 2026', status: 'Under Review', avatar: 'bg-purple-600',
      files: [
        { name: 'Andrei_Vacaru_CV.pdf', size: '302 KB', type: 'PDF' },
        { name: 'Transcript_2026.pdf', size: '410 KB', type: 'PDF' },
      ],
    },
  ]

  const meta = MOCK_OPP_META[oppId]
  const count = meta?.applicantsCount ?? 3
  if (count <= 3) return base.slice(0, 3)
  if (count <= 5) return base.slice(0, 5)
  return base
}

const STATUS_CONFIG: Record<Applicant['status'], { label: string; classes: string; dotClass: string }> = {
  'Under Review': { label: 'Under Review', classes: 'bg-amber-50 text-amber-700 border-amber-200', dotClass: 'bg-amber-500' },
  'Accepted':     { label: 'Accepted',     classes: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotClass: 'bg-emerald-600' },
  'Rejected':     { label: 'Rejected',     classes: 'bg-red-50 text-red-600 border-red-200', dotClass: 'bg-red-500' },
  'Pending':      { label: 'Pending',      classes: 'bg-gray-100 text-gray-600 border-gray-200', dotClass: 'bg-gray-400' },
}

function getLogoIcon(logoType: MentorOpp['logoType'], cls = 'w-6 h-6') {
  if (logoType === 'leaf')  return <Leaf className={cls} />
  if (logoType === 'code')  return <Code2 className={cls} />
  if (logoType === 'chart') return <BarChart3 className={cls} />
  return <CheckCircle2 className={cls} />
}

export default function OpportunityApplications() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const oppId = searchParams.get('id') || '1'
  const [opp, setOpp] = useState<MentorOpp>(() => MOCK_OPP_META[oppId] ?? MOCK_OPP_META['1'])
  const [applicants, setApplicants] = useState<Applicant[]>(() => generateApplicants(oppId))
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!oppId) return
    setIsLoading(true)

    Promise.all([
      getOpportunityById(oppId).catch(() => null),
      getApplicationsByOpportunity(oppId).catch(() => null),
    ])
      .then(([oppData, appsData]) => {
        if (oppData) {
          setOpp({
            id: oppData.id,
            title: oppData.title,
            company: oppData.company,
            location: oppData.location,
            locationType: oppData.locationType,
            type: oppData.type,
            duration: oppData.duration,
            logoBg: oppData.logoBg || 'bg-[#1b5e3a]',
            logoType: (oppData.logoType as any) || 'leaf',
            applicantsCount: oppData.applicationsCount || (appsData?.length ?? 0),
          })
        }

        if (appsData && appsData.length > 0) {
          const avatars = ['bg-[#1b5e3a]', 'bg-[#2563eb]', 'bg-[#ea580c]', 'bg-[#0f172a]', 'bg-purple-600']
          const mapped: Applicant[] = appsData.map((item, idx) => {
            const files: ApplicantFile[] = []
            if (item.resumePath) {
              files.push({
                name: item.resumePath.split(/[\/\\]/).pop() || 'Resume.pdf',
                size: '245 KB',
                type: 'PDF',
              })
            }
            if (item.coverLetterPath) {
              files.push({
                name: item.coverLetterPath.split(/[\/\\]/).pop() || 'Cover_Letter.pdf',
                size: '180 KB',
                type: 'PDF',
              })
            }

            return {
              id: item.id,
              firstName: item.firstName,
              lastName: item.lastName,
              email: item.email,
              phone: `${item.phoneCountryCode} ${item.phoneNumber}`,
              educationLevel: item.educationLevel,
              fieldOfStudy: item.fieldOfStudy,
              expectedGraduation: item.expectedGraduation,
              availability: item.availability,
              motivation: item.motivation,
              appliedDate: item.appliedAt
                ? new Date(item.appliedAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Recent',
              status: (item.status as any) || 'Pending',
              avatar: avatars[idx % avatars.length],
              files,
            }
          })
          setApplicants(mapped)
        }
      })
      .finally(() => setIsLoading(false))
  }, [oppId])

  const allApplicants = applicants

  const [searchQuery, setSearchQuery]     = useState('')
  const [filterStatus, setFilterStatus]   = useState<string>('All')
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Applicant['status']>>({})
  const [previewFile, setPreviewFile]     = useState<ApplicantFile | null>(null)
  const [pendingStatus, setPendingStatus] = useState<Applicant['status'] | null>(null)

  const getStatus = (a: Applicant): Applicant['status'] => statusOverrides[a.id] ?? a.status

  const STATUS_PRIORITY: Record<Applicant['status'], number> = {
    'Pending':      1,
    'Under Review': 2,
    'Accepted':     3,
    'Rejected':     4,
  }

  const filtered = allApplicants
    .filter((a) => {
      const q = searchQuery.toLowerCase()
      const name = `${a.firstName} ${a.lastName}`.toLowerCase()
      if (q && !name.includes(q) && !a.email.toLowerCase().includes(q)) return false
      if (filterStatus !== 'All' && getStatus(a) !== filterStatus) return false
      return true
    })
    .sort((a, b) => STATUS_PRIORITY[getStatus(a)] - STATUS_PRIORITY[getStatus(b)])

  const counts = {
    all:      allApplicants.length,
    review:   allApplicants.filter((a) => getStatus(a) === 'Under Review').length,
    accepted: allApplicants.filter((a) => getStatus(a) === 'Accepted').length,
    rejected: allApplicants.filter((a) => getStatus(a) === 'Rejected').length,
    pending:  allApplicants.filter((a) => getStatus(a) === 'Pending').length,
  }

  const openModal = (applicant: Applicant) => {
    setSelectedApplicant(applicant)
    setPendingStatus(getStatus(applicant))
  }

  const closeModal = () => {
    setSelectedApplicant(null)
    setPendingStatus(null)
  }

  const commitReview = () => {
    if (selectedApplicant && pendingStatus) {
      setStatusOverrides((prev) => ({ ...prev, [selectedApplicant.id]: pendingStatus }))
    }
    closeModal()
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-6">
      {/* Back nav */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/my-opportunities')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Opportunities</span>
        </button>
      </div>

      {/* Opportunity header card */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${opp.logoBg} flex items-center justify-center text-white shrink-0 shadow-xs`}>
            {getLogoIcon(opp.logoType, 'w-5 h-5')}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">{opp.title}</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">{opp.company}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500">
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{opp.location}</span>
          <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{opp.type}</span>
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{opp.duration}</span>
          <span className="flex items-center gap-1.5 font-semibold text-gray-700">
            <Users className="w-3.5 h-3.5 text-[#ff5500]" />
            {allApplicants.length} Applicants
          </span>
        </div>
      </div>

      {/* Stat tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(
          [
            { label: 'All Applicants', key: 'All',          count: counts.all,      color: 'text-gray-700',    bg: 'bg-gray-100'  },
            { label: 'Under Review',   key: 'Under Review',  count: counts.review,   color: 'text-amber-700',   bg: 'bg-amber-50'  },
            { label: 'Accepted',       key: 'Accepted',      count: counts.accepted, color: 'text-emerald-700', bg: 'bg-emerald-50'},
            { label: 'Rejected',       key: 'Rejected',      count: counts.rejected, color: 'text-red-600',     bg: 'bg-red-50'    },
            { label: 'Pending',        key: 'Pending',       count: counts.pending,  color: 'text-gray-500',    bg: 'bg-gray-50'   },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterStatus(tab.key)}
            className={`flex flex-col items-start p-4 rounded-2xl border transition-all cursor-pointer text-left ${
              filterStatus === tab.key
                ? `${tab.bg} border-current ${tab.color} shadow-sm`
                : 'bg-white border-gray-200/80 text-gray-600 hover:bg-gray-50 shadow-xs'
            }`}
          >
            <span className={`text-xl font-bold ${filterStatus === tab.key ? tab.color : 'text-gray-900'}`}>{tab.count}</span>
            <span className="text-xs font-medium mt-0.5">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative bg-white rounded-xl border border-gray-200/80 shadow-xs flex items-center px-3.5 py-2.5">
        <Search className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search applicants by name or email..."
          className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
        />
        {searchQuery && (
          <button type="button" onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results label */}
      <p className="text-xs text-gray-500 font-medium -mt-2">
        Showing {filtered.length} of {allApplicants.length} applicants
      </p>

      {/* Applicant card list */}
      <div className="space-y-3">
        {isLoading && (
          <div className="bg-white border border-gray-200/80 rounded-2xl p-10 text-center text-gray-500 font-medium shadow-xs">
            <Loader2 className="w-8 h-8 text-[#ff5500] animate-spin mx-auto mb-2" />
            Loading applicants...
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="bg-white border border-gray-200/80 rounded-2xl p-10 text-center text-gray-500 font-medium shadow-xs">
            No applicants match your search criteria.
          </div>
        )}

        {!isLoading &&
          filtered.map((applicant) => {
          const effectiveStatus = getStatus(applicant)
          const sc = STATUS_CONFIG[effectiveStatus]

          return (
            <div
              key={applicant.id}
              className="bg-white border border-gray-200/80 rounded-2xl shadow-xs px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
            >
              {/* Avatar + Name + Email */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-full ${applicant.avatar} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                  {applicant.firstName[0]}{applicant.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm leading-snug">
                    {applicant.firstName} {applicant.lastName}
                  </p>
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" />
                    {applicant.email}
                  </p>
                </div>
              </div>

              {/* Right: date + badge + button */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <Clock3 className="w-3.5 h-3.5" />
                  Applied {applicant.appliedDate}
                </span>

                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${sc.classes}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dotClass}`} />
                  {sc.label}
                </span>

                <button
                  type="button"
                  onClick={() => openModal(applicant)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#ff5500] hover:bg-[#e64d00] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  View Details
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Applicant Detail Modal ── */}
      {selectedApplicant && (() => {
        const currentStatus = pendingStatus ?? getStatus(selectedApplicant)
        const sc = STATUS_CONFIG[currentStatus]

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-6"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl relative flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 p-6 sm:p-8 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${selectedApplicant.avatar} flex items-center justify-center text-white text-base font-bold shrink-0`}>
                    {selectedApplicant.firstName[0]}{selectedApplicant.lastName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-lg font-bold text-gray-900 leading-tight">
                        {selectedApplicant.firstName} {selectedApplicant.lastName}
                      </h2>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${sc.classes}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dotClass}`} />
                        {sc.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-1">
                      <Clock3 className="w-3 h-3" /> Applied {selectedApplicant.appliedDate}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body — scrollable content */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-8 pt-5 space-y-5">

                {/* Personal Information */}
                <div className="bg-gray-50/50 border border-gray-200/70 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Personal Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-gray-400 font-medium mb-0.5">Full Name</p>
                      <p className="font-semibold text-gray-800">{selectedApplicant.firstName} {selectedApplicant.lastName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium mb-0.5">Email</p>
                      <p className="font-semibold text-gray-800 flex items-center gap-1 break-all">
                        <Mail className="w-3 h-3 text-gray-400 shrink-0" />{selectedApplicant.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium mb-0.5">Phone Number</p>
                      <p className="font-semibold text-gray-800 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400 shrink-0" />{selectedApplicant.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Education & Additional */}
                <div className="bg-gray-50/50 border border-gray-200/70 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5" /> Education & Additional Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-gray-400 font-medium mb-0.5">Education Level</p>
                      <p className="font-semibold text-gray-800">{selectedApplicant.educationLevel}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium mb-0.5">Field of Study</p>
                      <p className="font-semibold text-gray-800">{selectedApplicant.fieldOfStudy}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium mb-0.5">Expected Graduation</p>
                      <p className="font-semibold text-gray-800">{selectedApplicant.expectedGraduation}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium mb-0.5">Availability</p>
                      <p className="font-semibold text-gray-800">{selectedApplicant.availability}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-gray-400 font-medium mb-0.5">Why are you interested?</p>
                      <p className="font-medium text-gray-700 leading-relaxed">{selectedApplicant.motivation}</p>
                    </div>
                  </div>
                </div>

                {/* Submitted Documents */}
                <div className="bg-gray-50/50 border border-gray-200/70 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> Submitted Documents
                  </h4>
                  <div className="space-y-2">
                    {selectedApplicant.files.map((file, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-gray-200/70 rounded-xl p-3 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
                            {file.type}
                          </span>
                          <span className="font-semibold text-gray-800 truncate">{file.name}</span>
                          <span className="text-gray-400 font-normal shrink-0">{file.size}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewFile(file)}
                          className="flex items-center gap-1.5 text-[#1b5e3a] font-semibold bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-100 px-6 sm:px-8 py-4 flex items-center justify-end gap-3 bg-gray-50/50 rounded-b-3xl">
                {currentStatus !== 'Accepted' && currentStatus !== 'Rejected' ? (
                  <button
                    type="button"
                    onClick={() => {
                      commitReview()
                      navigate(`/my-opportunities/review?oppId=${oppId}&userId=${selectedApplicant.id}&appId=${selectedApplicant.id}`)
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff5500] hover:bg-[#e64d00] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    Review
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* File Download confirmation modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Download File</h3>
              <button type="button" onClick={() => setPreviewFile(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{previewFile.type}</span>
              <div>
                <p className="text-xs font-semibold text-gray-800">{previewFile.name}</p>
                <p className="text-xs text-gray-400">{previewFile.size}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              In a real application this would trigger a secure download from the server. For this demo the file download is simulated.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1b5e3a] hover:bg-[#154d2f] rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
