import { Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'
import type { VaultStats } from '../../types/documentation'

interface MetricHeaderProps {
  stats: VaultStats
}

export default function MetricHeader({ stats }: MetricHeaderProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Pending Sign-offs */}
      <div className="flex items-start justify-between rounded-xl border border-gray-200/80 bg-white p-4 shadow-xs">
        <div>
          <p className="text-xs font-medium text-gray-500">Pending Sign-offs</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {stats.pendingSignOffsCount}
          </p>
          <p className="mt-1 text-xs text-gray-500">{stats.dueThisWeekCount} due this week</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF2EC] text-[#1B4332]">
          <Clock className="h-4 w-4" />
        </div>
      </div>

      {/* 2. Completed Agreements */}
      <div className="flex items-start justify-between rounded-xl border border-gray-200/80 bg-white p-4 shadow-xs">
        <div>
          <p className="text-xs font-medium text-gray-500">Completed Agreements</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {stats.completedAgreementsPercentage}%
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-600">
            {stats.completedAgreementsTrend}
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF2EC] text-[#1B4332]">
          <CheckCircle2 className="h-4 w-4" />
        </div>
      </div>

      {/* 3. Expiring Documents */}
      <div className="flex items-start justify-between rounded-xl border border-gray-200/80 bg-white p-4 shadow-xs">
        <div>
          <p className="text-xs font-medium text-gray-500">Expiring Documents</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {stats.expiringDocumentsCount}
          </p>
          <p className="mt-1 text-xs font-medium text-amber-700">
            {stats.expiringDocumentsAlert}
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF2EC] text-[#1B4332]">
          <AlertTriangle className="h-4 w-4" />
        </div>
      </div>

      {/* 4. Verification Score */}
      <div className="flex items-start justify-between rounded-xl border border-gray-200/80 bg-white p-4 shadow-xs">
        <div>
          <p className="text-xs font-medium text-gray-500">Verification Score</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {stats.verificationScore}
            <span className="text-base font-normal text-gray-400">/100</span>
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-600">
            {stats.verificationScoreSubtitle}
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF2EC] text-[#1B4332]">
          <ShieldCheck className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}
