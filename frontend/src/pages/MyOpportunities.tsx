import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Leaf,
  Code2,
  BarChart3,
} from 'lucide-react'
import { CustomSelect } from '../components/CustomSelect'

interface MentorOpportunity {
  id: string
  title: string
  location: string
  locationType: 'On-site' | 'Hybrid' | 'Remote'
  type: 'Full-time' | 'Part-time'
  applicationsCount: number
  status: 'Open' | 'Closed' | 'Draft'
  createdOn: string
  deadline: string
  logoBg: string
  logoType: 'leaf' | 'code' | 'chart' | 'check'
}

const MOCK_MENTOR_OPPORTUNITIES: MentorOpportunity[] = [
  {
    id: '1',
    title: 'Software Development Intern',
    location: 'Chișinău, MD',
    locationType: 'On-site',
    type: 'Full-time',
    applicationsCount: 12,
    status: 'Open',
    createdOn: 'Sep 10, 2025',
    deadline: 'Dec 31, 2025',
    logoBg: 'bg-[#1b5e3a]',
    logoType: 'leaf',
  },
  {
    id: '3',
    title: 'Data Analytics Intern',
    location: 'Chișinău, MD',
    locationType: 'Hybrid',
    type: 'Full-time',
    applicationsCount: 8,
    status: 'Open',
    createdOn: 'Aug 28, 2025',
    deadline: 'Nov 30, 2025',
    logoBg: 'bg-[#0f172a]',
    logoType: 'chart',
  },
  {
    id: '4',
    title: 'QA Automation Intern',
    location: 'Remote',
    locationType: 'Remote',
    type: 'Part-time',
    applicationsCount: 5,
    status: 'Closed',
    createdOn: 'Aug 1, 2025',
    deadline: 'Sep 15, 2025',
    logoBg: 'bg-[#ea580c]',
    logoType: 'check',
  },
  {
    id: '2',
    title: 'Frontend Intern',
    location: 'Chișinău, MD',
    locationType: 'Remote',
    type: 'Full-time',
    applicationsCount: 20,
    status: 'Open',
    createdOn: 'Jul 15, 2025',
    deadline: 'Oct 31, 2025',
    logoBg: 'bg-[#2563eb]',
    logoType: 'code',
  },
  {
    id: '5',
    title: 'Technical Writing Intern',
    location: 'Remote',
    locationType: 'Remote',
    type: 'Part-time',
    applicationsCount: 3,
    status: 'Draft',
    createdOn: 'Jul 5, 2025',
    deadline: '—',
    logoBg: 'bg-gray-600',
    logoType: 'code',
  },
  {
    id: '6',
    title: 'Sustainability Research Intern',
    location: 'Chișinău, MD',
    locationType: 'On-site',
    type: 'Full-time',
    applicationsCount: 15,
    status: 'Closed',
    createdOn: 'Jun 20, 2025',
    deadline: 'Aug 31, 2025',
    logoBg: 'bg-[#1b5e3a]',
    logoType: 'leaf',
  },
  {
    id: '7',
    title: 'Business Analysis Intern',
    location: 'Remote',
    locationType: 'Remote',
    type: 'Full-time',
    applicationsCount: 9,
    status: 'Open',
    createdOn: 'Jun 10, 2025',
    deadline: 'Sep 30, 2025',
    logoBg: 'bg-[#0f172a]',
    logoType: 'chart',
  },
  {
    id: '8',
    title: 'Marketing Intern',
    location: 'Chișinău, MD',
    locationType: 'On-site',
    type: 'Part-time',
    applicationsCount: 6,
    status: 'Closed',
    createdOn: 'May 18, 2025',
    deadline: 'Jul 31, 2025',
    logoBg: 'bg-[#ea580c]',
    logoType: 'check',
  },
]

export default function MyOpportunities() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterWorkType, setFilterWorkType] = useState('All')
  const [filterLocation, setFilterLocation] = useState('All')

  const totalCount = MOCK_MENTOR_OPPORTUNITIES.length
  const openCount = MOCK_MENTOR_OPPORTUNITIES.filter(
    (o) => o.status === 'Open'
  ).length
  const closedCount = MOCK_MENTOR_OPPORTUNITIES.filter(
    (o) => o.status === 'Closed'
  ).length
  const draftCount = MOCK_MENTOR_OPPORTUNITIES.filter(
    (o) => o.status === 'Draft'
  ).length

  const filtered = MOCK_MENTOR_OPPORTUNITIES.filter((opp) => {
    const q = searchQuery.toLowerCase()
    const matchesQuery =
      opp.title.toLowerCase().includes(q) ||
      opp.location.toLowerCase().includes(q)

    if (!matchesQuery) return false

    if (filterStatus !== 'All' && opp.status !== filterStatus) return false
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
                        {opp.logoType === 'leaf' && <Leaf className="w-4 h-4" />}
                        {opp.logoType === 'code' && <Code2 className="w-4 h-4" />}
                        {opp.logoType === 'chart' && (
                          <BarChart3 className="w-4 h-4" />
                        )}
                        {opp.logoType === 'check' && (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
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
                  <td className="px-5 py-4">{getStatusBadge(opp.status)}</td>

                  {/* Created On */}
                  <td className="px-5 py-4 text-gray-500 font-medium">
                    {opp.createdOn}
                  </td>

                  {/* Deadline */}
                  <td className="px-5 py-4 text-gray-500 font-medium">
                    {opp.deadline}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="px-3.5 py-1.5 border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
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
    </div>
  )
}
