import { Check } from 'lucide-react'
import type { Milestone } from '../../types/progress'

interface Props {
  milestones: Milestone[]
  pendingId: string | null
  onToggle: (milestoneId: string, completed: boolean) => void
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function MilestoneTimeline({ milestones, pendingId, onToggle }: Props) {
  return (
    <div className="flex flex-col">
      {milestones.map((milestone, index) => {
        const isLast = index === milestones.length - 1
        const isBusy = pendingId === milestone.id
        const isDone = milestone.status === 'Completed'

        return (
          <div key={milestone.id} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gray-200" />}
            <div
              className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                isDone ? 'bg-[#1e3a2c] text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              {isDone && <Check className="h-3.5 w-3.5" />}
            </div>

            <div className="flex-1 pt-0.5">
              <p className={`text-sm font-medium ${isDone ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                {milestone.title}
              </p>
              <p className="text-xs text-gray-500">{milestone.description}</p>
              <p className="mt-0.5 text-xs text-gray-400">
                {isDone && milestone.completedAt ? `Completed - ${formatDate(milestone.completedAt)}` : `Due ${formatDate(milestone.dueDate)}`}
              </p>

              <label className="mt-2 flex w-fit items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={isDone}
                  disabled={isBusy}
                  onChange={(e) => onToggle(milestone.id, e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-[#1e3a2c] focus:ring-[#1e3a2c]"
                />
                Mark as done
              </label>
            </div>
          </div>
        )
      })}
    </div>
  )
}
