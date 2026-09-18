import { useSearchParams, useNavigate } from 'react-router-dom'
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
  ArrowLeft,
  FileText,
  GraduationCap,
  Clock3,
} from 'lucide-react'
import { MOCK_OPPORTUNITIES } from '../types/opportunities'

export default function ApplicationDetails() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const opportunityId = searchParams.get('id') || '1'

  const opportunity =
    MOCK_OPPORTUNITIES.find((opp) => opp.id === opportunityId) ||
    MOCK_OPPORTUNITIES[0]

  // Mock submitted application data for review display
  const applicationData = {
    appliedDate: '18 Sep 2026',
    status: 'Under Review',
    step: 'Document Review',
    firstName: 'Daniel',
    lastName: 'Chițanu',
    email: 'daniel.chitanu@example.com',
    phoneCountryCode: '+373',
    phoneNumber: '68 123 456',
    educationLevel: "Bachelor's Degree",
    fieldOfStudy: 'Computer Science',
    expectedGraduation: 'June 2026',
    availability: 'Full-time',
    motivation:
      'I am passionate about software development and want to gain hands-on experience in a company that builds innovative and sustainable solutions.',
    files: [
      { name: 'Resume_Daniel_Chitanu.pdf', size: '245 KB', type: 'PDF' },
      { name: 'Cover_Letter.pdf', size: '180 KB', type: 'PDF' },
      { name: 'Transcript.pdf', size: '350 KB', type: 'PDF' },
    ],
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-6">
      {/* Top Back Nav & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/my-applications')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Applications</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Status:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
            <Clock3 className="w-3.5 h-3.5" />
            {applicationData.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Opportunity Details Card */}
        <div className="lg:col-span-4 bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs space-y-6 lg:sticky lg:top-6">
          {/* Logo & Basic Info */}
          <div className="space-y-4">
            <div
              className={`w-14 h-14 rounded-2xl ${opportunity.logoBg} flex items-center justify-center text-white shadow-sm`}
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
              {opportunity.tags.map((tag, idx) => (
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
              {opportunity.aboutCompany}
            </p>
          </div>

          {/* About Internship */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#0c382b]">
              About the Internship
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {opportunity.aboutInternship}
            </p>
          </div>
        </div>

        {/* Right Column: Submitted Application Review Card */}
        <div className="lg:col-span-8 bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Main Title & Subtitle */}
          <div>
            <h1 className="text-2xl font-bold text-[#0c382b]">
              Application Details
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Submitted on {applicationData.appliedDate} • Current stage:{' '}
              <span className="font-semibold text-gray-800">
                {applicationData.step}
              </span>
            </p>
          </div>

          <hr className="border-gray-100" />

          {/* Review Sections */}
          <div className="space-y-5">
            {/* Card 1: Personal Information */}
            <div className="bg-gray-50/40 border border-gray-200/80 rounded-2xl p-5 space-y-3 relative">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-700" />
                Personal Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <p className="text-gray-400 font-medium">Full Name</p>
                  <p className="font-semibold text-gray-800">
                    {applicationData.firstName} {applicationData.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Email</p>
                  <p className="font-semibold text-gray-800">
                    {applicationData.email}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Phone Number</p>
                  <p className="font-semibold text-gray-800">
                    {applicationData.phoneCountryCode}{' '}
                    {applicationData.phoneNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Education & Additional Information */}
            <div className="bg-gray-50/40 border border-gray-200/80 rounded-2xl p-5 space-y-3 relative">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-gray-700" />
                Education & Additional Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <p className="text-gray-400 font-medium">Education Level</p>
                  <p className="font-semibold text-gray-800">
                    {applicationData.educationLevel}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Field of Study</p>
                  <p className="font-semibold text-gray-800">
                    {applicationData.fieldOfStudy}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">
                    Expected Graduation Date
                  </p>
                  <p className="font-semibold text-gray-800">
                    {applicationData.expectedGraduation}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium">Availability</p>
                  <p className="font-semibold text-gray-800">
                    {applicationData.availability}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-gray-400 font-medium">
                    Why are you interested?
                  </p>
                  <p className="font-semibold text-gray-800">
                    {applicationData.motivation}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Uploaded Documents */}
            <div className="bg-gray-50/40 border border-gray-200/80 rounded-2xl p-5 space-y-3 relative">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-700" />
                Submitted Documents
              </h4>

              <div className="space-y-2 pt-1">
                {applicationData.files.map((file, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-200/70 rounded-xl p-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {file.type}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {file.name}
                      </span>
                      <span className="text-gray-400 font-normal">
                        {file.size}
                      </span>
                    </div>
                    <span className="text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-md text-[11px]">
                      <Check className="w-3.5 h-3.5" /> Uploaded
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
