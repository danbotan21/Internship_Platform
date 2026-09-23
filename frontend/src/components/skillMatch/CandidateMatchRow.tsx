import { ChevronRight, UserCheck, GraduationCap } from 'lucide-react'
import type { Candidate, RequirementWeight } from '../../types/skillMatch'
import { calculateMatchScore, getCandidateSkillScore } from '../../data/skillMatchData'

interface CandidateMatchRowProps {
  candidate: Candidate
  requirements: RequirementWeight[]
  onClick: () => void
}

export default function CandidateMatchRow({
  candidate,
  requirements,
  onClick,
}: CandidateMatchRowProps) {
  const matchScore = calculateMatchScore(candidate, requirements)

  // Determine color scheme based on match percentage
  const getMatchTheme = (score: number) => {
    if (score >= 85) {
      return {
        barColor: 'bg-[#1b5e3a]',
        badgeBg: 'bg-emerald-50 text-[#1b5e3a] border-emerald-200',
      }
    }
    if (score >= 70) {
      return {
        barColor: 'bg-amber-500',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      }
    }
    return {
      barColor: 'bg-rose-500',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    }
  }

  const { barColor, badgeBg } = getMatchTheme(matchScore)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            ACCEPTED
          </span>
        )
      case 'IN REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            IN REVIEW
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            PENDING
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
            REJECTED
          </span>
        )
      default:
        return null
    }
  }

  // Quiz pills for requirements
  const quizScores = requirements
    .filter((r) => r.isQuiz)
    .slice(0, 8)
    .map((r) => ({
      name: r.name,
      score: getCandidateSkillScore(candidate, r),
      gate: r.gate,
    }))

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl border border-gray-200/90 bg-white p-4 shadow-2xs hover:border-[#1b5e3a]/40 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Avatar & Candidate Identity */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Avatar with dark emerald tone & initials */}
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a2c] to-[#12241b] text-sm font-bold text-white shrink-0 shadow-xs border border-[#1e3a2c]/20">
            {candidate.initials}
            {candidate.isLiveApplicant && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
                <UserCheck className="h-2.5 w-2.5" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-[#1b5e3a] transition-colors truncate">
                {candidate.name}
              </span>

              {candidate.isLiveApplicant && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100/90 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-emerald-900 uppercase border border-emerald-300">
                  <UserCheck className="h-3 w-3" />
                  Direct Applicant
                </span>
              )}

              {candidate.pendingTest && (
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-900 uppercase border border-amber-300">
                  Pending Test
                </span>
              )}
            </div>

            <p className="text-xs text-gray-500 truncate mt-0.5 flex items-center gap-1.5">
              <span>{candidate.role}</span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3 text-gray-400" />
                {candidate.university}
              </span>
            </p>

            {/* Quiz performance badges */}
            {quizScores.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {quizScores.map((q, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
                      q.score >= q.gate
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    <span className="text-gray-600 truncate max-w-[100px]">{q.name}:</span>
                    <strong className={q.score >= q.gate ? 'text-emerald-700' : 'text-rose-600'}>
                      {q.score}%
                    </strong>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Match Score Bar & Status */}
        <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
          {/* Match Score & Progress Bar */}
          <div className="flex flex-col items-start sm:items-end gap-1.5 w-32 sm:w-40">
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full">
              <span className="text-[11px] font-semibold text-gray-400 sm:hidden">Skill Match:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${badgeBg}`}>
                {matchScore}% Match
              </span>
            </div>
            {/* Progress Bar Container */}
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden border border-gray-100">
              <div
                className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                style={{ width: `${Math.min(100, Math.max(0, matchScore))}%` }}
              />
            </div>
          </div>

          {/* Status Badge */}
          <div className="w-28 flex justify-end shrink-0">
            {getStatusBadge(candidate.status)}
          </div>

          {/* Chevron */}
          <div className="text-gray-300 group-hover:text-[#1b5e3a] group-hover:translate-x-0.5 transition-all shrink-0">
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  )
}
