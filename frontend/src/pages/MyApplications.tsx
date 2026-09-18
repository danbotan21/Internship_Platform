import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileCheck,
  Building2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Clock3,
  XCircle,
  Eye,
  FileText,
} from 'lucide-react'
import { MOCK_OPPORTUNITIES } from '../types/opportunities'

interface Application {
  id: string
  opportunityId: string
  appliedDate: string
  status: 'Under Review' | 'Interview Scheduled' | 'Accepted' | 'Rejected'
  step: string
}

const MOCK_MY_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    opportunityId: '1',
    appliedDate: '18 Sep 2026',
    status: 'Under Review',
    step: 'Document Review',
  },
  {
    id: 'app-2',
    opportunityId: '2',
    appliedDate: '10 Sep 2026',
    status: 'Interview Scheduled',
    step: 'Technical Interview',
  },
]

export default function MyApplications() {
  const [filterStatus, setFilterStatus] = useState<string>('All')

  const applicationsWithDetails = MOCK_MY_APPLICATIONS.map((app) => {
    const opp = MOCK_OPPORTUNITIES.find((o) => o.id === app.opportunityId)
    return {
      ...app,
      opportunity: opp,
    }
  }).filter((app) => {
    if (filterStatus === 'All') return true
    return app.status === filterStatus
  })

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock3 className="w-3.5 h-3.5" />
            Under Review
          </span>
        )
      case 'Interview Scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Calendar className="w-3.5 h-3.5" />
            Interview Scheduled
          </span>
        )
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Accepted
          </span>
        )
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        )
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0c382b] flex items-center gap-2.5">
          <FileCheck className="w-7 h-7 text-[#1b5e3a]" />
          My Applications
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Track and manage your submitted internship applications.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto no-scrollbar">
        {['All', 'Under Review', 'Interview Scheduled', 'Accepted', 'Rejected'].map(
          (status) => {
            const isActive = filterStatus === status
            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1b5e3a] text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                }`}
              >
                {status}
              </button>
            )
          }
        )}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applicationsWithDetails.map((app) => (
          <div
            key={app.id}
            className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            {/* Left: Info */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center justify-between md:justify-start gap-3">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  {app.opportunity?.title || 'Software Development Intern'}
                </h3>
                {getStatusBadge(app.status)}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1.5 font-medium text-gray-800">
                  <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{app.opportunity?.company}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{app.opportunity?.location}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Applied on {app.appliedDate}</span>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2 inline-flex items-center gap-2 text-xs text-gray-600">
                <span className="font-semibold text-gray-800">Current Step:</span>
                <span>{app.step}</span>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 shrink-0">
              <Link
                to={`/my-applications/application-details?id=${app.opportunityId}`}
                className="bg-[#ff5500] hover:bg-[#e64d00] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Details</span>
              </Link>
            </div>
          </div>
        ))}

        {applicationsWithDetails.length === 0 && (
          <div className="bg-white border border-gray-200/70 rounded-2xl p-10 text-center space-y-3">
            <FileText className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-gray-600 font-medium text-sm">
              No applications found matching status "{filterStatus}".
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
