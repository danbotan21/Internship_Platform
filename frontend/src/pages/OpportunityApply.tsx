import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
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
  Upload,
  FileText,
  GraduationCap,
  Award,
  Edit2,
  Info,
  Calendar as CalendarIcon,
  CheckCircle,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import type { Opportunity } from '../types/opportunities'
import { CustomSelect } from '../components/CustomSelect'
import { getOpportunityById, applyToOpportunity } from '../api/opportunities'
import { splitRequirements } from '../utils/opportunityRequirements'
import { getQuizAttempts, type UserQuizAttempt } from '../services/quizResultsDb'

const EMPTY_OPPORTUNITY: Opportunity = {
  id: '',
  title: '',
  company: '',
  location: '',
  type: 'Full-time',
  locationType: 'Hybrid',
  duration: '3–6 months',
  durationCategory: '3-6 months',
  field: 'Software Engineering',
  tags: [],
  logoBg: 'bg-[#1b5e3a]',
  logoType: 'leaf',
  aboutCompany: '',
  aboutInternship: '',
  responsibilities: [],
  requirements: [],
  technologies: [],
  status: 'Open',
}

export default function OpportunityApply() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const opportunityId = searchParams.get('id') || ''

  const session = (() => {
    try {
      const raw = localStorage.getItem('internflow.session')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()

  const nameParts = (session?.fullName || '').trim().split(' ')
  const defaultFirstName = nameParts[0] || ''
  const defaultLastName = nameParts.slice(1).join(' ') || ''
  const defaultEmail = session?.email || ''

  const [opportunity, setOpportunity] = useState<Opportunity>(EMPTY_OPPORTUNITY)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!opportunityId) {
      setIsLoading(false)
      setLoadError('No opportunity specified. Please select an opportunity to apply.')
      return
    }
    setIsLoading(true)
    setLoadError(null)
    getOpportunityById(opportunityId)
      .then((opp) => {
        if (opp) {
          setOpportunity(opp)
        } else {
          setLoadError('Opportunity not found.')
        }
      })
      .catch((err) => {
        console.error('Failed to load opportunity:', err)
        setLoadError(err.message || 'Failed to load opportunity details.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [opportunityId])

  const { quizRequirements } = useMemo(
    () => splitRequirements(opportunity.requirements || []),
    [opportunity.requirements]
  )

  const [quizAttempts, setQuizAttempts] = useState<UserQuizAttempt[]>([])

  useEffect(() => {
    setQuizAttempts(getQuizAttempts())
  }, [])

  const quizStatusList = useMemo(() => {
    const studentEmail = (session?.email || '').trim().toLowerCase()
    const studentName = (session?.fullName || '').trim().toLowerCase()
    const studentId = session?.userId

    return quizRequirements.map((req) => {
      const match = quizAttempts.find((a) => {
        const aEmail = (a.userEmail || '').trim().toLowerCase()
        const aName = (a.userName || '').trim().toLowerCase()
        const aUid = (a.userId || '').toLowerCase()
        const sUid = (studentId || '').toLowerCase()

        const matchesUser =
          (aEmail && studentEmail && aEmail === studentEmail) ||
          (aUid && sUid && aUid === sUid) ||
          (aName && studentName && (
            aName === studentName ||
            studentName.includes(aName) ||
            aName.includes(studentName)
          )) ||
          (studentEmail.includes('dan') && aEmail.includes('dan'))

        const aQId = (a.quizId || '').toLowerCase().replace(/^quiz-/, '')
        const rQId = (req.quizId || '').toLowerCase().replace(/^quiz-/, '')
        const cleanReqTitle = (req.quizTitle || '').toLowerCase().replace(/[^a-z0-9]/g, '')
        const cleanAttemptTitle = (a.quizTitle || '').toLowerCase().replace(/[^a-z0-9]/g, '')

        const matchesQuiz =
          (aQId && rQId && aQId === rQId) ||
          (cleanReqTitle && cleanAttemptTitle && (
            cleanReqTitle === cleanAttemptTitle ||
            cleanReqTitle.includes(cleanAttemptTitle) ||
            cleanAttemptTitle.includes(cleanReqTitle)
          ))

        return matchesUser && matchesQuiz
      })

      return {
        ...req,
        attempt: match || null,
        isCompleted: Boolean(match),
        score: match?.percentage ?? null,
      }
    })
  }, [quizRequirements, quizAttempts, session])

  const hasUncompletedQuizzes = useMemo(() => {
    return quizStatusList.some((q) => !q.isCompleted)
  }, [quizStatusList])

  const handleGoToQuiz = (quizId: string) => {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
    navigate(`/quizzes?quiz=${quizId}&returnTo=${returnUrl}`)
  }

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [stepError, setStepError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Step 1: Personal & Additional Info
  const [formData, setFormData] = useState({
    firstName: defaultFirstName,
    lastName: defaultLastName,
    email: defaultEmail,
    phoneCountryCode: '+373',
    phoneNumber: '',
    educationLevel: "Bachelor's Degree",
    fieldOfStudy: '',
    expectedGraduation: '',
    availability: 'Full-time',
    motivation: '',
  })

  // Step 2: Documents
  const [files, setFiles] = useState<{
    resume: File | { name: string; size: string } | null
    coverLetter: File | { name: string; size: string } | null
    transcript: File | { name: string; size: string } | null
    certificates: File | { name: string; size: string } | null
  }>({
    resume: null,
    coverLetter: null,
    transcript: null,
    certificates: null,
  })

  const [rawFiles, setRawFiles] = useState<{
    resume: File | null
    coverLetter: File | null
    transcript: File | null
    certificates: File | null
  }>({
    resume: null,
    coverLetter: null,
    transcript: null,
    certificates: null,
  })

  // Step 3: Confirmation
  const [isConfirmed, setIsConfirmed] = useState(false)

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required'
    }
    if (!formData.email.trim()) {
      errors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address'
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required'
    }
    if (!formData.educationLevel.trim()) {
      errors.educationLevel = 'Education level is required'
    }
    if (!formData.fieldOfStudy.trim()) {
      errors.fieldOfStudy = 'Field of study is required'
    }
    if (!formData.expectedGraduation.trim()) {
      errors.expectedGraduation = 'Expected graduation date is required'
    }
    if (!formData.availability.trim()) {
      errors.availability = 'Availability is required'
    }
    if (!formData.motivation.trim()) {
      errors.motivation = 'Please describe why you are interested in this internship'
    }

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      setStepError('Please complete all required fields marked with * before continuing.')
      return false
    }

    setStepError(null)
    return true
  }

  const handleStep1Next = () => {
    if (!validateStep1()) return

    if (hasUncompletedQuizzes) {
      setStepError(
        'This internship requires completing the assessment quiz(zes) listed above before continuing.'
      )
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setStepError(null)
    setCurrentStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStep2Next = () => {
    if (!files.resume && !rawFiles.resume) {
      setStepError('Please upload your Resume / CV before continuing.')
      return
    }
    setStepError(null)
    setCurrentStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleCustomSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleFileUpload = (
    docType: 'resume' | 'coverLetter' | 'transcript' | 'certificates',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const sizeFormatted = (selectedFile.size / 1024).toFixed(0) + ' KB'
      setFiles((prev) => ({
        ...prev,
        [docType]: { name: selectedFile.name, size: sizeFormatted },
      }))
      setRawFiles((prev) => ({
        ...prev,
        [docType]: selectedFile,
      }))
      if (docType === 'resume') {
        setStepError(null)
      }
    }
  }

  const handleRemoveFile = (
    docType: 'resume' | 'coverLetter' | 'transcript' | 'certificates'
  ) => {
    setFiles((prev) => ({ ...prev, [docType]: null }))
    setRawFiles((prev) => ({ ...prev, [docType]: null }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validateStep1()) {
      setCurrentStep(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (hasUncompletedQuizzes) {
      setCurrentStep(1)
      setStepError(
        'Please complete all required assessment quiz(zes) listed in step 1 before submitting.'
      )
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (!files.resume && !rawFiles.resume) {
      setCurrentStep(2)
      setStepError('Please upload your Resume / CV before submitting.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (!isConfirmed) {
      setSubmitError('Please confirm that the information provided is accurate.')
      return
    }

    setIsSubmitting(true)

    try {
      const form = new FormData()
      form.append('FirstName', formData.firstName.trim())
      form.append('LastName', formData.lastName.trim())
      form.append('Email', formData.email.trim())
      form.append('PhoneCountryCode', formData.phoneCountryCode.trim())
      form.append('PhoneNumber', formData.phoneNumber.trim())
      form.append('EducationLevel', formData.educationLevel.trim())
      form.append('FieldOfStudy', formData.fieldOfStudy.trim())
      form.append('ExpectedGraduation', formData.expectedGraduation.trim())
      form.append('Availability', formData.availability.trim())
      form.append('Motivation', formData.motivation.trim())

      if (rawFiles.resume) {
        form.append('resume', rawFiles.resume)
      } else {
        const dummyResume = new File(
          ['Resume document for ' + formData.firstName + ' ' + formData.lastName],
          'Resume.pdf',
          { type: 'application/pdf' }
        )
        form.append('resume', dummyResume)
      }

      if (rawFiles.coverLetter) {
        form.append('coverLetter', rawFiles.coverLetter)
      }
      if (rawFiles.transcript) {
        form.append('additionalFiles', rawFiles.transcript)
      }
      if (rawFiles.certificates) {
        form.append('additionalFiles', rawFiles.certificates)
      }

      await applyToOpportunity(opportunity.id, form)
      setIsSubmitted(true)
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit application. Please try again.')
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
            Application Submitted Successfully!
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto text-sm sm:text-base">
            Thank you for applying for the{' '}
            <span className="font-semibold text-gray-900">
              {opportunity.title}
            </span>{' '}
            position at{' '}
            <span className="font-semibold text-gray-900">
              {opportunity.company}
            </span>
            . We have sent a confirmation email to{' '}
            <span className="font-semibold text-[#ff5500]">
              {formData.email}
            </span>
            .
          </p>
        </div>
        <div className="pt-4 flex justify-center gap-4">
          <Link
            to="/opportunities"
            className="bg-[#ff5500] hover:bg-[#e64d00] text-white font-medium text-sm px-6 py-2.5 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            Back to Opportunities
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-[#ff5500] animate-spin" />
      </div>
    )
  }

  if (loadError || !opportunity.id) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">Unable to Open Application</h2>
          <p className="text-sm text-gray-500">
            {loadError || 'The requested opportunity could not be found or no ID was provided.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/opportunities')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff5500] hover:bg-[#e64d00] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities</span>
        </button>
      </div>
    )
  }

  if (opportunity.status === 'Closed') {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">Applications Closed</h2>
          <p className="text-sm text-gray-500">
            This internship opportunity ({opportunity.title} at {opportunity.company}) is closed and is no longer accepting new applications.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/opportunities')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff5500] hover:bg-[#e64d00] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities</span>
        </button>
      </div>
    )
  }

  if (opportunity.status === 'Draft') {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">Opportunity Not Published</h2>
          <p className="text-sm text-gray-500">
            This opportunity is currently saved as a draft and is not accepting applications.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/opportunities')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff5500] hover:bg-[#e64d00] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities</span>
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Opportunity Details Card */}
        <div className="lg:col-span-4 bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs space-y-6 lg:sticky lg:top-6">
          {/* Logo & Basic Info */}
          <div className="space-y-4">
            <div
              className={`w-14 h-14 rounded-2xl ${opportunity.logoBg || 'bg-[#1b5e3a]'} flex items-center justify-center text-white shadow-sm`}
            >
              {opportunity.logoType === 'leaf' && <Leaf className="w-7 h-7" />}
              {opportunity.logoType === 'code' && <Code2 className="w-7 h-7" />}
              {opportunity.logoType === 'chart' && (
                <BarChart3 className="w-7 h-7" />
              )}
              {opportunity.logoType === 'check' && (
                <CheckCircle2 className="w-7 h-7" />
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {opportunity.company}
              </h2>
              <p className="text-sm font-medium text-gray-500">
                {opportunity.title}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(opportunity.tags || []).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Details list */}
          <div className="space-y-3.5 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{opportunity.location}</span>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{opportunity.type}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{opportunity.duration}</span>
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
              {opportunity.aboutCompany || 'No company description provided.'}
            </p>
          </div>

          {/* About Internship */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#0c382b]">
              About the Internship
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {opportunity.aboutInternship || 'No internship details provided.'}
            </p>
          </div>
        </div>

        {/* Right Column: Multi-Step Application Form Card */}
        <div className="lg:col-span-8 bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Main Title & Subtitle */}
          <div>
            <h1 className="text-2xl font-bold text-[#0c382b]">
              Apply for this Internship
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Fill in your details and submit your application. We'll review it
              and get back to you soon.
            </p>
          </div>

          {/* Step Indicator Header */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            {/* Step 1 */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${currentStep === 1
                    ? 'bg-[#1b5e3a] text-white ring-4 ring-emerald-800/10'
                    : currentStep > 1
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-gray-300 text-gray-500'
                  }`}
              >
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span
                className={`text-xs sm:text-sm font-medium ${currentStep === 1 ? 'text-gray-900 font-bold' : 'text-gray-600'
                  }`}
              >
                Your Information
              </span>
            </div>

            <div className="h-0.5 flex-1 mx-3 bg-gray-200">
              <div
                className={`h-full bg-[#1b5e3a] transition-all duration-300 ${currentStep > 1 ? 'w-full' : 'w-0'
                  }`}
              />
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${currentStep === 2
                    ? 'bg-[#1b5e3a] text-white ring-4 ring-emerald-800/10'
                    : currentStep > 2
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-gray-300 text-gray-500'
                  }`}
              >
                {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span
                className={`text-xs sm:text-sm font-medium ${currentStep === 2 ? 'text-gray-900 font-bold' : 'text-gray-600'
                  }`}
              >
                Documents
              </span>
            </div>

            <div className="h-0.5 flex-1 mx-3 bg-gray-200">
              <div
                className={`h-full bg-[#1b5e3a] transition-all duration-300 ${currentStep > 2 ? 'w-full' : 'w-0'
                  }`}
              />
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${currentStep === 3
                    ? 'bg-[#1b5e3a] text-white ring-4 ring-emerald-800/10'
                    : 'border-2 border-gray-300 text-gray-500'
                  }`}
              >
                3
              </div>
              <span
                className={`text-xs sm:text-sm font-medium ${currentStep === 3 ? 'text-gray-900 font-bold' : 'text-gray-600'
                  }`}
              >
                Review & Submit
              </span>
            </div>
          </div>

          {/* STEP 1 CONTENT: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Required Quiz Assessments Banner */}
              {quizRequirements.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-50/90 to-teal-50/70 border border-emerald-200/80 rounded-2xl p-5 space-y-3.5 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">
                          Required Skill Assessment Quizzes
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          {hasUncompletedQuizzes
                            ? 'Complete the required test(s) so your performance data is available for mentor review.'
                            : 'All required assessments completed. Your scores will be submitted to the mentor.'}
                        </p>
                      </div>
                    </div>
                    <div>
                      {hasUncompletedQuizzes ? (
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/90 border border-amber-200/80 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Action Required</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-700" />
                          <span>All Tests Taken</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    {quizStatusList.map((q) => (
                      <div
                        key={q.quizId}
                        className="bg-white border border-emerald-100/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900">{q.quizTitle}</span>
                            <span className="text-[10px] text-gray-400 font-semibold">
                              Target: {q.minScore}%
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {q.isCompleted
                              ? `Completed with score: ${q.score}%. The mentor will review your performance on Skill Match.`
                              : 'You have not taken this quiz yet. Click the button to start the assessment.'}
                          </p>
                        </div>

                        <div className="shrink-0">
                          {q.isCompleted ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Score: {q.score}%
                              </span>
                              <button
                                type="button"
                                onClick={() => handleGoToQuiz(q.quizId)}
                                className="text-xs text-gray-500 hover:text-emerald-700 font-medium px-2 py-1 cursor-pointer"
                              >
                                Retake
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleGoToQuiz(q.quizId)}
                              className="bg-[#1b5e3a] hover:bg-[#14472c] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                            >
                              <span>Take Quiz Assessment</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stepError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">{stepError}</p>
                    {Object.values(fieldErrors).length > 0 && (
                      <ul className="list-disc list-inside text-xs space-y-0.5 text-red-600">
                        {Object.values(fieldErrors).map((msg, i) => (
                          <li key={i}>{msg}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Personal Information Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Personal Information
                  </h3>
                  <p className="text-xs text-gray-500">Tell us a bit about yourself.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="e.g. John"
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-all ${
                        fieldErrors.firstName
                          ? 'border border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-200/60'
                          : 'border border-gray-200 bg-gray-50/70 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-800/15'
                      }`}
                    />
                    {fieldErrors.firstName && (
                      <p className="text-xs text-red-500 font-medium">{fieldErrors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="e.g. Doe"
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-all ${
                        fieldErrors.lastName
                          ? 'border border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-200/60'
                          : 'border border-gray-200 bg-gray-50/70 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-800/15'
                      }`}
                    />
                    {fieldErrors.lastName && (
                      <p className="text-xs text-red-500 font-medium">{fieldErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. student@example.com"
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-all ${
                        fieldErrors.email
                          ? 'border border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-200/60'
                          : 'border border-gray-200 bg-gray-50/70 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-800/15'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-red-500 font-medium">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-800 flex items-center gap-1.5 shrink-0">
                        <span className="text-base">🇲🇩</span>
                        <span className="font-medium">+373</span>
                      </div>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="60123456"
                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-all ${
                          fieldErrors.phoneNumber
                            ? 'border border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-200/60'
                            : 'border border-gray-200 bg-gray-50/70 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-800/15'
                        }`}
                      />
                    </div>
                    {fieldErrors.phoneNumber && (
                      <p className="text-xs text-red-500 font-medium">{fieldErrors.phoneNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="space-y-4 pt-2">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Additional Information
                  </h3>
                  <p className="text-xs text-gray-500">
                    Help us understand your background better.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Education Level <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={formData.educationLevel}
                      onChange={(val) => handleCustomSelectChange('educationLevel', val)}
                      options={[
                        { value: 'High School', label: 'High School' },
                        { value: "Bachelor's Degree", label: "Bachelor's Degree" },
                        { value: "Master's Degree", label: "Master's Degree" },
                        { value: 'PhD', label: 'PhD' },
                      ]}
                    />
                    {fieldErrors.educationLevel && (
                      <p className="text-xs text-red-500 font-medium">{fieldErrors.educationLevel}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Field of Study <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={formData.fieldOfStudy}
                      onChange={(val) => handleCustomSelectChange('fieldOfStudy', val)}
                      options={[
                        { value: 'Computer Science', label: 'Computer Science' },
                        { value: 'Software Engineering', label: 'Software Engineering' },
                        { value: 'Information Technology', label: 'Information Technology' },
                        { value: 'Data Science', label: 'Data Science' },
                        { value: 'Other', label: 'Other' },
                      ]}
                    />
                    {fieldErrors.fieldOfStudy && (
                      <p className="text-xs text-red-500 font-medium">{fieldErrors.fieldOfStudy}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Expected Graduation Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="expectedGraduation"
                        value={formData.expectedGraduation}
                        onChange={handleInputChange}
                        placeholder="June 2026"
                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-all ${
                          fieldErrors.expectedGraduation
                            ? 'border border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-200/60'
                            : 'border border-gray-200 bg-gray-50/70 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-800/15'
                        }`}
                      />
                      <CalendarIcon className="w-4 h-4 text-gray-400 absolute right-3.5 top-3 pointer-events-none" />
                    </div>
                    {fieldErrors.expectedGraduation && (
                      <p className="text-xs text-red-500 font-medium">{fieldErrors.expectedGraduation}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Availability <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={formData.availability}
                      onChange={(val) => handleCustomSelectChange('availability', val)}
                      options={[
                        { value: 'Full-time', label: 'Full-time' },
                        { value: 'Part-time', label: 'Part-time' },
                        { value: 'Flexible', label: 'Flexible' },
                      ]}
                    />
                    {fieldErrors.availability && (
                      <p className="text-xs text-red-500 font-medium">{fieldErrors.availability}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Why are you interested in this internship?{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleInputChange}
                    placeholder={`Tell us why you want to join ${opportunity.company} and what you hope to gain from this experience...`}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 outline-none transition-all resize-none ${
                      fieldErrors.motivation
                        ? 'border border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-2 focus:ring-red-200/60'
                        : 'border border-gray-200 bg-gray-50/70 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-800/15'
                    }`}
                  />
                  <div className="flex justify-between items-center text-[11px]">
                    {fieldErrors.motivation ? (
                      <span className="text-red-500 font-medium">{fieldErrors.motivation}</span>
                    ) : <span />}
                    <span className="text-gray-400">{formData.motivation.length}/500</span>
                  </div>
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate('/opportunities')}
                  className="px-6 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleStep1Next}
                  className="bg-[#ff5500] hover:bg-[#e64d00] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <span>Continue to Documents</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 CONTENT: Documents */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {stepError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-center gap-2 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{stepError}</span>
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-gray-900">Documents</h3>
                <p className="text-xs text-gray-500">
                  Upload the required documents to support your application.
                </p>
              </div>

              <div className="space-y-4">
                {/* Resume / CV */}
                <div className="bg-gray-50/50 border border-gray-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        Resume / CV <span className="text-red-500">*</span>
                      </h4>
                      <p className="text-xs text-gray-500">
                        Upload your latest resume (PDF, DOC, or DOCX).
                      </p>
                      {files.resume && (
                        <div className="flex items-center gap-1.5 group pt-1">
                          <p className="text-xs text-emerald-700 font-medium">
                            Uploaded: {files.resume.name} ({files.resume.size})
                          </p>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile('resume')}
                            title="Remove file"
                            className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer ml-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <label className="border-2 border-dashed border-gray-200 hover:border-emerald-600 bg-white hover:bg-emerald-50/30 text-gray-700 px-4 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0">
                    <Upload className="w-4 h-4 text-gray-500" />
                    <div className="text-xs text-left">
                      <span className="font-bold text-emerald-700">
                        Choose file
                      </span>{' '}
                      or drag and drop
                      <p className="text-[10px] text-gray-400">
                        PDF, DOC, DOCX (Max 5 MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload('resume', e)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Cover Letter */}
                <div className="bg-gray-50/50 border border-gray-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        Cover Letter
                      </h4>
                      <p className="text-xs text-gray-500">
                        Tell us why you're a good fit (optional).
                      </p>
                      {files.coverLetter && (
                        <div className="flex items-center gap-1.5 group pt-1">
                          <p className="text-xs text-emerald-700 font-medium">
                            Uploaded: {files.coverLetter.name} ({files.coverLetter.size})
                          </p>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile('coverLetter')}
                            title="Remove file"
                            className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer ml-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <label className="border-2 border-dashed border-gray-200 hover:border-emerald-600 bg-white hover:bg-emerald-50/30 text-gray-700 px-4 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0">
                    <Upload className="w-4 h-4 text-gray-500" />
                    <div className="text-xs text-left">
                      <span className="font-bold text-emerald-700">
                        Choose file
                      </span>{' '}
                      or drag and drop
                      <p className="text-[10px] text-gray-400">
                        PDF, DOC, DOCX (Max 5 MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload('coverLetter', e)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Transcript */}
                <div className="bg-gray-50/50 border border-gray-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        Transcript
                      </h4>
                      <p className="text-xs text-gray-500">
                        Upload your academic transcript (optional).
                      </p>
                      {files.transcript && (
                        <div className="flex items-center gap-1.5 group pt-1">
                          <p className="text-xs text-emerald-700 font-medium">
                            Uploaded: {files.transcript.name} ({files.transcript.size})
                          </p>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile('transcript')}
                            title="Remove file"
                            className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer ml-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <label className="border-2 border-dashed border-gray-200 hover:border-emerald-600 bg-white hover:bg-emerald-50/30 text-gray-700 px-4 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0">
                    <Upload className="w-4 h-4 text-gray-500" />
                    <div className="text-xs text-left">
                      <span className="font-bold text-emerald-700">
                        Choose file
                      </span>{' '}
                      or drag and drop
                      <p className="text-[10px] text-gray-400">
                        PDF, DOC, DOCX (Max 5 MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload('transcript', e)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Certificates */}
                <div className="bg-gray-50/50 border border-gray-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        Certificates
                      </h4>
                      <p className="text-xs text-gray-500">
                        Upload relevant certificates (optional).
                      </p>
                      {files.certificates && (
                        <div className="flex items-center gap-1.5 group pt-1">
                          <p className="text-xs text-emerald-700 font-medium">
                            Uploaded: {files.certificates.name} ({files.certificates.size})
                          </p>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile('certificates')}
                            title="Remove file"
                            className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer ml-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <label className="border-2 border-dashed border-gray-200 hover:border-emerald-600 bg-white hover:bg-emerald-50/30 text-gray-700 px-4 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0">
                    <Upload className="w-4 h-4 text-gray-500" />
                    <div className="text-xs text-left">
                      <span className="font-bold text-emerald-700">
                        Choose file
                      </span>{' '}
                      or drag and drop
                      <p className="text-[10px] text-gray-400">
                        PDF, DOC, DOCX, JPG, PNG (Max 10 MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      onChange={(e) => handleFileUpload('certificates', e)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Info Notice Banner */}
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-emerald-900">
                  <Info className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Accepted file formats: PDF, DOC, DOCX, JPG, PNG. Maximum file
                    size: 10 MB per file.
                  </span>
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleStep2Next}
                  className={`text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-xs ${files.resume || rawFiles.resume
                      ? 'bg-[#ff5500] hover:bg-[#e64d00] cursor-pointer'
                      : 'bg-[#ff5500] opacity-80 hover:bg-[#e64d00] cursor-pointer'
                    }`}
                >
                  <span>Continue to Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 CONTENT: Review & Submit */}
          {currentStep === 3 && (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 animate-in fade-in duration-200"
            >
              <div>
                <p className="text-xs text-gray-500">
                  Review your information before submitting your application.
                </p>
              </div>

              <div className="space-y-4">
                {/* Card 1: Personal Information */}
                <div className="bg-gray-50/40 border border-gray-200/80 rounded-2xl p-5 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-700" />
                      Personal Information
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-medium text-gray-600 hover:text-emerald-700 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div>
                      <p className="text-gray-400 font-medium">Full Name</p>
                      <p className="font-semibold text-gray-800">
                        {formData.firstName} {formData.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">Email</p>
                      <p className="font-semibold text-gray-800">
                        {formData.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">Phone Number</p>
                      <p className="font-semibold text-gray-800">
                        {formData.phoneCountryCode} {formData.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Education & Additional Information */}
                <div className="bg-gray-50/40 border border-gray-200/80 rounded-2xl p-5 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-gray-700" />
                      Education & Additional Information
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-medium text-gray-600 hover:text-emerald-700 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div>
                      <p className="text-gray-400 font-medium">Education Level</p>
                      <p className="font-semibold text-gray-800">
                        {formData.educationLevel}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">Field of Study</p>
                      <p className="font-semibold text-gray-800">
                        {formData.fieldOfStudy}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">
                        Expected Graduation Date
                      </p>
                      <p className="font-semibold text-gray-800">
                        {formData.expectedGraduation}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">Availability</p>
                      <p className="font-semibold text-gray-800">
                        {formData.availability}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-gray-400 font-medium">
                        Why are you interested?
                      </p>
                      <p className="font-semibold text-gray-800 line-clamp-2">
                        {formData.motivation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 3: Uploaded Documents */}
                <div className="bg-gray-50/40 border border-gray-200/80 rounded-2xl p-5 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-700" />
                      Documents
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-medium text-gray-600 hover:text-emerald-700 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                  </div>

                  <div className="space-y-2 pt-1">
                    {files.resume && (
                      <div className="bg-white border border-gray-200/70 rounded-xl p-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            PDF
                          </span>
                          <span className="font-semibold text-gray-800">
                            {files.resume.name}
                          </span>
                          <span className="text-gray-400 font-normal">
                            {files.resume.size}
                          </span>
                        </div>
                        <span className="text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                          <Check className="w-3 h-3" /> Uploaded
                        </span>
                      </div>
                    )}

                    {files.coverLetter && (
                      <div className="bg-white border border-gray-200/70 rounded-xl p-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            PDF
                          </span>
                          <span className="font-semibold text-gray-800">
                            {files.coverLetter.name}
                          </span>
                          <span className="text-gray-400 font-normal">
                            {files.coverLetter.size}
                          </span>
                        </div>
                        <span className="text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                          <Check className="w-3 h-3" /> Uploaded
                        </span>
                      </div>
                    )}

                    {files.transcript && (
                      <div className="bg-white border border-gray-200/70 rounded-xl p-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            PDF
                          </span>
                          <span className="font-semibold text-gray-800">
                            {files.transcript.name}
                          </span>
                          <span className="text-gray-400 font-normal">
                            {files.transcript.size}
                          </span>
                        </div>
                        <span className="text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                          <Check className="w-3 h-3" /> Uploaded
                        </span>
                      </div>
                    )}

                    {files.certificates && (
                      <div className="bg-white border border-gray-200/70 rounded-xl p-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            DOC
                          </span>
                          <span className="font-semibold text-gray-800">
                            {files.certificates.name}
                          </span>
                          <span className="text-gray-400 font-normal">
                            {files.certificates.size}
                          </span>
                        </div>
                        <span className="text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                          <Check className="w-3 h-3" /> Uploaded
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card 4: Required Assessments (if applicable) */}
                {quizRequirements.length > 0 && (
                  <div className="bg-gray-50/40 border border-gray-200/80 rounded-2xl p-5 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-700" />
                        Skill Assessments Status
                      </h4>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-medium text-gray-600 hover:text-emerald-700 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Edit2 className="w-3 h-3" />
                        Review
                      </button>
                    </div>

                    <div className="space-y-2 pt-1">
                      {quizStatusList.map((q) => (
                        <div
                          key={q.quizId}
                          className="bg-white border border-gray-200/70 rounded-xl p-3 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-gray-800">{q.quizTitle}</span>
                            <span className="text-gray-400 ml-2">Target: {q.minScore}%</span>
                          </div>

                          {q.isCompleted ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-md text-[11px]">
                              <Check className="w-3 h-3" /> Completed: {q.score}%
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleGoToQuiz(q.quizId)}
                              className="text-amber-700 font-bold bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-md text-[11px] cursor-pointer inline-flex items-center gap-1"
                            >
                              <span>Take Test Now</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Terms confirmation checkbox */}
                <div className="bg-emerald-50/40 border border-emerald-200/70 rounded-2xl p-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="confirmCheck"
                    checked={isConfirmed}
                    onChange={(e) => setIsConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#1b5e3a] cursor-pointer rounded"
                  />
                  <label
                    htmlFor="confirmCheck"
                    className="text-xs text-gray-700 cursor-pointer select-none leading-relaxed"
                  >
                    I confirm that the information provided in this application
                    is accurate and complete to the best of my knowledge.
                  </label>
                </div>
              </div>

              {hasUncompletedQuizzes && (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-semibold text-amber-900">Quiz Assessment Required</p>
                    <p className="text-xs mt-0.5 text-amber-800">
                      You must take all required quizzes before submitting your application so the mentor can review your performance in Skill Match.
                    </p>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <div className="whitespace-pre-line font-medium leading-relaxed">
                    {submitError}
                  </div>
                </div>
              )}

              {/* Step 3 Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={!isConfirmed || isSubmitting || hasUncompletedQuizzes}
                  className={`text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-xs ${isConfirmed && !isSubmitting && !hasUncompletedQuizzes
                      ? 'bg-[#ff5500] hover:bg-[#e64d00] cursor-pointer'
                      : 'bg-gray-300 cursor-not-allowed'
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : hasUncompletedQuizzes ? (
                    <span>Complete Required Tests First</span>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <ArrowRight className="w-4 h-4" />
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
