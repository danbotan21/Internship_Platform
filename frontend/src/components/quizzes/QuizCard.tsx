import { Shield, ChevronRight } from 'lucide-react'
import type { QuizCatalogItem, QuizDifficulty } from '../../types/quiz'

interface QuizCardProps {
  quiz: QuizCatalogItem
  onSelect?: (quiz: QuizCatalogItem) => void
}

const difficultyStyles: Record<QuizDifficulty, string> = {
  EASY: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200/60',
  HARD: 'bg-rose-50 text-rose-700 border-rose-200/60',
}

export default function QuizCard({ quiz, onSelect }: QuizCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(quiz)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.(quiz)
        }
      }}
      className="group relative flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
    >
      <div>
        {/* Top bar: Icon and Difficulty Badge */}
        <div className="flex items-center justify-between mb-5">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl border ${quiz.theme.iconBg} ${quiz.theme.iconBorder} ${quiz.theme.iconColor} transition-transform group-hover:scale-105`}
          >
            <Shield className="h-5 w-5" strokeWidth={1.9} />
          </div>
          <span
            className={`rounded-md border px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase ${difficultyStyles[quiz.difficulty]}`}
          >
            {quiz.difficulty}
          </span>
        </div>

        {/* Title and Topics */}
        <h3 className="font-serif text-lg font-bold text-gray-900 group-hover:text-black transition-colors">
          {quiz.title}
        </h3>
        <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
          {quiz.description}
        </p>
      </div>

      {/* Bottom details & navigation arrow */}
      <div className="mt-7 flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <span>{quiz.questionCount} questions</span>
          <span className="text-gray-300 font-bold">·</span>
          <span>{quiz.durationMinutes} min</span>
          <span className="text-gray-300 font-bold">·</span>
          <span>Pass {quiz.passingScore}%</span>
        </div>

        <ChevronRight className="h-4.5 w-4.5 text-gray-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-gray-700" />
      </div>
    </div>
  )
}
