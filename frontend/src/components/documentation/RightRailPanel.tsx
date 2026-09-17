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
    <aside className="w-64 shrink-0 space-y-4">
      {/* 1. Vault Storage Card */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
        <h3 className="mb-3 text-xs font-semibold text-gray-900">Vault Storage</h3>
        {/* Storage Bar */}
        <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#FF7A00] transition-all duration-300"
            style={{ width: `${percentage || 8}%` }}
          />
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-500">
          <span>
            {usedMB} MB of {totalMB} MB used
          </span>
          <span className="font-medium text-gray-600">{percentage || 8}% Used</span>
        </div>
      </div>

      {/* 2. Mandatory Checklists Card */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
        <h3 className="mb-3 text-xs font-semibold text-gray-900">Mandatory Checklists</h3>
        <div className="space-y-3">
          {checklists.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleChecklist(item.id)}
              className="group flex cursor-pointer items-center gap-2.5 text-xs text-gray-700 hover:text-gray-900 transition-colors select-none"
            >
              {item.completed ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1E7E34]" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-gray-400" />
              )}
              <span
                className={`text-[12px] ${
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
      <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
        <h3 className="mb-3 text-xs font-semibold text-gray-900">Recent Actions & Logs</h3>
        <div className="space-y-3.5">
          {activityLogs.map((log) => (
            <div key={log.id} className="text-xs">
              <p className="font-medium text-gray-800">{log.title}</p>
              <p className="mt-0.5 truncate text-[11px] text-gray-400">
                {log.fileName} · {log.timeAgo}
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
