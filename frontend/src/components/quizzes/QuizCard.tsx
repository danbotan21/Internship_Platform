import {
  Binary,
  Layout,
  Globe,
  Database,
  GitBranch,
  Code2,
  Sparkles,
  Clock,
  Award,
  HelpCircle,
  ArrowRight,
  Trash2,
  Pencil,
} from 'lucide-react'
import type { QuizCatalogItem, QuizDifficulty } from '../../types/quiz'

interface QuizCardProps {
  quiz: QuizCatalogItem
  isCustom?: boolean
  onSelect?: (quiz: QuizCatalogItem) => void
  onEdit?: (e: React.MouseEvent) => void
  onDelete?: (e: React.MouseEvent) => void
}

const difficultyStyles: Record<QuizDifficulty, { badge: string; dot: string }> = {
  EASY: {
    badge: 'bg-[#e9f3ee] text-[#164c3a] border-[#cde0d5]',
    dot: 'bg-[#164c3a]',
  },
  MEDIUM: {
    badge: 'bg-[#fff8eb] text-[#b45309] border-[#fde68a]',
    dot: 'bg-[#b45309]',
  },
  HARD: {
    badge: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
    dot: 'bg-[#b91c1c]',
  },
}

function getQuizIcon(quiz: QuizCatalogItem) {
  const id = quiz.id.toLowerCase()
  const title = quiz.title.toLowerCase()
  if (id.includes('algo') || title.includes('algorithm') || title.includes('data structure')) {
    return Binary
  }
  if (id.includes('react') || title.includes('react') || title.includes('frontend')) {
    return Layout
  }
  if (id.includes('api') || title.includes('api') || title.includes('http') || title.includes('rest')) {
    return Globe
  }
  if (id.includes('sql') || title.includes('database') || id.includes('db')) {
    return Database
  }
  if (id.includes('git') || title.includes('git') || title.includes('version control')) {
    return GitBranch
  }
  if (
    id.includes('typescript') ||
    title.includes('typescript') ||
    title.includes('clean architecture') ||
    id.includes('code')
  ) {
    return Code2
  }
  return Sparkles
}

export default function QuizCard({ quiz, isCustom, onSelect, onEdit, onDelete }: QuizCardProps) {
  const IconComponent = getQuizIcon(quiz)
  const diff = difficultyStyles[quiz.difficulty] || difficultyStyles.MEDIUM
  const tags = quiz.description
    ? quiz.description
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []

  // Cohesive brand styling: Pine Green for all assessment icons
  const iconContainerClass = 'bg-[#1e3a2c] text-white shadow-xs'

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
      className="group relative flex flex-col justify-between rounded-2xl border border-[#e6ebe8] bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#1e3a2c]/40 hover:shadow-md cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#1e3a2c]/30"
    >
      <div className="space-y-4">
        {/* Top bar: Brand Icon, Custom badge, Difficulty Badge, and Actions */}
        <div className="flex items-center justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconContainerClass} transition-transform duration-300 group-hover:scale-105`}
          >
            <IconComponent className="h-6 w-6" strokeWidth={1.8} />
          </div>

          <div className="flex items-center gap-2">
            {isCustom && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-[#fff2ea] px-2.5 py-1 text-[11px] font-semibold text-[#ff5500] border border-[#ffd8c4] shadow-2xs">
                <Sparkles className="h-3 w-3 text-[#ff5500]" />
                Custom
              </span>
            )}

            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase shadow-2xs ${diff.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${diff.dot}`} />
              {quiz.difficulty}
            </span>

            {isCustom && onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(e)
                }}
                className="rounded-lg p-1.5 text-[#71817a] hover:bg-[#e9f3ee] hover:text-[#164c3a] transition-colors border border-[#e6ebe8] cursor-pointer shadow-2xs"
                title="Edit custom quiz"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}

            {isCustom && onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(e)
                }}
                className="rounded-lg p-1.5 text-[#71817a] hover:bg-[#fef2f2] hover:text-[#b91c1c] transition-colors border border-[#e6ebe8] cursor-pointer shadow-2xs"
                title="Delete custom quiz"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title and Topics */}
        <div>
          <h3 className="text-lg font-bold text-[#14211b] group-hover:text-[#1e3a2c] transition-colors leading-snug">
            {quiz.title}
          </h3>
          <p className="mt-1 text-sm text-[#5d6b64] line-clamp-2 leading-relaxed">
            {quiz.description}
          </p>
        </div>

        {/* Topic Pills */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-[#f5f7f6] text-[#5d6b64] rounded-md border border-[#e6ebe8]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom details & CTA button */}
      <div className="mt-6 flex items-center justify-between border-t border-[#f0f4f1] pt-4">
        <div className="flex items-center gap-3 text-xs font-medium text-[#5d6b64]">
          <span className="inline-flex items-center gap-1">
            <HelpCircle className="h-3.5 w-3.5 text-[#71817a]" />
            {quiz.questionCount} {quiz.questionCount === 1 ? 'question' : 'questions'}
          </span>
          <span className="text-[#d8e2dc]">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-[#71817a]" />
            {quiz.durationMinutes} min
          </span>
          <span className="text-[#d8e2dc]">·</span>
          <span className="inline-flex items-center gap-1 text-[#164c3a] font-semibold">
            <Award className="h-3.5 w-3.5 text-[#164c3a]" />
            Pass {quiz.passingScore}%
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#14211b] bg-[#f5f7f6] border border-[#e6ebe8] group-hover:bg-[#ff5500] group-hover:text-white group-hover:border-transparent transition-all duration-200 shadow-2xs">
          <span>Start</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  )
}
