import { createPortal } from 'react-dom'
import { X, Check, Timer } from 'lucide-react'
import type { Candidate, RequirementWeight, CandidateStatus } from '../../types/skillMatch'
import { calculateMatchScore, getCandidateSkillScore } from '../../data/skillMatchData'
import RadarSkillChart from './RadarSkillChart'

interface CandidateDetailModalProps {
  candidate: Candidate | null
  requirements: RequirementWeight[]
  onClose: () => void
  onStatusChange: (candidateId: string, newStatus: CandidateStatus) => void
}

export default function CandidateDetailModal({
  candidate,
  requirements,
  onClose,
  onStatusChange,
}: CandidateDetailModalProps) {
  if (!candidate) return null

  // Calculate live weighted match score
  const displayScore = calculateMatchScore(candidate, requirements)

  // Format date: e.g. "Applied Sep 3, 2026"
  const formattedAppliedDate = (() => {
    try {
      const d = new Date(candidate.appliedDate)
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return candidate.appliedDate
    }
  })()

  // Find skill gaps where candidate score < gate
  const skillGaps = requirements
    .map((req) => {
      const score = getCandidateSkillScore(candidate, req)
      return {
        ...req,
        score,
        diff: score - req.gate,
      }
    })
    .filter((item) => item.score < item.gate)

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 cursor-default max-h-[92vh] overflow-y-auto space-y-5"
      >
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          {/* Avatar & Candidate Identity */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1e3a2c] text-sm font-bold text-white shrink-0 shadow-2xs">
              {candidate.initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900 font-serif">
                  {candidate.name}
                </h2>
                {candidate.isLiveApplicant && (
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-emerald-900 uppercase border border-emerald-300">
                    Direct Applicant
                  </span>
                )}
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
                    candidate.status === 'ACCEPTED'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : candidate.status === 'IN REVIEW'
                      ? 'border-gray-300 bg-gray-50 text-gray-700'
                      : candidate.status === 'PENDING'
                      ? 'border-amber-300 bg-amber-50 text-amber-700'
                      : 'border-rose-300 bg-rose-50 text-rose-700'
                  }`}
                >
                  {candidate.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {candidate.role} · {candidate.university}
              </p>
            </div>
          </div>

          {/* Right: Match Score Box & Close Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-center font-bold text-base text-emerald-700 shadow-2xs">
              {displayScore}%
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Skill Breakdown Header & Legend */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <h3 className="text-xs font-bold text-gray-900">Skill Breakdown</h3>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#1e3a2c]" />
              <span>Student</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#f97316]" />
              <span>Required</span>
            </div>
          </div>
        </div>

        {/* Spider / Radar Chart */}
        <div className="bg-gray-50/40 rounded-xl p-2 border border-gray-100">
          <RadarSkillChart
            requirements={requirements}
            candidate={candidate}
          />
        </div>

        {/* Skill Horizontal Bars with Gate Ticks */}
        <div className="space-y-3 pt-1">
          {requirements.map((req) => {
            const score = getCandidateSkillScore(candidate, req)
            const passes = score >= req.gate

            return (
              <div key={req.id} className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 w-32 shrink-0">
                  <span className="text-xs font-medium text-gray-700 truncate" title={req.name}>
                    {req.name}
                  </span>
                  {req.isQuiz && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded shrink-0">
                      <Timer className="h-2.5 w-2.5" />
                      QUIZ
                    </span>
                  )}
                </div>

                {/* Progress Bar Container */}
                <div className="relative flex-1 h-2 rounded-full bg-gray-100 overflow-visible">
                  {/* Gate Tick Line */}
                  <div
                    className="absolute top-[-3px] h-3.5 w-0.5 bg-[#f97316] z-10 rounded-full"
                    style={{ left: `${req.gate}%` }}
                    title={`Gate: ${req.gate}%`}
                  />

                  {/* Candidate Score Progress Fill */}
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      passes ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                  />
                </div>

                {/* Score Number on right */}
                <span
                  className={`text-xs font-bold w-10 text-right ${
                    passes ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {score}%
                </span>
              </div>
            )
          })}

          {/* Subtext Legend */}
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pt-1">
            <span className="text-[#f97316] font-black">|</span>
            <span>Orange line = minimum threshold gate</span>
          </div>
        </div>

        {/* Skill Gaps Below Gate */}
        <div className="border-t border-gray-100 pt-3 space-y-2">
          <h4 className="text-xs font-bold text-gray-900">Skill Gaps Below Gate</h4>
          {skillGaps.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skillGaps.map((gap) => (
                <div
                  key={gap.id}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50/90 px-3 py-1 text-xs font-medium text-rose-800"
                >
                  <span className="font-bold">{gap.name}</span>
                  <span>{gap.score} vs {gap.gate} req.</span>
                  <span className="font-bold text-rose-600">{gap.diff}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
              All skills meet or exceed required threshold gates.
            </p>
          )}
        </div>

        {/* Change Status Control */}
        <div className="border-t border-gray-100 pt-3 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-500">Status:</span>
          <div className="flex items-center gap-1.5">
            {(['ACCEPTED', 'IN REVIEW', 'PENDING', 'REJECTED'] as CandidateStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onStatusChange(candidate.id, st)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                  candidate.status === st
                    ? 'bg-[#1e3a2c] text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-mono text-emerald-700 font-semibold">
            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Assessment complete</span>
          </div>

          <div className="text-gray-400">
            Applied {formattedAppliedDate}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
