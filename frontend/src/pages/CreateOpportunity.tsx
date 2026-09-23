import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { CustomSelect } from '../components/CustomSelect'
import { createOpportunity, getCompanyInfo } from '../api/opportunities'
import type { CreateOpportunityPayload } from '../types/opportunities'
import OpportunityQuizRequirements from '../components/opportunities/OpportunityQuizRequirements'
import { combineRequirements, type QuizRequirement } from '../utils/opportunityRequirements'

export default function CreateOpportunity() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('GreenTech Solutions')

  useEffect(() => {
    getCompanyInfo()
      .then((info) => {
        if (info) setCompanyName(info)
      })
      .catch(() => {})
  }, [])

  // Automatic company metadata based on mentor's organization
  const mentorCompany = {
    name: companyName,
    logoBg: 'bg-[#1b5e3a]',
    logoType: 'leaf',
    aboutCompany:
      `${companyName} is a technology company focused on creating innovative solutions. We develop digital products that help businesses operate more efficiently.`,
  }

  // Form state
  const [formData, setFormData] = useState({
    title: 'Software Development Intern',
    field: 'Software Engineering',
    location: 'Chișinău, MD',
    locationType: 'On-site',
    type: 'Full-time',
    duration: '3–6 months',
    durationCategory: '3-6 months',
    deadline: '2025-12-31',
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
  })

  // Helper inputs state
  const [newResp, setNewResp] = useState('')
  const [newReq, setNewReq] = useState('')
  const [newTech, setNewTech] = useState('')
  const [quizRequirements, setQuizRequirements] = useState<QuizRequirement[]>([])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCustomSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Responsibilities handlers
  const addResponsibility = () => {
    if (newResp.trim()) {
      setFormData((prev) => ({
        ...prev,
        responsibilities: [...prev.responsibilities, newResp.trim()],
      }))
      setNewResp('')
    }
  }

  const removeResponsibility = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index),
    }))
  }

  // Requirements handlers
  const addRequirement = () => {
    if (newReq.trim()) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, newReq.trim()],
      }))
      setNewReq('')
    }
  }

  const removeRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }))
  }

  // Technologies handlers
  const addTechnology = () => {
    if (newTech.trim()) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()],
      }))
      setNewTech('')
    }
  }

  const removeTechnology = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index),
    }))
  }

  const [submittedStatus, setSubmittedStatus] = useState<'Open' | 'Draft'>('Open')

  const handleSubmit = async (e?: React.FormEvent, statusToSet: 'Open' | 'Draft' = 'Open') => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const payload: CreateOpportunityPayload = {
        title: formData.title,
        description: formData.aboutInternship,
        location: formData.location,
        locationType: formData.locationType === 'On-site' ? 'OnSite' : formData.locationType,
        type: formData.type === 'Full-time' ? 'FullTime' : 'PartTime',
        field: formData.field,
        durationCategory: formData.durationCategory,
        company: mentorCompany.name,
        logoBg: mentorCompany.logoBg,
        logoType: mentorCompany.logoType,
        aboutCompany: mentorCompany.aboutCompany,
        aboutInternship: formData.aboutInternship,
        responsibilities: formData.responsibilities,
        requirements: combineRequirements(formData.requirements, quizRequirements),
        technologies: formData.technologies,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : new Date(Date.now() + 60 * 86400000).toISOString(),
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 86400000).toISOString(),
        status: statusToSet,
      }

      await createOpportunity(payload)
      setSubmittedStatus(statusToSet)
      setIsSubmitted(true)
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create opportunity. Please check all fields.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#0c382b]">
            {submittedStatus === 'Draft' ? 'Opportunity Saved as Draft!' : 'Opportunity Published Successfully!'}
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto text-sm sm:text-base">
            Your internship opportunity for{' '}
            <span className="font-semibold text-gray-900">
              {formData.title}
            </span>{' '}
            at{' '}
            <span className="font-semibold text-gray-900">
              {mentorCompany.name}
            </span>{' '}
            {submittedStatus === 'Draft'
              ? 'has been saved as a draft. It is only visible in your workspace until you publish it.'
              : 'has been published and is now open for students to view and apply.'}
          </p>
        </div>
        <div className="pt-4 flex justify-center gap-4">
          <Link
            to="/my-opportunities"
            className="bg-[#ff5500] hover:bg-[#e64d00] text-white font-medium text-sm px-6 py-2.5 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            Back to My Opportunities
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-6">
      {/* Top Back Nav */}
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
        {/* Left Column: Preview Opportunity Card */}
        <div className="lg:col-span-4 bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs space-y-6 lg:sticky lg:top-6">
          <div className="space-y-4">
            <div
              className={`w-14 h-14 rounded-2xl ${mentorCompany.logoBg} flex items-center justify-center text-white shadow-sm`}
            >
              {mentorCompany.logoType === 'leaf' && <Leaf className="w-7 h-7" />}
              {mentorCompany.logoType === 'code' && <Code2 className="w-7 h-7" />}
              {mentorCompany.logoType === 'chart' && (
                <BarChart3 className="w-7 h-7" />
              )}
              {mentorCompany.logoType === 'check' && (
                <CheckCircle2 className="w-7 h-7" />
              )}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold mb-1">
                <Building2 className="w-3 h-3" />
                {mentorCompany.name}
              </div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {formData.title || 'Opportunity Title'}
              </h2>
              <p className="text-sm font-medium text-gray-500">
                {formData.field}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                {formData.field}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                Internship
              </span>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Details list */}
          <div className="space-y-3.5 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <span>
                {formData.location} ({formData.locationType})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{formData.type}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{formData.duration}</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Engineering Team</span>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* About Company */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#0c382b]">
              About the Company
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {mentorCompany.aboutCompany}
            </p>
          </div>
        </div>

        {/* Right Column: 2-Step Opportunity Creation Card */}
        <div className="lg:col-span-8 bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Main Title & Subtitle */}
          <div>
            <h1 className="text-2xl font-bold text-[#0c382b]">
              Create Internship Opportunity
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Specify the details for the new internship program at{' '}
              <span className="font-semibold text-gray-800">
                {mentorCompany.name}
              </span>
              .
            </p>
          </div>

          {/* Step Indicator Header */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            {/* Step 1 */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep === 1
                    ? 'bg-[#1b5e3a] text-white ring-4 ring-emerald-800/10'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span
                className={`text-xs sm:text-sm font-medium ${
                  currentStep === 1 ? 'text-gray-900 font-bold' : 'text-gray-600'
                }`}
              >
                Opportunity Information
              </span>
            </div>

            <div className="h-0.5 flex-1 mx-4 bg-gray-200">
              <div
                className={`h-full bg-[#1b5e3a] transition-all duration-300 ${
                  currentStep > 1 ? 'w-full' : 'w-0'
                }`}
              />
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep === 2
                    ? 'bg-[#1b5e3a] text-white ring-4 ring-emerald-800/10'
                    : 'border-2 border-gray-300 text-gray-500'
                }`}
              >
                2
              </div>
              <span
                className={`text-xs sm:text-sm font-medium ${
                  currentStep === 2 ? 'text-gray-900 font-bold' : 'text-gray-600'
                }`}
              >
                Review & Publish
              </span>
            </div>
          </div>

          {/* STEP 1: Opportunity Details Input */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-gray-900">
                  Basic Information
                </h3>

                {/* Organization Disabled Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Organization / Company
                  </label>
                  <div className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-700 font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span>{mentorCompany.name}</span>
                    <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium ml-auto">
                      Auto-selected
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Software Development Intern"
                      className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-800/15 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Field / Specialization <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={formData.field}
                      onChange={(val) => handleCustomSelectChange('field', val)}
                      options={[
                        {
                          value: 'Software Engineering',
                          label: 'Software Engineering',
                        },
                        {
                          value: 'Web Development',
                          label: 'Web Development',
                        },
                        {
                          value: 'Data & Analytics',
                          label: 'Data & Analytics',
                        },
                        {
                          value: 'Quality Assurance',
                          label: 'Quality Assurance',
                        },
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Chișinău, MD"
                      className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-800/15 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Location Type <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={formData.locationType}
                      onChange={(val) =>
                        handleCustomSelectChange('locationType', val)
                      }
                      options={[
                        { value: 'On-site', label: 'On-site' },
                        { value: 'Hybrid', label: 'Hybrid' },
                        { value: 'Remote', label: 'Remote' },
                      ]}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Work Type <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={formData.type}
                      onChange={(val) => handleCustomSelectChange('type', val)}
                      options={[
                        { value: 'Full-time', label: 'Full-time' },
                        { value: 'Part-time', label: 'Part-time' },
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Duration <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={formData.duration}
                      onChange={(val) => handleCustomSelectChange('duration', val)}
                      options={[
                        { value: '1–3 months', label: '1–3 months' },
                        { value: '3–6 months', label: '3–6 months' },
                        { value: '6+ months', label: '6+ months' },
                      ]}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Application Deadline <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-800/15 transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* About Internship Description */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-gray-700">
                  About the Internship <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  name="aboutInternship"
                  value={formData.aboutInternship}
                  onChange={handleInputChange}
                  placeholder="Describe the internship program..."
                  className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-800/15 transition-all resize-none"
                />
              </div>

              {/* Responsibilities List Manager */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-gray-700 block">
                  Responsibilities <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newResp}
                    onChange={(e) => setNewResp(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addResponsibility()
                      }
                    }}
                    placeholder="Add a responsibility..."
                    className="flex-1 bg-gray-50/70 border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-800/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addResponsibility}
                    className="bg-[#1b5e3a] hover:bg-[#14472c] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>

                <ul className="space-y-1.5 pt-1">
                  {formData.responsibilities.map((resp, idx) => (
                    <li
                      key={idx}
                      className="bg-gray-50 border border-gray-200/70 rounded-xl px-3 py-2 text-xs flex items-center justify-between gap-2"
                    >
                      <span className="text-gray-800 font-medium">• {resp}</span>
                      <button
                        type="button"
                        onClick={() => removeResponsibility(idx)}
                        className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements List Manager */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-gray-700 block">
                  Requirements <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newReq}
                    onChange={(e) => setNewReq(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addRequirement()
                      }
                    }}
                    placeholder="Add a requirement..."
                    className="flex-1 bg-gray-50/70 border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-800/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="bg-[#1b5e3a] hover:bg-[#14472c] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>

                <ul className="space-y-1.5 pt-1">
                  {formData.requirements.map((req, idx) => (
                    <li
                      key={idx}
                      className="bg-gray-50 border border-gray-200/70 rounded-xl px-3 py-2 text-xs flex items-center justify-between gap-2"
                    >
                      <span className="text-gray-800 font-medium">• {req}</span>
                      <button
                        type="button"
                        onClick={() => removeRequirement(idx)}
                        className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quiz Requirements Section */}
              <OpportunityQuizRequirements
                quizRequirements={quizRequirements}
                onChange={setQuizRequirements}
              />

              {/* Required Technologies Manager */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-gray-700 block">
                  Required Technologies <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTechnology()
                      }
                    }}
                    placeholder="e.g. React, C#, SQL..."
                    className="flex-1 bg-gray-50/70 border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-800/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addTechnology}
                    className="bg-[#1b5e3a] hover:bg-[#14472c] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Tech</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <span>{tech}</span>
                      <button
                        type="button"
                        onClick={() => removeTechnology(idx)}
                        className="text-emerald-700 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate('/my-opportunities')}
                  className="px-6 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-[#ff5500] hover:bg-[#e64d00] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <span>Continue to Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Review & Submit */}
          {currentStep === 2 && (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 animate-in fade-in duration-200"
            >
              <div>
                <p className="text-xs text-gray-500">
                  Review the opportunity details before publishing.
                </p>
              </div>

              <div className="space-y-4">
                {/* Card 1: Basic Information */}
                <div className="bg-gray-50/40 border border-gray-200/80 rounded-2xl p-5 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">
                      Opportunity Details
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-medium text-[#1b5e3a] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div>
                      <p className="text-gray-400 font-medium">Title</p>
                      <p className="font-semibold text-gray-800">
                        {formData.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">Company</p>
                      <p className="font-semibold text-gray-800">
                        {mentorCompany.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">Field</p>
                      <p className="font-semibold text-gray-800">
                        {formData.field}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">Location</p>
                      <p className="font-semibold text-gray-800">
                        {formData.location} ({formData.locationType})
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">Work Type</p>
                      <p className="font-semibold text-gray-800">
                        {formData.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">Deadline</p>
                      <p className="font-semibold text-gray-800">
                        {formData.deadline}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Program Description */}
                <div className="bg-gray-50/40 border border-gray-200/80 rounded-2xl p-5 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">
                      About the Internship
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-medium text-[#1b5e3a] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {formData.aboutInternship}
                  </p>
                </div>

                {/* Card 3: Responsibilities & Requirements */}
                <div className="bg-gray-50/40 border border-gray-200/80 rounded-2xl p-5 space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">
                      Responsibilities & Requirements
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-medium text-[#1b5e3a] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-gray-800 mb-1.5">
                        Responsibilities:
                      </p>
                      <ul className="space-y-1 text-gray-600">
                        {formData.responsibilities.map((r, i) => (
                          <li key={i}>• {r}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 mb-1.5">
                        Requirements:
                      </p>
                      <ul className="space-y-1 text-gray-600">
                        {formData.requirements.map((r, i) => (
                          <li key={i}>• {r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200/60">
                    <p className="text-xs font-semibold text-gray-800 mb-2">
                      Required Technologies:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.technologies.map((t, i) => (
                        <span
                          key={i}
                          className="bg-white border border-gray-200 text-gray-700 px-2.5 py-0.5 rounded-md text-[11px] font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Step 2 Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSubmit(undefined, 'Draft')}
                      className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
                    >
                      Save as Draft
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSubmit(undefined, 'Open')}
                      className={`text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-xs ${
                        isSubmitting
                          ? 'bg-orange-300 cursor-not-allowed'
                          : 'bg-[#ff5500] hover:bg-[#e64d00] cursor-pointer'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Publish Opportunity</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
