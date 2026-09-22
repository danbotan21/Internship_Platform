import { Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'
import type { VaultStats } from '../../types/documentation'

interface MetricHeaderProps {
  stats: VaultStats
}

export default function MetricHeader({ stats }: MetricHeaderProps) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Pending Sign-offs */}
      <div className="group flex items-start justify-between rounded-2xl border border-white/40 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#EAF2EC] rounded-full blur-[40px] -mr-10 -mt-10 opacity-60 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-wide text-[#5d6b64] uppercase">Pending Sign-offs</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-[#14211b]">
            {stats.pendingSignOffsCount}
          </p>
          <p className="mt-2 flex items-center text-sm font-medium text-[#5d6b64]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
            {stats.dueThisWeekCount} due this week
          </p>
        </div>
        <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e3a2c] to-[#2c533e] text-white shadow-inner group-hover:scale-110 transition-transform duration-300">
          <Clock className="h-5 w-5" />
        </div>
      </div>

      {/* 2. Completed Agreements */}
      <div className="group flex items-start justify-between rounded-2xl border border-white/40 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-[40px] -mr-10 -mt-10 opacity-60 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-wide text-[#5d6b64] uppercase">Completed Agreements</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-[#14211b]">
            {stats.completedAgreementsPercentage}%
          </p>
          <p className="mt-2 flex items-center text-sm font-medium text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
            {stats.completedAgreementsTrend}
          </p>
        </div>
        <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-inner group-hover:scale-110 transition-transform duration-300">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      </div>

      {/* 3. Expiring Documents */}
      <div className="group flex items-start justify-between rounded-2xl border border-white/40 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full blur-[40px] -mr-10 -mt-10 opacity-60 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-wide text-[#5d6b64] uppercase">Expiring Documents</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-[#14211b]">
            {stats.expiringDocumentsCount}
          </p>
          <p className="mt-2 flex items-center text-sm font-medium text-amber-600">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>
            {stats.expiringDocumentsAlert}
          </p>
        </div>
        <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-inner group-hover:scale-110 transition-transform duration-300">
          <AlertTriangle className="h-5 w-5" />
        </div>
      </div>

      {/* 4. Verification Score */}
      <div className="group flex items-start justify-between rounded-2xl border border-white/40 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-[40px] -mr-10 -mt-10 opacity-60 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-wide text-[#5d6b64] uppercase">Verification Score</p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-[#14211b] flex items-baseline">
            {stats.verificationScore}
            <span className="ml-1 text-lg font-semibold text-[#5d6b64]">/100</span>
          </p>
          <p className="mt-2 flex items-center text-sm font-medium text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
            {stats.verificationScoreSubtitle}
          </p>
        </div>
        <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-inner group-hover:scale-110 transition-transform duration-300">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
