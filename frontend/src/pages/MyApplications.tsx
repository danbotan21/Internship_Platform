import { useState, useEffect } from 'react'
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
  Loader2,
} from 'lucide-react'
import { MOCK_OPPORTUNITIES } from '../types/opportunities'
import type { Opportunity } from '../types/opportunities'
import { CustomSelect } from '../components/CustomSelect'
import { getMyApplications, getOpportunities } from '../api/opportunities'

interface DisplayApplication {
  id: string
  opportunityId: string
  appliedDate: string
  status: 'Pending' | 'Under Review' | 'Accepted' | 'Rejected' | string
  step: string
  opportunity?: Opportunity
}

const FALLBACK_MY_APPLICATIONS: DisplayApplication[] = [
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
  const [applications, setApplications] = useState<DisplayApplication[]>([])
  const [opportunitiesMap, setOpportunitiesMap] = useState<Record<string, Opportunity>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [filterWorkType, setFilterWorkType] = useState<string>('All')
  const [filterLocation, setFilterLocation] = useState<string>('All')

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [oppsRes, appsRes] = await Promise.all([
          getOpportunities().catch(() => ({ items: MOCK_OPPORTUNITIES, pagination: { totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 } })),
          getMyApplications().catch(() => null),
        ])

        const opps = oppsRes?.items?.length ? oppsRes.items : MOCK_OPPORTUNITIES
        const oppMap: Record<string, Opportunity> = {}
        opps.forEach((o) => {
          oppMap[o.id] = o
        })
        setOpportunitiesMap(oppMap)

        if (appsRes && appsRes.length > 0) {
          const displayApps: DisplayApplication[] = appsRes.map((a) => {
            const opp = oppMap[String(a.opportunityId)] || {
              id: String(a.opportunityId),
              title: a.opportunityTitle,
              company: a.company,
              location: 'Chișinău, MD',
              locationType: 'On-site',
              type: 'Full-time',
              duration: '3–6 months',
              durationCategory: '3-6 months',
              field: 'Software Engineering',
              tags: ['Internship'],
              logoBg: 'bg-[#1b5e3a]',
              logoType: 'leaf',
              aboutCompany: '',
              aboutInternship: '',
              responsibilities: [],
              requirements: [],
              technologies: [],
            }

            const step =
              a.status === 'Accepted'
                ? 'Offer Accepted'
                : a.status === 'Rejected'
                ? 'Application Closed'
                : 'Document Review'

            const appliedDate = a.appliedAt
              ? new Date(a.appliedAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Recent'

            return {
              id: String(a.id),
              opportunityId: String(a.opportunityId),
              appliedDate,
              status: a.status,
              step,
              opportunity: opp,
            }
          })
          setApplications(displayApps)
        } else {
          // Use fallback mock items mapped to opps
          setApplications(
            FALLBACK_MY_APPLICATIONS.map((fa) => ({
              ...fa,
              opportunity: oppMap[fa.opportunityId] || MOCK_OPPORTUNITIES[0],
            }))
          )
        }
      } catch {
        setApplications(
          FALLBACK_MY_APPLICATIONS.map((fa) => ({
            ...fa,
            opportunity: MOCK_OPPORTUNITIES.find((o) => o.id === fa.opportunityId),
          }))
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const resetFilters = () => {
    setSearchQuery('')
    setFilterStatus('All')
    setFilterWorkType('All')
    setFilterLocation('All')
  }

  const applicationsWithDetails = applications.filter((app) => {
    const opp = app.opportunity || opportunitiesMap[app.opportunityId]

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const title = opp?.title?.toLowerCase() || ''
      const company = opp?.company?.toLowerCase() || ''
      const location = opp?.location?.toLowerCase() || ''
      if (!title.includes(q) && !company.includes(q) && !location.includes(q)) {
        return false
      }
    }

    // Status filter
    if (filterStatus !== 'All' && app.status !== filterStatus) {
      return false
    }

    // Work Type filter
    if (filterWorkType !== 'All' && opp?.type !== filterWorkType) {
      return false
    }

    // Location Type filter
    if (filterLocation !== 'All' && opp?.locationType !== filterLocation) {
      return false
    }

    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Under Review':
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock3 className="w-3.5 h-3.5" />
            {status}
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
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            {status}
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

      {/* Filter and Search Bar */}
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
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#ff5500] animate-spin" />
          </div>
        )}

        {!isLoading &&
          applicationsWithDetails.map((app) => {
            const opp = app.opportunity || opportunitiesMap[app.opportunityId]
            return (
              <div
                key={app.id}
                className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center justify-between md:justify-start gap-3">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      {opp?.title || 'Internship Opportunity'}
                    </h3>
                    {getStatusBadge(app.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1.5 font-medium text-gray-800">
                      <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{opp?.company || 'Company'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{opp?.location || 'On-site'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>Applied on {app.appliedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-gray-500 font-medium">Stage:</span>
                    <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-md">
                      {app.step}
                    </span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 shrink-0">
                  <Link
                    to={`/my-applications/application-details?id=${app.id}&oppId=${app.opportunityId}`}
                    className="bg-[#ff5500] hover:bg-[#e64d00] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </Link>
                </div>
              </div>
            )
          })}

        {!isLoading && applicationsWithDetails.length === 0 && (
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
