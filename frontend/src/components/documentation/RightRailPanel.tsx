import { CheckCircle2, Circle } from 'lucide-react'
import type {
  VaultStats,
  MandatoryChecklistItem,
  ActivityLogItem,
} from '../../types/documentation'

interface RightRailPanelProps {
  stats: VaultStats
  checklists: MandatoryChecklistItem[]
  activityLogs: ActivityLogItem[]
  onToggleChecklist: (id: string) => void
}

export default function RightRailPanel({
  stats,
  checklists,
  activityLogs,
  onToggleChecklist,
}: RightRailPanelProps) {
  const usedMB = (stats.storageUsedBytes / 1048576).toFixed(1)
  const totalMB = Math.round(stats.storageTotalBytes / 1048576)
  const percentage = Math.min(
    100,
    Math.round((stats.storageUsedBytes / stats.storageTotalBytes) * 100)
  )

  return (
    <aside className="w-full xl:w-72 shrink-0 space-y-5">
      {/* 1. Vault Storage Card */}
      <div className="rounded-2xl border border-white/40 bg-white/60 p-5 shadow-sm backdrop-blur-md">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Vault Storage</h3>
        {/* Storage Bar */}
        <div className="h-2 w-full rounded-full bg-emerald-100 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300 shadow-sm"
            style={{ width: `${percentage || 8}%` }}
          />
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs text-gray-500">
          <span>
            {usedMB} MB of {totalMB} MB used
          </span>
          <span className="font-medium text-gray-600">{percentage || 8}% Used</span>
        </div>
      </div>

      {/* 2. Mandatory Checklists Card */}
      <div className="rounded-2xl border border-white/40 bg-white/60 p-5 shadow-sm backdrop-blur-md">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Mandatory Checklists</h3>
        <div className="space-y-3.5">
          {checklists.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleChecklist(item.id)}
              className="group flex cursor-pointer items-center gap-3 text-sm text-gray-700 hover:text-gray-900 transition-colors select-none"
            >
              {item.completed ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 drop-shadow-sm" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-emerald-200 group-hover:text-emerald-400 transition-colors" />
              )}
              <span
                className={`text-sm ${
                  item.completed ? 'font-medium text-gray-900' : 'text-gray-600'
                }`}
              >
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Recent Actions & Logs Card */}
      <div className="rounded-2xl border border-white/40 bg-white/60 p-5 shadow-sm backdrop-blur-md">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Recent Actions & Logs</h3>
        <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
          {activityLogs.map((log) => (
            <div key={log.id} className="text-sm">
              <p className="font-medium text-gray-800">{log.title}</p>
              <p className="mt-0.5 truncate text-xs text-gray-400">
                {log.fileName} · {log.timeAgo}
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
