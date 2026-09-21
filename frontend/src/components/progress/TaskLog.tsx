import { useState } from 'react'
import type { FormEvent } from 'react'
import type { TaskLogEntry } from '../../types/progress'

interface Props {
  entries: TaskLogEntry[]
  canLog: boolean
  isSubmitting: boolean
  onLog?: (description: string, hours: number, date: string) => void
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const MS_PER_DAY = 86_400_000

export default function TaskLog({ entries, canLog, isSubmitting, onLog }: Props) {
  const [description, setDescription] = useState('')
  const [hours, setHours] = useState('1')
  const [date, setDate] = useState(todayIso)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!onLog) return
    onLog(description, Number(hours), date)
    setDescription('')
    setHours('1')
    setDate(todayIso())
  }

  const today = todayIso()
  const daysSinceLast =
    entries.length > 0 ? Math.floor((Date.parse(today) - Date.parse(entries[0].date)) / MS_PER_DAY) : null

  return (
    <div className="flex flex-col gap-4">
      {canLog && onLog && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <label className="text-xs font-medium text-gray-600">Task description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#1e3a2c]"
          />
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Date</label>
              <input
                type="date"
                required
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#1e3a2c]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Hours</label>
              <input
                type="number"
                required
                min="0.5"
                max="24"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#1e3a2c]"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[#1e3a2c] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isSubmitting ? 'Saving…' : 'Save entry'}
            </button>
          </div>
        </form>
      )}

      {daysSinceLast !== null && daysSinceLast > 3 && (
        <p className="text-xs text-amber-700">No activity logged in the last {daysSinceLast} days.</p>
      )}

      <div className="flex flex-col divide-y divide-gray-100">
        {entries.length === 0 && <p className="text-sm text-gray-400">No activity logged yet.</p>}
        {entries.map((entry, index) => {
          const older = entries[index + 1]
          const gapDays = older ? Math.floor((Date.parse(entry.date) - Date.parse(older.date)) / MS_PER_DAY) : null

          return (
            <div key={entry.id}>
              {gapDays !== null && gapDays > 3 && (
                <p className="py-1 text-[11px] text-amber-600">{gapDays}-day gap before this entry</p>
              )}
              <div className="flex items-start justify-between gap-3 py-2">
                <div>
                  <p className="text-sm text-gray-800">{entry.description}</p>
                  <p className="text-xs text-gray-400">{formatDate(entry.date)}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-gray-500">{entry.hours}h</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
