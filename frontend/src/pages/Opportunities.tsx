import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  MapPin,
  Briefcase,
  Calendar,
  Leaf,
  Code2,
  X,
  Bookmark,
  RotateCcw,
  BarChart3,
  CheckCircle2,
} from 'lucide-react'
import { CustomSelect } from '../components/CustomSelect'
import { MOCK_OPPORTUNITIES } from '../types/opportunities'
import type { Opportunity } from '../types/opportunities'

export default function Opportunities() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('Most Recent')
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Filter States
  const [filterLocationType, setFilterLocationType] = useState('All')
  const [filterCommitment, setFilterCommitment] = useState('All')
  const [filterDuration, setFilterDuration] = useState('All')
  const [filterField, setFilterField] = useState('All')
  const [filterLanguage, setFilterLanguage] = useState('All')

  const activeFiltersCount =
    (filterLocationType !== 'All' ? 1 : 0) +
    (filterCommitment !== 'All' ? 1 : 0) +
    (filterDuration !== 'All' ? 1 : 0) +
    (filterField !== 'All' ? 1 : 0) +
    (filterLanguage !== 'All' ? 1 : 0)

  const resetFilters = () => {
    setFilterLocationType('All')
    setFilterCommitment('All')
    setFilterDuration('All')
    setFilterField('All')
    setFilterLanguage('All')
  }

  const filteredOpportunities = MOCK_OPPORTUNITIES.filter((opp) => {
    // Search query matching
    const query = searchQuery.toLowerCase()
    const matchesQuery =
      opp.title.toLowerCase().includes(query) ||
      opp.company.toLowerCase().includes(query) ||
      opp.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      opp.technologies.some((tech) => tech.toLowerCase().includes(query))

    if (!matchesQuery) return false

    // Location Type filter
    if (
      filterLocationType !== 'All' &&
      opp.locationType !== filterLocationType
    ) {
      return false
    }

    // Work Commitment filter (Full-time / Part-time)
    if (filterCommitment !== 'All' && opp.type !== filterCommitment) {
      return false
    }

    // Duration filter
    if (
      filterDuration !== 'All' &&
      opp.durationCategory !== filterDuration
    ) {
      return false
    }

    // Field filter
    if (filterField !== 'All' && opp.field !== filterField) {
      return false
    }

    // Language / Technology filter
    if (filterLanguage !== 'All') {
      const matchTech = opp.technologies.some((t) => {
        if (filterLanguage === 'C / C++') return t === 'C++' || t === 'C'
        if (filterLanguage === 'C# / .NET') return t === 'C#' || t === '.NET'
        if (filterLanguage === 'Java') return t === 'Java'
        if (filterLanguage === 'Python') return t === 'Python'
        if (filterLanguage === 'JavaScript / TypeScript')
          return t === 'TypeScript' || t === 'JavaScript' || t === 'React'
        if (filterLanguage === 'SQL / Database') return t === 'SQL' || t === 'PostgreSQL'
        return t.toLowerCase().includes(filterLanguage.toLowerCase())
      })
      if (!matchTech) return false
    }

    return true
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      {/* Header Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#0c382b]">
          Internship Opportunities
        </h1>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full bg-white rounded-xl border border-gray-200/80 shadow-xs flex items-center px-3.5 py-2.5">
            <Search className="w-5 h-5 text-gray-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search internships by title, company or keyword..."
              className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              className="bg-[#ff5500] hover:bg-[#e64d00] text-white font-medium text-sm px-6 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Search
            </button>

            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`border font-medium text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0 ${isFilterOpen || activeFiltersCount > 0
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                  : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-[#ff5500] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {isFilterOpen && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-800" />
                <h3 className="font-semibold text-gray-900 text-sm">
                  Filter Opportunities
                </h3>
              </div>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset filters</span>
                </button>
              )}
            </div>

            {/* Filter Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Filter 1: Type (Location Mode) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 block">
                  Location Type
                </label>
                <CustomSelect
                  value={filterLocationType}
                  onChange={setFilterLocationType}
                  options={[
                    { value: 'All', label: 'All Types' },
                    { value: 'On-site', label: 'On-site' },
                    { value: 'Hybrid', label: 'Hybrid' },
                    { value: 'Remote', label: 'Remote' },
                  ]}
                />
              </div>

              {/* Filter 2: Work Commitment */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 block">
                  Commitment
                </label>
                <CustomSelect
                  value={filterCommitment}
                  onChange={setFilterCommitment}
                  options={[
                    { value: 'All', label: 'All Commitments' },
                    { value: 'Full-time', label: 'Full-time' },
                    { value: 'Part-time', label: 'Part-time' },
                  ]}
                />
              </div>

              {/* Filter 3: Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 block">
                  Duration
                </label>
                <CustomSelect
                  value={filterDuration}
                  onChange={setFilterDuration}
                  options={[
                    { value: 'All', label: 'All Durations' },
                    { value: '1-3 months', label: '1–3 months' },
                    { value: '3-6 months', label: '3–6 months' },
                    { value: '6+ months', label: '6+ months' },
                  ]}
                />
              </div>

              {/* Filter 4: Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 block">
                  Field / Specialization
                </label>
                <CustomSelect
                  value={filterField}
                  onChange={setFilterField}
                  options={[
                    { value: 'All', label: 'All Fields' },
                    {
                      value: 'Software Engineering',
                      label: 'Software Engineering',
                    },
                    { value: 'Web Development', label: 'Web Development' },
                    { value: 'Data & Analytics', label: 'Data & Analytics' },
                    {
                      value: 'Quality Assurance',
                      label: 'Quality Assurance',
                    },
                  ]}
                />
              </div>

              {/* Filter 5: Languages & Technologies */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 block">
                  Languages / Tech
                </label>
                <CustomSelect
                  value={filterLanguage}
                  onChange={setFilterLanguage}
                  options={[
                    { value: 'All', label: 'All Technologies' },
                    { value: 'C / C++', label: 'C / C++' },
                    { value: 'C# / .NET', label: 'C# / .NET' },
                    { value: 'Java', label: 'Java' },
                    { value: 'Python', label: 'Python' },
                    {
                      value: 'JavaScript / TypeScript',
                      label: 'TypeScript / JS / React',
                    },
                    { value: 'SQL / Database', label: 'SQL / Database' },
                  ]}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats and Sort section */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">
            {filteredOpportunities.length}{' '}
            {filteredOpportunities.length === 1 ? 'opportunity' : 'opportunities'}
          </span>
          {activeFiltersCount > 0 && (
            <span className="text-xs text-emerald-700 bg-emerald-50 font-medium px-2 py-0.5 rounded-md">
              Filtered
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 shrink-0">Sort by</span>
          <div className="w-36">
            <CustomSelect
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'Most Recent', label: 'Most Recent' },
                { value: 'Title', label: 'Title' },
                { value: 'Company', label: 'Company' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Opportunity List */}
      <div className="space-y-3.5">
        {filteredOpportunities.map((opp) => (
          <div
            key={opp.id}
            className="bg-white border border-gray-200/70 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-5"
          >
            {/* Left: Logo & Info */}
            <div className="flex items-start sm:items-center gap-4">
              <div
                className={`w-13 h-13 rounded-xl ${opp.logoBg} flex items-center justify-center text-white shrink-0 shadow-xs`}
              >
                {opp.logoType === 'leaf' && <Leaf className="w-6 h-6" />}
                {opp.logoType === 'code' && <Code2 className="w-6 h-6" />}
                {opp.logoType === 'chart' && <BarChart3 className="w-6 h-6" />}
                {opp.logoType === 'check' && <CheckCircle2 className="w-6 h-6" />}
              </div>

              <div className="space-y-1.5">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 leading-snug">
                    {opp.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {opp.company}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-0.5">
                  {opp.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Meta details + View button */}
            <div className="flex flex-wrap lg:flex-nowrap items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
              {/* Meta details */}
              <div className="flex flex-wrap items-center gap-5 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{opp.location}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <span>{opp.type}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{opp.duration}</span>
                </div>
              </div>

              {/* View Action Button */}
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOpportunity(opp)
                    setIsSaved(false)
                  }}
                  className="bg-[#ff5500] hover:bg-[#e64d00] text-white font-medium text-sm px-6 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredOpportunities.length === 0 && (
          <div className="bg-white border border-gray-200/70 rounded-2xl p-10 text-center space-y-3">
            <p className="text-gray-600 font-medium">
              No opportunities found matching your active filter criteria.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-[#ff5500] font-semibold hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedOpportunity && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-6 overflow-hidden"
          onClick={() => setSelectedOpportunity(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto no-scrollbar p-5 sm:p-7 md:p-8 shadow-2xl relative space-y-4 sm:space-y-5 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setSelectedOpportunity(null)}
              className="absolute top-5 right-5 sm:top-6 sm:right-6 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pr-8">
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${selectedOpportunity.logoBg} flex items-center justify-center text-white shrink-0 shadow-sm`}
                >
                  {selectedOpportunity.logoType === 'leaf' ? (
                    <Leaf className="w-7 h-7 sm:w-8 sm:h-8" />
                  ) : (
                    <Code2 className="w-7 h-7 sm:w-8 sm:h-8" />
                  )}
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                    {selectedOpportunity.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                    {selectedOpportunity.company}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedOpportunity.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Header Action Buttons (Save stacked under Apply Now) */}
              <div className="flex flex-col gap-2 pt-1 sm:pt-0 shrink-0 min-w-[130px]">
                <button
                  type="button"
                  onClick={() => navigate(`/opportunities/apply?id=${selectedOpportunity.id}`)}
                  className="bg-[#ff5500] hover:bg-[#e64d00] text-white font-medium text-sm px-6 py-2 sm:py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs w-full text-center"
                >
                  Apply Now
                </button>
                <button
                  type="button"
                  onClick={() => setIsSaved(!isSaved)}
                  className={`border font-medium text-sm px-5 py-1.5 sm:py-2 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs w-full ${isSaved
                      ? 'border-[#ff5500] bg-orange-50 text-[#ff5500]'
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <Bookmark
                    className={`w-4 h-4 ${isSaved ? 'fill-[#ff5500]' : ''}`}
                  />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Key Metadata Row (Centered Location, Work type, Duration) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-1 text-center justify-items-center">
              <div className="flex items-center gap-2.5 justify-center text-left">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    {selectedOpportunity.location}
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-400 font-medium">Location</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 justify-center text-left">
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    {selectedOpportunity.type}
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-400 font-medium">Work type</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 justify-center text-left">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    {selectedOpportunity.duration}
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-400 font-medium">Duration</p>
                </div>
              </div>
            </div>

            {/* About the Company */}
            <div className="space-y-1.5 pt-1">
              <h3 className="text-sm sm:text-base font-bold text-[#0c382b]">
                About the Company
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {selectedOpportunity.aboutCompany}
              </p>
            </div>

            {/* About the Internship */}
            <div className="space-y-1.5">
              <h3 className="text-sm sm:text-base font-bold text-[#0c382b]">
                About the Internship
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {selectedOpportunity.aboutInternship}
              </p>
            </div>

            {/* Responsibilities & Requirements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-1">
              {/* Responsibilities */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-[#0c382b]">
                  Responsibilities
                </h3>
                <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600">
                  {selectedOpportunity.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gray-800 font-bold">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-[#0c382b]">
                  Requirements
                </h3>
                <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600">
                  {selectedOpportunity.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gray-800 font-bold">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Technologies */}
            <div className="space-y-2 pt-1">
              <h3 className="text-sm sm:text-base font-bold text-[#0c382b]">
                Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedOpportunity.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


