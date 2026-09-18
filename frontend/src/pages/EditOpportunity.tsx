import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Leaf,
  Code2,
  BarChart3,
  CheckCircle2,
  MapPin,
  Briefcase,
  Calendar,
  Users,
  Check,
  ArrowRight,
  ArrowLeft,
  Building2,
  CheckCircle,
  Plus,
  Trash2,
  Pencil,
} from 'lucide-react'
import { CustomSelect } from '../components/CustomSelect'

// Mirror of MOCK_MENTOR_OPPORTUNITIES data from MyOpportunities
const INITIAL_DATA: Record<string, {
  title: string; field: string; location: string; locationType: string
  type: string; duration: string; deadline: string; aboutInternship: string
  responsibilities: string[]; requirements: string[]; technologies: string[]
  logoBg: string; logoType: string; company: string
}> = {
  '1': {
    title: 'Software Development Intern', field: 'Software Engineering',
    location: 'Chișinău, MD', locationType: 'On-site', type: 'Full-time',
    duration: '3–6 months', deadline: '2025-12-31',
    company: 'GreenTech Solutions', logoBg: 'bg-[#1b5e3a]', logoType: 'leaf',
    aboutInternship: 'Join our engineering team and work on real products that make a difference. As a Software Development Intern, you will collaborate with experienced developers, contribute to meaningful features, and gain hands-on experience with modern technologies.',
    responsibilities: ['Work on backend and/or frontend features', 'Collaborate with the development team', 'Write clean, maintainable code', 'Participate in code reviews', 'Learn and apply best practices'],
    requirements: ['Currently enrolled in a relevant field', 'Basic knowledge of C# and .NET (or C / C++)', 'Eagerness to learn and a problem-solving mindset', 'Good communication skills'],
    technologies: ['C#', '.NET', 'SQL', 'C++', 'Azure', 'Git', 'Docker'],
  },
  '2': {
    title: 'Frontend Intern', field: 'Web Development',
    location: 'Remote', locationType: 'Remote', type: 'Full-time',
    duration: '3–6 months', deadline: '2025-10-31',
    company: 'TechVision', logoBg: 'bg-[#2563eb]', logoType: 'code',
    aboutInternship: 'We are looking for an enthusiastic Frontend Intern to build responsive, modern interfaces using React and modern CSS. You will work closely with UI designers and senior frontend developers.',
    responsibilities: ['Develop scalable React components', 'Translate UI mockups into pixel-perfect pages', 'Optimize application performance', 'Fix UI bugs and improve accessibility'],
    requirements: ['Proficiency in JavaScript/TypeScript, HTML5, and CSS3', 'Familiarity with React', 'Understanding of responsive design principles', 'Strong attention to detail'],
    technologies: ['TypeScript', 'React', 'JavaScript', 'Tailwind CSS', 'Vite', 'Git'],
  },
  '3': {
    title: 'Data Analytics Intern', field: 'Data & Analytics',
    location: 'Chișinău, MD', locationType: 'Hybrid', type: 'Full-time',
    duration: '6+ months', deadline: '2025-11-30',
    company: 'NextGen Analytics', logoBg: 'bg-[#0f172a]', logoType: 'chart',
    aboutInternship: 'Gain hands-on experience building SQL queries, Python data analysis scripts, and Business Intelligence dashboards working directly with data engineers.',
    responsibilities: ['Analyze complex dataset queries using SQL and Python', 'Build BI reports and automated data pipelines', 'Assist senior data scientists with data cleaning'],
    requirements: ['Knowledge of Python, SQL, and basic statistical analysis', 'Familiarity with Pandas, NumPy, or PowerBI', 'Analytical mindset'],
    technologies: ['Python', 'SQL', 'PowerBI', 'Pandas', 'PostgreSQL'],
  },
  '4': {
    title: 'QA Automation Intern', field: 'Quality Assurance',
    location: 'Remote', locationType: 'Remote', type: 'Part-time',
    duration: '1–3 months', deadline: '2025-09-15',
    company: 'AlphaSystems', logoBg: 'bg-[#ea580c]', logoType: 'check',
    aboutInternship: 'Learn automated testing frameworks, write Java/Python automation test suites, and perform manual & API testing for enterprise web services.',
    responsibilities: ['Write end-to-end automation scripts', 'Perform API integration testing with Postman', 'Document bug reports and verify fix releases'],
    requirements: ['Basic knowledge of Java or Python programming', 'Understanding of software testing fundamentals', 'Strong logical thinking'],
    technologies: ['Java', 'Selenium', 'Python', 'Postman', 'Git'],
  },
  '5': {
    title: 'Technical Writing Intern', field: 'Software Engineering',
    location: 'Remote', locationType: 'Remote', type: 'Part-time',
    duration: '1–3 months', deadline: '',
    company: 'GreenTech Solutions', logoBg: 'bg-gray-600', logoType: 'code',
    aboutInternship: 'As a Technical Writing Intern, you will work with our engineering and product teams to produce high-quality documentation, guides, and knowledge-base articles.',
    responsibilities: ['Write and maintain technical documentation', 'Create user guides and API references', 'Collaborate with developers'],
    requirements: ['Excellent written English communication skills', 'Ability to understand technical concepts', 'Experience with Markdown'],
    technologies: ['Markdown', 'Git', 'Confluence', 'Jira'],
  },
  '6': {
    title: 'Sustainability Research Intern', field: 'Software Engineering',
    location: 'Chișinău, MD', locationType: 'On-site', type: 'Full-time',
    duration: '3–6 months', deadline: '2025-08-31',
    company: 'GreenTech Solutions', logoBg: 'bg-[#1b5e3a]', logoType: 'leaf',
    aboutInternship: 'Join our research team to study environmental data and contribute to sustainability reports.',
    responsibilities: ['Conduct environmental impact research', 'Analyze sustainability data and metrics', 'Prepare research reports'],
    requirements: ['Background in Environmental Science or related field', 'Strong analytical and writing skills', 'Proficiency in data analysis tools'],
    technologies: ['Excel', 'Python', 'R', 'PowerBI'],
  },
  '7': {
    title: 'Business Analysis Intern', field: 'Data & Analytics',
    location: 'Remote', locationType: 'Remote', type: 'Full-time',
    duration: '3–6 months', deadline: '2025-09-30',
    company: 'NextGen Analytics', logoBg: 'bg-[#0f172a]', logoType: 'chart',
    aboutInternship: 'As a Business Analysis Intern, you will help translate complex business requirements into actionable data insights.',
    responsibilities: ['Gather and document business requirements', 'Analyze business processes and workflows', 'Create data-driven reports'],
    requirements: ['Interest in business analysis and data', 'Strong communication and documentation skills', 'Basic knowledge of SQL or Excel'],
    technologies: ['SQL', 'Excel', 'PowerBI', 'Jira'],
  },
  '8': {
    title: 'Marketing Intern', field: 'Software Engineering',
    location: 'Chișinău, MD', locationType: 'On-site', type: 'Part-time',
    duration: '1–3 months', deadline: '2025-07-31',
    company: 'TechVision', logoBg: 'bg-[#ea580c]', logoType: 'check',
    aboutInternship: 'Join our marketing team to run campaigns, analyze engagement data, and help grow our brand presence.',
    responsibilities: ['Plan and execute digital marketing campaigns', 'Monitor social media metrics', 'Create content for web and social channels'],
    requirements: ['Interest in digital marketing', 'Basic knowledge of social media platforms', 'Creative thinking and strong written skills'],
    technologies: ['Google Analytics', 'Meta Ads', 'Canva', 'HubSpot'],
  },
}

function LogoIcon({ type, cls = 'w-7 h-7' }: { type: string; cls?: string }) {
  if (type === 'leaf')  return <Leaf className={cls} />
  if (type === 'code')  return <Code2 className={cls} />
  if (type === 'chart') return <BarChart3 className={cls} />
  return <CheckCircle2 className={cls} />
}

export default function EditOpportunity() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id') || '1'
  const initial = INITIAL_DATA[id] ?? INITIAL_DATA['1']

  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [isSaved, setIsSaved] = useState(false)

  const [formData, setFormData] = useState({ ...initial })
  const [newResp, setNewResp] = useState('')
  const [newReq, setNewReq]   = useState('')
  const [newTech, setNewTech] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelect = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  const addItem = (key: 'responsibilities' | 'requirements' | 'technologies', val: string, reset: () => void) => {
    if (!val.trim()) return
    setFormData((prev) => ({ ...prev, [key]: [...prev[key], val.trim()] }))
    reset()
  }

  const removeItem = (key: 'responsibilities' | 'requirements' | 'technologies', idx: number) =>
    setFormData((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }))

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaved(true)
  }

  const inputClass = 'w-full bg-gray-50/70 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-800/15 transition-all'

  // ── Success screen ──
  if (isSaved) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#0c382b]">Changes Saved!</h1>
          <p className="text-gray-600 max-w-lg mx-auto text-sm sm:text-base">
            The internship opportunity{' '}
            <span className="font-semibold text-gray-900">{formData.title}</span>{' '}
            at{' '}
            <span className="font-semibold text-gray-900">{formData.company}</span>{' '}
            has been updated successfully.
          </p>
        </div>
        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/my-opportunities')}
            className="bg-[#ff5500] hover:bg-[#e64d00] text-white font-medium text-sm px-6 py-2.5 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            Back to My Opportunities
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-6">
      {/* Back nav */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/my-opportunities')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Opportunities</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left: Live Preview Card ── */}
        <div className="lg:col-span-4 bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs space-y-6 lg:sticky lg:top-6">
          <div className="space-y-4">
            <div className={`w-14 h-14 rounded-2xl ${formData.logoBg} flex items-center justify-center text-white shadow-sm`}>
              <LogoIcon type={formData.logoType} />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold mb-1">
                <Building2 className="w-3 h-3" />
                {formData.company}
              </div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {formData.title || 'Opportunity Title'}
              </h2>
              <p className="text-sm font-medium text-gray-500">{formData.field}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">{formData.field}</span>
              <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">Internship</span>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-3.5 text-sm text-gray-600">
            <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-400 shrink-0" /><span>{formData.location} ({formData.locationType})</span></div>
            <div className="flex items-center gap-3"><Briefcase className="w-4 h-4 text-gray-400 shrink-0" /><span>{formData.type}</span></div>
            <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-gray-400 shrink-0" /><span>{formData.duration}</span></div>
            <div className="flex items-center gap-3"><Users className="w-4 h-4 text-gray-400 shrink-0" /><span>Engineering Team</span></div>
          </div>
        </div>

        {/* ── Right: Edit Form ── */}
        <div className="lg:col-span-8 bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Pencil className="w-5 h-5 text-[#ff5500]" />
              <h1 className="text-2xl font-bold text-[#0c382b]">Edit Opportunity</h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Update the internship details for{' '}
              <span className="font-semibold text-gray-800">{formData.company}</span>.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep === 1 ? 'bg-[#1b5e3a] text-white ring-4 ring-emerald-800/10' : 'bg-emerald-600 text-white'
              }`}>
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className={`text-xs sm:text-sm font-medium ${currentStep === 1 ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                Edit Information
              </span>
            </div>

            <div className="h-0.5 flex-1 mx-4 bg-gray-200">
              <div className={`h-full bg-[#1b5e3a] transition-all duration-300 ${currentStep > 1 ? 'w-full' : 'w-0'}`} />
            </div>

            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep === 2 ? 'bg-[#1b5e3a] text-white ring-4 ring-emerald-800/10' : 'border-2 border-gray-300 text-gray-500'
              }`}>2</div>
              <span className={`text-xs sm:text-sm font-medium ${currentStep === 2 ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                Review & Save
              </span>
            </div>
          </div>

          {/* ── STEP 1 ── */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-gray-900">Basic Information</h3>

                {/* Company (locked) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Organization / Company</label>
                  <div className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-700 font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span>{formData.company}</span>
                    <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium ml-auto">Auto-selected</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Title <span className="text-red-500">*</span></label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Software Development Intern" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Field / Specialization <span className="text-red-500">*</span></label>
                    <CustomSelect
                      value={formData.field}
                      onChange={(val) => handleSelect('field', val)}
                      options={[
                        { value: 'Software Engineering', label: 'Software Engineering' },
                        { value: 'Web Development', label: 'Web Development' },
                        { value: 'Data & Analytics', label: 'Data & Analytics' },
                        { value: 'Quality Assurance', label: 'Quality Assurance' },
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Location <span className="text-red-500">*</span></label>
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Chișinău, MD" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Location Type <span className="text-red-500">*</span></label>
                    <CustomSelect
                      value={formData.locationType}
                      onChange={(val) => handleSelect('locationType', val)}
                      options={[
                        { value: 'On-site', label: 'On-site' },
                        { value: 'Hybrid', label: 'Hybrid' },
                        { value: 'Remote', label: 'Remote' },
                      ]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Work Type <span className="text-red-500">*</span></label>
                    <CustomSelect
                      value={formData.type}
                      onChange={(val) => handleSelect('type', val)}
                      options={[
                        { value: 'Full-time', label: 'Full-time' },
                        { value: 'Part-time', label: 'Part-time' },
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Duration <span className="text-red-500">*</span></label>
                    <CustomSelect
                      value={formData.duration}
                      onChange={(val) => handleSelect('duration', val)}
                      options={[
                        { value: '1–3 months', label: '1–3 months' },
                        { value: '3–6 months', label: '3–6 months' },
                        { value: '6+ months', label: '6+ months' },
                      ]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Application Deadline</label>
                    <input type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} className={`${inputClass} cursor-pointer`} />
                  </div>
                </div>
              </div>

              {/* About Internship */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-gray-700">About the Internship <span className="text-red-500">*</span></label>
                <textarea
                  rows={4}
                  name="aboutInternship"
                  value={formData.aboutInternship}
                  onChange={handleInputChange}
                  placeholder="Describe the internship program..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Responsibilities */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-gray-700 block">Responsibilities <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input type="text" value={newResp} onChange={(e) => setNewResp(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem('responsibilities', newResp, () => setNewResp('')) } }}
                    placeholder="Add a responsibility..." className={`${inputClass} flex-1 py-2`} />
                  <button type="button" onClick={() => addItem('responsibilities', newResp, () => setNewResp(''))}
                    className="bg-[#1b5e3a] hover:bg-[#14472c] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0">
                    <Plus className="w-4 h-4" /><span>Add</span>
                  </button>
                </div>
                <ul className="space-y-1.5 pt-1">
                  {formData.responsibilities.map((r, i) => (
                    <li key={i} className="bg-gray-50 border border-gray-200/70 rounded-xl px-3 py-2 text-xs flex items-center justify-between gap-2">
                      <span className="text-gray-800 font-medium">• {r}</span>
                      <button type="button" onClick={() => removeItem('responsibilities', i)} className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-gray-700 block">Requirements <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input type="text" value={newReq} onChange={(e) => setNewReq(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem('requirements', newReq, () => setNewReq('')) } }}
                    placeholder="Add a requirement..." className={`${inputClass} flex-1 py-2`} />
                  <button type="button" onClick={() => addItem('requirements', newReq, () => setNewReq(''))}
                    className="bg-[#1b5e3a] hover:bg-[#14472c] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0">
                    <Plus className="w-4 h-4" /><span>Add</span>
                  </button>
                </div>
                <ul className="space-y-1.5 pt-1">
                  {formData.requirements.map((r, i) => (
                    <li key={i} className="bg-gray-50 border border-gray-200/70 rounded-xl px-3 py-2 text-xs flex items-center justify-between gap-2">
                      <span className="text-gray-800 font-medium">• {r}</span>
                      <button type="button" onClick={() => removeItem('requirements', i)} className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technologies */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-gray-700 block">Required Technologies <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input type="text" value={newTech} onChange={(e) => setNewTech(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem('technologies', newTech, () => setNewTech('')) } }}
                    placeholder="e.g. React, C#, SQL..." className={`${inputClass} flex-1 py-2`} />
                  <button type="button" onClick={() => addItem('technologies', newTech, () => setNewTech(''))}
                    className="bg-[#1b5e3a] hover:bg-[#14472c] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0">
                    <Plus className="w-4 h-4" /><span>Add Tech</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.technologies.map((t, i) => (
                    <span key={i} className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5">
                      <span>{t}</span>
                      <button type="button" onClick={() => removeItem('technologies', i)} className="text-emerald-700 hover:text-red-600 cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button type="button" onClick={() => navigate('/my-opportunities')}
                  className="px-6 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="button" onClick={() => setCurrentStep(2)}
                  className="bg-[#ff5500] hover:bg-[#e64d00] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs">
                  <span>Review Changes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Review & Save ── */}
          {currentStep === 2 && (
            <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-200">
              <p className="text-xs text-gray-500">Review your changes before saving.</p>

              <div className="space-y-4">
                {/* Basic Details card */}
                <div className="bg-gray-50/40 border border-gray-200/80 rounded-2xl p-5 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">Opportunity Details</h4>
                    <button type="button" onClick={() => setCurrentStep(1)} className="text-xs font-medium text-[#1b5e3a] hover:underline cursor-pointer">Edit</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div><p className="text-gray-400 font-medium">Title</p><p className="font-semibold text-gray-800">{formData.title}</p></div>
                    <div><p className="text-gray-400 font-medium">Company</p><p className="font-semibold text-gray-800">{formData.company}</p></div>
                    <div><p className="text-gray-400 font-medium">Field</p><p className="font-semibold text-gray-800">{formData.field}</p></div>
                    <div><p className="text-gray-400 font-medium">Location</p><p className="font-semibold text-gray-800">{formData.location} ({formData.locationType})</p></div>
                    <div><p className="text-gray-400 font-medium">Work Type</p><p className="font-semibold text-gray-800">{formData.type}</p></div>
                    <div><p className="text-gray-400 font-medium">Deadline</p><p className="font-semibold text-gray-800">{formData.deadline || '—'}</p></div>
                  </div>
                </div>

                {/* About Internship card */}
                <div className="bg-gray-50/40 border border-gray-200/80 rounded-2xl p-5 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">About the Internship</h4>
                    <button type="button" onClick={() => setCurrentStep(1)} className="text-xs font-medium text-[#1b5e3a] hover:underline cursor-pointer">Edit</button>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{formData.aboutInternship}</p>
                </div>

                {/* Responsibilities & Requirements card */}
                <div className="bg-gray-50/40 border border-gray-200/80 rounded-2xl p-5 space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">Responsibilities & Requirements</h4>
                    <button type="button" onClick={() => setCurrentStep(1)} className="text-xs font-medium text-[#1b5e3a] hover:underline cursor-pointer">Edit</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-gray-800 mb-1.5">Responsibilities:</p>
                      <ul className="space-y-1 text-gray-600">{formData.responsibilities.map((r, i) => <li key={i}>• {r}</li>)}</ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 mb-1.5">Requirements:</p>
                      <ul className="space-y-1 text-gray-600">{formData.requirements.map((r, i) => <li key={i}>• {r}</li>)}</ul>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200/60">
                    <p className="text-xs font-semibold text-gray-800 mb-2">Required Technologies:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.technologies.map((t, i) => (
                        <span key={i} className="bg-white border border-gray-200 text-gray-700 px-2.5 py-0.5 rounded-md text-[11px] font-medium">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Edit
                </button>
                <button type="submit"
                  className="bg-[#ff5500] hover:bg-[#e64d00] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs">
                  <CheckCircle className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
