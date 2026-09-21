import { Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'
import type { VaultStats } from '../../types/documentation'

interface MetricHeaderProps {
  stats: VaultStats
}

export default function MetricHeader({ stats }: MetricHeaderProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Pending Sign-offs */}
      <div className="flex items-start justify-between rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs">
        <div>
          <p className="text-sm font-medium text-gray-500">Pending Sign-offs</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {stats.pendingSignOffsCount}
          </p>
          <p className="mt-1 text-sm text-gray-500">{stats.dueThisWeekCount} due this week</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF2EC] text-[#1B4332]">
          <Clock className="h-5 w-5" />
        </div>
      </div>

      {/* 2. Completed Agreements */}
      <div className="flex items-start justify-between rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs">
        <div>
          <p className="text-sm font-medium text-gray-500">Completed Agreements</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {stats.completedAgreementsPercentage}%
          </p>
          <p className="mt-1 text-sm font-medium text-emerald-600">
            {stats.completedAgreementsTrend}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF2EC] text-[#1B4332]">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      </div>

      {/* 3. Expiring Documents */}
      <div className="flex items-start justify-between rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs">
        <div>
          <p className="text-sm font-medium text-gray-500">Expiring Documents</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {stats.expiringDocumentsCount}
          </p>
          <p className="mt-1 text-sm font-medium text-amber-700">
            {stats.expiringDocumentsAlert}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF2EC] text-[#1B4332]">
          <AlertTriangle className="h-5 w-5" />
        </div>
      </div>

      {/* 4. Verification Score */}
      <div className="flex items-start justify-between rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs">
        <div>
          <p className="text-sm font-medium text-gray-500">Verification Score</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {stats.verificationScore}
            <span className="text-lg font-normal text-gray-400">/100</span>
          </p>
          <p className="mt-1 text-sm font-medium text-emerald-600">
            {stats.verificationScoreSubtitle}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF2EC] text-[#1B4332]">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
