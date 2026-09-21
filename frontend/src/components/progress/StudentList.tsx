import type { StudentSummary } from '../../types/progress'

interface Props {
  students: StudentSummary[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function StudentList({ students, selectedId, onSelect }: Props) {
  if (students.length === 0) {
    return <p className="text-sm text-gray-400">No students yet.</p>
  }

  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {students.map((student) => (
        <button
          key={student.studentId}
          type="button"
          onClick={() => onSelect(student.studentId)}
          className={`flex items-center justify-between gap-3 px-1 py-3 text-left transition-colors ${
            selectedId === student.studentId ? 'bg-gray-50' : 'hover:bg-gray-50'
          }`}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{student.studentName}</p>
            <p className="text-xs text-gray-400">
              {student.lastActivityDate
                ? `Last activity ${new Date(student.lastActivityDate).toLocaleDateString()}`
                : 'No activity yet'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {student.hasMilestoneNeedingReview && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                Needs review
              </span>
            )}
            {student.belowThreshold && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">Behind</span>
            )}
            <span className="w-10 text-right text-sm font-semibold text-gray-700">{student.completionPercent}%</span>
          </div>
        </button>
      ))}
    </div>
  )
}
