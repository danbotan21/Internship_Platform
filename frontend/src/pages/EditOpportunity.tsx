import { useState, useEffect } from 'react'
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
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { CustomSelect } from '../components/CustomSelect'
import { getOpportunityById, updateOpportunity } from '../api/opportunities'
import type { CreateOpportunityPayload } from '../types/opportunities'
import OpportunityQuizRequirements from '../components/opportunities/OpportunityQuizRequirements'
import { splitRequirements, combineRequirements, type QuizRequirement } from '../utils/opportunityRequirements'

const BLANK_FORM_DATA = {
  title: '',
  field: 'Software Engineering',
  location: '',
  locationType: 'Hybrid',
  type: 'Full-time',
  duration: '3–6 months',
  deadline: '',
  company: '',
  logoBg: 'bg-[#1b5e3a]',
  logoType: 'leaf',
  aboutCompany: '',
  aboutInternship: '',
  responsibilities: [] as string[],
  requirements: [] as string[],
  technologies: [] as string[],
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
  const id = searchParams.get('id') || ''

  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [isSaved, setIsSaved] = useState(false)

  const [formData, setFormData] = useState(BLANK_FORM_DATA)
  const [newResp, setNewResp] = useState('')
  const [newReq, setNewReq]   = useState('')
  const [newTech, setNewTech] = useState('')
  const [quizRequirements, setQuizRequirements] = useState<QuizRequirement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [opportunityStatus, setOpportunityStatus] = useState<'Open' | 'Closed' | 'Draft'>('Open')

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      setLoadError('No opportunity ID provided.')
      return
    }
    setIsLoading(true)
    setLoadError(null)
    getOpportunityById(id)
      .then((opp) => {
        if (opp) {
          const normDuration = (opp.duration || opp.durationCategory || '3-6 months').replace('-', '–')
          if (opp.status === 'Closed' || opp.status === 'Draft' || opp.status === 'Open') {
            setOpportunityStatus(opp.status)
          }
          const rawReqs = Array.isArray(opp.requirements) ? opp.requirements : []
          const { textRequirements, quizRequirements: parsedQuizzes } = splitRequirements(rawReqs)
          setQuizRequirements(parsedQuizzes)

          setFormData({
            title: opp.title || '',
            field: opp.field || 'Software Engineering',
            location: opp.location || '',
            locationType: opp.locationType || 'Hybrid',
            type: opp.type || 'Full-time',
            duration: normDuration,
            deadline: opp.deadline || '',
            company: opp.company || '',
            logoBg: opp.logoBg || 'bg-[#1b5e3a]',
            logoType: opp.logoType || 'leaf',
            aboutCompany: opp.aboutCompany || '',
            aboutInternship: opp.aboutInternship || '',
            responsibilities: Array.isArray(opp.responsibilities) ? opp.responsibilities : [],
            requirements: textRequirements,
            technologies: Array.isArray(opp.technologies) ? opp.technologies : [],
          })
        } else {
          setLoadError('Opportunity not found.')
        }
      })
      .catch((err) => {
        console.error('Failed to load opportunity:', err)
        setLoadError(err.message || 'Failed to load opportunity details.')
      })
      .finally(() => setIsLoading(false))
  }, [id])

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveError(null)

    try {
      const payload: CreateOpportunityPayload = {
        title: formData.title,
        description: formData.aboutInternship,
        location: formData.location,
        locationType: formData.locationType === 'On-site' ? 'OnSite' : formData.locationType,
        type: formData.type === 'Full-time' ? 'FullTime' : 'PartTime',
        field: formData.field,
        durationCategory: (formData.duration || '3-6 months').replace('–', '-'),
        company: formData.company,
        logoBg: formData.logoBg,
        logoType: formData.logoType,
        aboutCompany: formData.aboutCompany || `${formData.company} description`,
        aboutInternship: formData.aboutInternship,
        responsibilities: formData.responsibilities,
        requirements: combineRequirements(formData.requirements, quizRequirements),
        technologies: formData.technologies,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : new Date().toISOString(),
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 86400000).toISOString(),
        status: opportunityStatus,
      }

      await updateOpportunity(id, payload)
      setIsSaved(true)
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update opportunity. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const inputClass = 'w-full bg-gray-50/70 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-800/15 transition-all'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#ff5500] animate-spin" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">Failed to Load Opportunity</h2>
          <p className="text-sm text-gray-500">{loadError}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/my-opportunities')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff5500] hover:bg-[#e64d00] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Opportunities</span>
        </button>
      </div>
    )
  }

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

              {/* Quiz Requirements */}
              <OpportunityQuizRequirements
                quizRequirements={quizRequirements}
                onChange={setQuizRequirements}
              />

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

                {saveError && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{saveError}</span>
                  </div>
                )}

                {/* Step 2 Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Edit
                  </button>
                  <button type="submit"
                    disabled={isSaving}
                    className={`text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-xs ${
                      isSaving
                        ? 'bg-orange-300 cursor-not-allowed'
                        : 'bg-[#ff5500] hover:bg-[#e64d00] cursor-pointer'
                    }`}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
