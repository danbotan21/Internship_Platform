import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileCheck,
  Building2,
  Clock,
  MapPin,
  CheckCircle2,
  Clock3,
  XCircle,
  Eye,
  FileText,
  Search,
  X,
  Briefcase,
} from 'lucide-react'
import { MOCK_OPPORTUNITIES } from '../types/opportunities'
import { CustomSelect } from '../components/CustomSelect'

interface Application {
  id: string
  opportunityId: string
  appliedDate: string
  status: 'Under Review' | 'Accepted' | 'Rejected'
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
    status: 'Under Review',
    step: 'Technical Assessment',
  },
  {
    id: 'app-3',
    opportunityId: '3',
    appliedDate: '01 Sep 2026',
    status: 'Accepted',
    step: 'Offer Accepted',
  },
  {
    id: 'app-4',
    opportunityId: '4',
    appliedDate: '15 Aug 2026',
    status: 'Rejected',
    step: 'Application Closed',
  },
]

export default function MyApplications() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [filterWorkType, setFilterWorkType] = useState<string>('All')
  const [filterLocation, setFilterLocation] = useState<string>('All')

  const resetFilters = () => {
    setSearchQuery('')
    setFilterStatus('All')
    setFilterWorkType('All')
    setFilterLocation('All')
  }

  const applicationsWithDetails = MOCK_MY_APPLICATIONS.map((app) => {
    const opp = MOCK_OPPORTUNITIES.find((o) => o.id === app.opportunityId)
    return {
      ...app,
      opportunity: opp,
    }
  }).filter((app) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const title = app.opportunity?.title?.toLowerCase() || ''
      const company = app.opportunity?.company?.toLowerCase() || ''
      const location = app.opportunity?.location?.toLowerCase() || ''
      if (!title.includes(q) && !company.includes(q) && !location.includes(q)) {
        return false
      }
    }

    // Status filter
    if (filterStatus !== 'All' && app.status !== filterStatus) {
      return false
    }

    // Work Type filter
    if (filterWorkType !== 'All' && app.opportunity?.type !== filterWorkType) {
      return false
    }

    // Location Type filter
    if (filterLocation !== 'All' && app.opportunity?.locationType !== filterLocation) {
      return false
    }

    return true
  })

  // Overview Counts
  const totalCount = MOCK_MY_APPLICATIONS.length
  const reviewCount = MOCK_MY_APPLICATIONS.filter((a) => a.status === 'Under Review').length
  const acceptedCount = MOCK_MY_APPLICATIONS.filter((a) => a.status === 'Accepted').length
  const rejectedCount = MOCK_MY_APPLICATIONS.filter((a) => a.status === 'Rejected').length

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock3 className="w-3.5 h-3.5" />
            Under Review
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

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applications */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-800 shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            <p className="text-xs font-medium text-gray-500">Total Applications</p>
          </div>
        </div>

        {/* Under Review */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{reviewCount}</p>
            <p className="text-xs font-medium text-gray-500">Under Review</p>
          </div>
        </div>

        {/* Accepted */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{acceptedCount}</p>
            <p className="text-xs font-medium text-gray-500">Accepted</p>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
            <p className="text-xs font-medium text-gray-500">Rejected</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar (matching My Opportunities) */}
      <div className="flex flex-col lg:flex-row items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full bg-white rounded-xl border border-gray-200/80 shadow-xs flex items-center px-3.5 py-2">
          <Search className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, company or location..."
            className="w-full bg-transparent text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-gray-400 hover:text-gray-600 cursor-pointer shrink-0 ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="w-36">
            <CustomSelect
              size="sm"
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: 'All', label: 'Status: All' },
                { value: 'Under Review', label: 'Under Review' },
                { value: 'Accepted', label: 'Accepted' },
                { value: 'Rejected', label: 'Rejected' },
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
              No applications match your search or filter criteria.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ff5500] hover:underline cursor-pointer pt-1"
            >
              Reset search & filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
