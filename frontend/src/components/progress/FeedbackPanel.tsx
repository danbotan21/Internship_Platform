import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Feedback, SubmitFeedbackPayload } from '../../types/progress'

function RatingDots({ value }: { value: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`h-2.5 w-2.5 rounded-full ${n <= value ? 'bg-orange-500' : 'bg-gray-200'}`} />
      ))}
    </div>
  )
}

function RatingInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${label} ${n}`}
            className={`h-4 w-4 rounded-full transition-colors ${
              n <= value ? 'bg-orange-500' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export function FeedbackForm({
  isSubmitting,
  onSubmit,
}: {
  isSubmitting: boolean
  onSubmit: (payload: SubmitFeedbackPayload) => void
}) {
  const [punctuality, setPunctuality] = useState(4)
  const [initiative, setInitiative] = useState(4)
  const [skillGrowth, setSkillGrowth] = useState(4)
  const [comments, setComments] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit({ punctuality, initiative, skillGrowth, comments })
    setComments('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
      <RatingInput label="Punctuality" value={punctuality} onChange={setPunctuality} />
      <RatingInput label="Initiative" value={initiative} onChange={setInitiative} />
      <RatingInput label="Skill growth" value={skillGrowth} onChange={setSkillGrowth} />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Comments</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={2}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#1e3a2c]"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="self-end rounded-lg bg-[#1e3a2c] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  )
}

export function FeedbackHistory({ feedback }: { feedback: Feedback[] }) {
  if (feedback.length === 0) {
    return <p className="text-sm text-gray-400">No feedback yet.</p>
  }

  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {feedback.map((entry) => (
        <div key={entry.id} className="flex flex-col gap-1.5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-800">{entry.supervisorName}</span>
            <span className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              Punctuality <RatingDots value={entry.punctuality} />
            </span>
            <span className="flex items-center gap-1.5">
              Initiative <RatingDots value={entry.initiative} />
            </span>
            <span className="flex items-center gap-1.5">
              Skill growth <RatingDots value={entry.skillGrowth} />
            </span>
          </div>
          {entry.comments && <p className="text-sm text-gray-600">{entry.comments}</p>}
        </div>
      ))}
    </div>
  )
}
