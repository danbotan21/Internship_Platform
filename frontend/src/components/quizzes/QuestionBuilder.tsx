import { useState } from 'react'
import {
  SquarePen,
  Eye,
  Trash2,
  Plus,
  Check,
  CheckCircle2,
  X,
  Lightbulb,
  ArrowLeft,
  Clock,
  Award,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react'
import type { QuizCatalogItem, QuizDifficulty, QuizQuestion, QuizOption } from '../../types/quiz'

interface BuilderOption {
  id: string
  label: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  text: string
  isCorrect: boolean
  feedback: string
}

interface BuilderQuestion {
  id: string
  numberLabel: string
  category: string
  question: string
  hint: string
  options: BuilderOption[]
}

interface QuestionBuilderProps {
  onCancel: () => void
  onSaveQuiz: (quiz: QuizCatalogItem) => void
  initialQuiz?: QuizCatalogItem | null
}

const OPTION_LABELS: Array<'A' | 'B' | 'C' | 'D' | 'E' | 'F'> = ['A', 'B', 'C', 'D', 'E', 'F']

const THEME_OPTIONS = [
  {
    name: 'Emerald',
    iconBg: 'bg-emerald-50',
    iconBorder: 'border-emerald-200/60',
    iconColor: 'text-emerald-700',
    badgeClass: 'bg-emerald-500',
  },
  {
    name: 'Blue',
    iconBg: 'bg-blue-50',
    iconBorder: 'border-blue-200/60',
    iconColor: 'text-blue-700',
    badgeClass: 'bg-blue-500',
  },
  {
    name: 'Indigo',
    iconBg: 'bg-indigo-50',
    iconBorder: 'border-indigo-200/60',
    iconColor: 'text-indigo-700',
    badgeClass: 'bg-indigo-500',
  },
  {
    name: 'Amber',
    iconBg: 'bg-amber-50',
    iconBorder: 'border-amber-200/60',
    iconColor: 'text-amber-700',
    badgeClass: 'bg-amber-500',
  },
  {
    name: 'Rose',
    iconBg: 'bg-rose-50',
    iconBorder: 'border-rose-200/60',
    iconColor: 'text-rose-700',
    badgeClass: 'bg-rose-500',
  },
]

const DURATION_PRESETS = [10, 15, 20, 30, 45, 60]
const PASSING_PRESETS = [60, 70, 75, 80, 85]

function createInitialQuestion(): BuilderQuestion {
  return {
    id: `q-${Date.now()}-0`,
    numberLabel: 'Q01',
    category: 'TYPESCRIPT',
    question: 'Which TypeScript utility type constructs a type with all properties of T set to optional?',
    hint: 'Think about the utility keyword that makes every property non-mandatory.',
    options: [
      { id: 'opt-a', label: 'A', text: 'Partial<T>', isCorrect: true, feedback: '' },
      { id: 'opt-b', label: 'B', text: 'Required<T>', isCorrect: false, feedback: 'Required<T> makes all properties mandatory, not optional.' },
      { id: 'opt-c', label: 'C', text: 'Readonly<T>', isCorrect: false, feedback: 'Readonly<T> prevents reassignment but does not make properties optional.' },
      { id: 'opt-d', label: 'D', text: 'Pick<T, K>', isCorrect: false, feedback: 'Pick<T, K> selects a subset of properties from T.' },
    ],
  }
}

function createBlankQuestion(index: number): BuilderQuestion {
  const num = (index + 1).toString().padStart(2, '0')
  return {
    id: `q-${Date.now()}-${index}`,
    numberLabel: `Q${num}`,
    category: 'GENERAL',
    question: '',
    hint: '',
    options: [
      { id: `opt-a-${Date.now()}`, label: 'A', text: '', isCorrect: true, feedback: '' },
      { id: `opt-b-${Date.now()}`, label: 'B', text: '', isCorrect: false, feedback: '' },
      { id: `opt-c-${Date.now()}`, label: 'C', text: '', isCorrect: false, feedback: '' },
      { id: `opt-d-${Date.now()}`, label: 'D', text: '', isCorrect: false, feedback: '' },
    ],
  }
}

function convertFromCatalogQuestions(catalogQuestions?: QuizQuestion[]): BuilderQuestion[] {
  if (!catalogQuestions || catalogQuestions.length === 0) {
    return [createInitialQuestion()]
  }
  return catalogQuestions.map((q, idx) => {
    const opts: BuilderOption[] = q.options.map((opt, oIdx) => ({
      id: `opt-${q.id}-${oIdx}`,
      label: opt.label as 'A' | 'B' | 'C' | 'D' | 'E' | 'F',
      text: opt.text,
      isCorrect: opt.id === q.correctOptionId || opt.label.toLowerCase() === q.correctOptionId.toLowerCase(),
      feedback: '',
    }))
    return {
      id: q.id,
      numberLabel: q.numberLabel || `Q${(idx + 1).toString().padStart(2, '0')}`,
      category: q.category || 'GENERAL',
      question: q.question,
      hint: q.hint || '',
      options: opts,
    }
  })
}

export default function QuestionBuilder({ onCancel, onSaveQuiz, initialQuiz }: QuestionBuilderProps) {
  const initialThemeIndex = initialQuiz
    ? THEME_OPTIONS.findIndex((th) => th.iconBg === initialQuiz.theme?.iconBg)
    : 0

  // Quiz General Metadata
  const [title, setTitle] = useState(initialQuiz?.title || 'TypeScript & Clean Architecture')
  const [description, setDescription] = useState(
    initialQuiz?.description || 'Generics, Utility Types, SOLID Principles, and Modular Design'
  )
  const [category, setCategory] = useState(initialQuiz?.questions?.[0]?.category || 'FRONTEND')
  const [difficulty, setDifficulty] = useState<QuizDifficulty>(initialQuiz?.difficulty || 'MEDIUM')
  const [durationMinutes, setDurationMinutes] = useState<number>(initialQuiz?.durationMinutes || 20)
  const [passingScore, setPassingScore] = useState<number>(initialQuiz?.passingScore || 70)
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(initialThemeIndex >= 0 ? initialThemeIndex : 0)

  // Multi-Questions State
  const [questions, setQuestions] = useState<BuilderQuestion[]>(() =>
    initialQuiz ? convertFromCatalogQuestions(initialQuiz.questions) : [createInitialQuestion()]
  )
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)

  // UI States
  const [isParamsOpen, setIsParamsOpen] = useState(true)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0)
  const [previewSelectedOption, setPreviewSelectedOption] = useState<string | null>(null)
  const [showHintInPreview, setShowHintInPreview] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 2500)
  }

  const activeQuestion = questions[activeQuestionIndex] || questions[0]

  // Modify active question
  const updateActiveQuestion = (updater: (q: BuilderQuestion) => BuilderQuestion) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === activeQuestionIndex ? updater(q) : q))
    )
  }

  // Radio button for setting correct option
  const handleSetCorrect = (optionId: string) => {
    updateActiveQuestion((q) => ({
      ...q,
      options: q.options.map((opt) => ({
        ...opt,
        isCorrect: opt.id === optionId,
      })),
    }))
  }

  const handleOptionTextChange = (optionId: string, text: string) => {
    updateActiveQuestion((q) => ({
      ...q,
      options: q.options.map((opt) => (opt.id === optionId ? { ...opt, text } : opt)),
    }))
  }

  const handleOptionFeedbackChange = (optionId: string, feedback: string) => {
    updateActiveQuestion((q) => ({
      ...q,
      options: q.options.map((opt) => (opt.id === optionId ? { ...opt, feedback } : opt)),
    }))
  }

  // Add an option (A-F)
  const handleAddOption = () => {
    if (activeQuestion.options.length >= 6) return
    const nextIndex = activeQuestion.options.length
    const nextLabel = OPTION_LABELS[nextIndex]
    updateActiveQuestion((q) => ({
      ...q,
      options: [
        ...q.options,
        {
          id: `opt-${Date.now()}-${nextIndex}`,
          label: nextLabel,
          text: '',
          isCorrect: false,
          feedback: '',
        },
      ],
    }))
    showToast(`Added option ${nextLabel}`)
  }

  // Remove an option
  const handleRemoveOption = (optionId: string) => {
    if (activeQuestion.options.length <= 2) {
      showToast('A question must have at least 2 options')
      return
    }
    updateActiveQuestion((q) => {
      const filtered = q.options.filter((opt) => opt.id !== optionId)
      const reindexed = filtered.map((opt, idx) => ({
        ...opt,
        label: OPTION_LABELS[idx],
        isCorrect: opt.isCorrect,
      }))
      if (!reindexed.some((opt) => opt.isCorrect)) {
        reindexed[0].isCorrect = true
      }
      return {
        ...q,
        options: reindexed,
      }
    })
    showToast('Option removed')
  }

  // Add a new question to the quiz
  const handleAddQuestion = () => {
    const nextIndex = questions.length
    const newQ = createBlankQuestion(nextIndex)
    setQuestions((prev) => [...prev, newQ])
    setActiveQuestionIndex(nextIndex)
    showToast(`Added Question Q${(nextIndex + 1).toString().padStart(2, '0')}`)
  }

  // Delete active question
  const handleDeleteQuestion = (indexToDelete: number) => {
    if (questions.length <= 1) {
      showToast('The quiz must have at least one question')
      return
    }
    const updated = questions.filter((_, idx) => idx !== indexToDelete)
    const reindexed = updated.map((q, idx) => ({
      ...q,
      numberLabel: `Q${(idx + 1).toString().padStart(2, '0')}`,
    }))
    setQuestions(reindexed)
    setActiveQuestionIndex((prev) => {
      if (prev >= reindexed.length) return reindexed.length - 1
      if (prev === indexToDelete) return Math.max(0, indexToDelete - 1)
      return prev
    })
    showToast('Question deleted')
  }

  // Validation
  const validateQuiz = (): string | null => {
    if (!title.trim()) {
      return 'Please enter a title for the quiz.'
    }
    if (!description.trim()) {
      return 'Please enter a description or list of topics.'
    }
    if (questions.length === 0) {
      return 'Please add at least one question.'
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question.trim()) {
        return `Question ${i + 1} (${q.numberLabel}) text is empty.`
      }
      const validOptions = q.options.filter((opt) => opt.text.trim().length > 0)
      if (validOptions.length < 2) {
        return `Question ${i + 1} (${q.numberLabel}) needs at least 2 options with text.`
      }
      const hasCorrect = q.options.some((opt) => opt.isCorrect && opt.text.trim().length > 0)
      if (!hasCorrect) {
        return `Question ${i + 1} (${q.numberLabel}): please ensure the correct answer has text.`
      }
    }

    return null
  }

  // Publish handler
  const handlePublish = () => {
    setErrorMessage(null)
    const error = validateQuiz()
    if (error) {
      setErrorMessage(error)
      showToast(error)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsPublishing(true)
    const theme = THEME_OPTIONS[selectedThemeIndex] || THEME_OPTIONS[0]

    const formattedQuestions: QuizQuestion[] = questions.map((q) => {
      const correctOpt = q.options.find((opt) => opt.isCorrect) || q.options[0]
      const validOpts: QuizOption[] = q.options
        .filter((opt) => opt.text.trim().length > 0)
        .map((opt) => ({
          id: opt.label.toLowerCase(),
          label: opt.label as 'A' | 'B' | 'C' | 'D',
          text: opt.text.trim(),
        }))

      return {
        id: q.id,
        numberLabel: q.numberLabel,
        category: (q.category || category).toUpperCase(),
        question: q.question.trim(),
        hint: q.hint.trim() || undefined,
        options: validOpts,
        correctOptionId: correctOpt.label.toLowerCase(),
      }
    })

    const newQuiz: QuizCatalogItem = {
      id: initialQuiz ? initialQuiz.id : `custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category: (category.trim() || 'General').toUpperCase(),
      questionCount: formattedQuestions.length,
      durationMinutes: Number(durationMinutes) || 20,
      passingScore: Number(passingScore) || 70,
      difficulty,
      theme: {
        iconBg: theme.iconBg,
        iconBorder: theme.iconBorder,
        iconColor: theme.iconColor,
      },
      questions: formattedQuestions,
    }

    setTimeout(() => {
      setIsPublishing(false)
      setPublishSuccess(true)
      setTimeout(() => {
        onSaveQuiz(newQuiz)
      }, 700)
    }, 400)
  }

  // Open preview modal
  const openPreview = () => {
    setPreviewQuestionIndex(activeQuestionIndex)
    setPreviewSelectedOption(null)
    setShowHintInPreview(false)
    setIsPreviewOpen(true)
  }

  return (
    <div className="max-w-4xl pb-24 relative">
      {/* Floating Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-3">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Skill Assessments
        </button>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200/60">
          <Clock className="h-3.5 w-3.5 text-emerald-600" />
          {durationMinutes} min · Pass {passingScore}% · {difficulty}
        </span>
      </div>

      {/* Page Title */}
      <div className="mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a2c] text-white shadow-xs">
            <SquarePen className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-gray-900">
              {initialQuiz ? 'Edit Custom Assessment' : 'Custom Question Builder'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {initialQuiz
                ? 'Modify assessment parameters, time limit, and questions.'
                : 'Create, configure, and publish questions for skill assessments.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsParamsOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Settings className="h-4 w-4 text-gray-500" />
          {isParamsOpen ? 'Hide Quiz Settings' : 'Edit Quiz Settings'}
        </button>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-xs animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Incomplete Configuration</p>
            <p className="mt-0.5 text-rose-700">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-rose-400 hover:text-rose-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Success alert */}
      {publishSuccess && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Quiz published successfully!</p>
            <p className="text-xs text-emerald-700">Returning to Skill Assessments catalog...</p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: ASSESSMENT PARAMETERS (Collapsible)                            */}
      {/* ========================================================================= */}
      {isParamsOpen && (
        <div className="mb-7 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs animate-in fade-in">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-700" />
                Assessment Settings & Duration
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Set quiz title, time limit, minimum passing score, and difficulty badge.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              {questions.length} Question{questions.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Quiz Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="quiz_title"
                autoComplete="off"
                data-lpignore="true"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Advanced TypeScript & Clean Architecture"
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1e3a2c] focus:outline-hidden focus:ring-1 focus:ring-[#1e3a2c]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Topics / Description <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="quiz_description"
                autoComplete="off"
                data-lpignore="true"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Generics, Utility Types, Decorators, Clean Code"
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1e3a2c] focus:outline-hidden focus:ring-1 focus:ring-[#1e3a2c]"
              />
            </div>

            {/* Time Limit / Duration */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-emerald-700" />
                  Time Limit: <span className="text-emerald-800 font-bold">{durationMinutes} min</span>
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {DURATION_PRESETS.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      setDurationMinutes(mins)
                      showToast(`Duration set to ${mins} minutes`)
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      durationMinutes === mins
                        ? 'bg-[#1e3a2c] text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={5}
                max={120}
                step={5}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full accent-[#1e3a2c] cursor-pointer"
              />
            </div>

            {/* Passing Score */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-700" />
                  Passing Score: <span className="text-amber-800 font-bold">{passingScore}%</span>
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {PASSING_PRESETS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      setPassingScore(pct)
                      showToast(`Passing score set to ${pct}%`)
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      passingScore === pct
                        ? 'bg-[#1e3a2c] text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={40}
                max={100}
                step={5}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="w-full accent-[#1e3a2c] cursor-pointer"
              />
            </div>

            {/* Difficulty Badge */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Difficulty Badge
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['EASY', 'MEDIUM', 'HARD'] as QuizDifficulty[]).map((level) => {
                  const isSelected = difficulty === level
                  const colorMap = {
                    EASY: isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70',
                    MEDIUM: isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100/70',
                    HARD: isSelected
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100/70',
                  }
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => {
                        setDifficulty(level)
                        showToast(`Difficulty set to ${level}`)
                      }}
                      className={`rounded-xl border py-2 text-center text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${colorMap[level]}`}
                    >
                      {level}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Category & Card Theme */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Domain / Subject
                </label>
                <input
                  type="text"
                  name="quiz_subject_domain"
                  id="quiz_subject_domain"
                  autoComplete="off"
                  data-lpignore="true"
                  value={category}
                  onChange={(e) => setCategory(e.target.value.toUpperCase())}
                  placeholder="FRONTEND"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 font-bold uppercase focus:border-[#1e3a2c] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Theme Color
                </label>
                <div className="flex items-center gap-2 py-1">
                  {THEME_OPTIONS.map((th, idx) => (
                    <button
                      key={th.name}
                      type="button"
                      onClick={() => setSelectedThemeIndex(idx)}
                      title={th.name}
                      className={`h-6 w-6 rounded-full transition-transform cursor-pointer ${th.badgeClass} ${
                        selectedThemeIndex === idx
                          ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: NEW QUESTION CARD (Matching Reference Image)                   */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-xs">
        {/* Card Header matching Screenshot */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">
                {initialQuiz ? 'Edit Question' : 'New Question'} ({activeQuestion.numberLabel})
              </h2>
              {questions.length > 1 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                  {activeQuestionIndex + 1} of {questions.length}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {initialQuiz
                ? 'Modify question fields, then preview or save changes.'
                : 'Fill in all fields, then preview before publishing.'}
            </p>
          </div>

          {/* Action Buttons: Preview, Cancel, Publish (Matching top-right of screenshot card) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openPreview}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5 text-gray-500" />
              Preview
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing || publishSuccess}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e3a2c] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#162d22] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              {isPublishing
                ? (initialQuiz ? 'Saving...' : 'Publishing...')
                : (initialQuiz ? 'Save Changes' : 'Publish')}
            </button>
          </div>
        </div>

        {/* Question Selector Tabs (If multiple questions exist) */}
        {questions.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto py-3 border-b border-gray-100 mb-6">
            {questions.map((q, idx) => {
              const isActive = idx === activeQuestionIndex
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setActiveQuestionIndex(idx)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#1e3a2c] text-white shadow-xs'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/70'
                  }`}
                >
                  <span>{q.numberLabel}</span>
                  {q.question.trim().length > 0 && (
                    <Check className={`h-3 w-3 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                  )}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => handleDeleteQuestion(activeQuestionIndex)}
              className="ml-auto text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer font-medium"
              title="Delete current question"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete {activeQuestion.numberLabel}
            </button>
          </div>
        )}

        {/* Field 1: QUESTION TEXT * */}
        <div className="mt-6 mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Question Text <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            name="quiz_question_prompt"
            autoComplete="off"
            data-lpignore="true"
            value={activeQuestion.question}
            onChange={(e) => updateActiveQuestion((q) => ({ ...q, question: e.target.value }))}
            placeholder="Enter the full question as students will see it..."
            className="w-full rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1e3a2c] focus:outline-hidden focus:ring-1 focus:ring-[#1e3a2c] transition-colors"
          />
        </div>

        {/* Field 2: STUDENT GUIDANCE HINT */}
        <div className="mb-7 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            <label className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Student Guidance Hint
            </label>
          </div>
          <textarea
            rows={2}
            name="quiz_guidance_hint"
            autoComplete="off"
            data-lpignore="true"
            value={activeQuestion.hint}
            onChange={(e) => updateActiveQuestion((q) => ({ ...q, hint: e.target.value }))}
            placeholder="Give a nudge without revealing the answer — e.g. 'Think about what happens at the boundary.'"
            className="w-full rounded-lg border border-amber-200 bg-white p-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Field 3: ANSWER OPTIONS * */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Answer Options <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs font-semibold text-gray-400">
              {activeQuestion.options.length}/6 options
            </span>
          </div>

          <div className="space-y-4">
            {activeQuestion.options.map((option) => (
              <div
                key={option.id}
                className={`rounded-xl border p-4 transition-all duration-150 ${
                  option.isCorrect
                    ? 'border-emerald-300 bg-emerald-50/30 ring-1 ring-emerald-400/40'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Main Option Row */}
                <div className="flex items-center gap-3">
                  {/* Radio button to choose correct answer */}
                  <button
                    type="button"
                    onClick={() => {
                      handleSetCorrect(option.id)
                      showToast(`Option ${option.label} marked as correct`)
                    }}
                    className="flex items-center gap-1.5 cursor-pointer group"
                    title={`Click to mark Option ${option.label} as correct`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                        option.isCorrect
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-gray-300 bg-white group-hover:border-gray-400'
                      }`}
                    >
                      {option.isCorrect ? (
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      ) : (
                        <span className="text-[10px] font-bold text-gray-500">{option.label}</span>
                      )}
                    </div>
                  </button>

                  {/* Option Text Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      name={`quiz_choice_${option.label}`}
                      autoComplete="off"
                      data-lpignore="true"
                      value={option.text}
                      onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                      placeholder={`Option ${option.label} text...`}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1e3a2c] focus:outline-hidden focus:ring-1 focus:ring-[#1e3a2c]"
                    />
                  </div>

                  {/* Correct Badge */}
                  {option.isCorrect && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 shrink-0">
                      <Check className="h-3 w-3 stroke-[3]" />
                      Correct
                    </span>
                  )}

                  {/* Delete Option Icon */}
                  {activeQuestion.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(option.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete this option"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Incorrect Option Feedback Input */}
                {!option.isCorrect && (
                  <div className="mt-3 flex items-center gap-2 pl-9">
                    <span className="text-amber-500 shrink-0 text-xs">⚠️</span>
                    <input
                      type="text"
                      name={`quiz_feedback_${option.label}`}
                      autoComplete="off"
                      data-lpignore="true"
                      value={option.feedback}
                      onChange={(e) => handleOptionFeedbackChange(option.id, e.target.value)}
                      placeholder="Feedback shown when a student picks this wrong answer..."
                      className="w-full rounded-md border border-gray-200 bg-gray-50/70 px-3 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 focus:border-[#1e3a2c] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Option Button */}
          {activeQuestion.options.length < 6 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors cursor-pointer w-full justify-center"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Option ({OPTION_LABELS[activeQuestion.options.length]})
            </button>
          )}
        </div>

        {/* Bottom Bar matching Screenshot: + New Question button */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <div className="text-xs text-gray-400 font-medium">
            {questions.length} Question{questions.length > 1 ? 's' : ''} in this Assessment
          </div>

          <button
            type="button"
            onClick={handleAddQuestion}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a2c] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#162d22] transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            + New Question
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PREVIEW QUIZ MODAL                                                        */}
      {/* ========================================================================= */}
      {isPreviewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsPreviewOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-2xl bg-white p-7 shadow-2xl animate-in zoom-in-95 cursor-default"
          >
            {/* Modal Top Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 uppercase">
                  {difficulty}
                </span>
                <span className="text-xs text-gray-400 font-medium">·</span>
                <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {durationMinutes} min
                </span>
                <span className="text-xs text-gray-400 font-medium">·</span>
                <span className="text-xs font-semibold text-gray-600">Pass {passingScore}%</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Title & Desc */}
            <div className="mb-5">
              <h3 className="font-serif text-xl font-bold text-gray-900">
                {title.trim() || 'Untitled Custom Quiz'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {description.trim() || 'No description provided'}
              </p>
            </div>

            {/* Stepper between questions in Preview */}
            <div className="flex items-center justify-between mb-4 bg-gray-50 px-3.5 py-2 rounded-xl">
              <span className="text-xs font-bold text-gray-700">
                Question {previewQuestionIndex + 1} of {questions.length} (
                {questions[previewQuestionIndex]?.numberLabel})
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={previewQuestionIndex === 0}
                  onClick={() => {
                    setPreviewQuestionIndex((p) => Math.max(0, p - 1))
                    setPreviewSelectedOption(null)
                    setShowHintInPreview(false)
                  }}
                  className="rounded p-1 text-gray-500 hover:bg-gray-200 disabled:opacity-30 cursor-pointer"
                  title="Previous Question"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={previewQuestionIndex === questions.length - 1}
                  onClick={() => {
                    setPreviewQuestionIndex((p) => Math.min(questions.length - 1, p + 1))
                    setPreviewSelectedOption(null)
                    setShowHintInPreview(false)
                  }}
                  className="rounded p-1 text-gray-500 hover:bg-gray-200 disabled:opacity-30 cursor-pointer"
                  title="Next Question"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Active Preview Question */}
            {(() => {
              const currentQ = questions[previewQuestionIndex] || questions[0]
              return (
                <div>
                  <p className="text-base font-medium text-gray-900 mb-4 leading-relaxed">
                    {currentQ.question || (
                      <span className="italic text-gray-400">No question text provided yet.</span>
                    )}
                  </p>

                  {/* Hint Toggle */}
                  {currentQ.hint && (
                    <div className="mb-5">
                      <button
                        type="button"
                        onClick={() => setShowHintInPreview((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer"
                      >
                        <Lightbulb className="h-3.5 w-3.5" />
                        {showHintInPreview ? 'Hide Hint' : 'Show Guidance Hint'}
                      </button>
                      {showHintInPreview && (
                        <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200/60 p-3 text-xs text-amber-900 leading-relaxed">
                          {currentQ.hint}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Options List */}
                  <div className="space-y-2.5 mb-6">
                    {currentQ.options.map((opt) => {
                      const isSelected = previewSelectedOption === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setPreviewSelectedOption(opt.id)}
                          className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-left text-sm transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#1e3a2c] bg-[#1e3a2c]/5 text-[#1e3a2c] font-medium'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-lg border text-xs font-bold ${
                                isSelected
                                  ? 'border-[#1e3a2c] bg-[#1e3a2c] text-white'
                                  : 'border-gray-200 text-gray-500'
                              }`}
                            >
                              {opt.label}
                            </span>
                            <span>{opt.text || `Option ${opt.label}`}</span>
                          </div>
                          {opt.isCorrect && (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Correct answer
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="rounded-xl bg-gray-900 px-5 py-2 text-xs font-semibold text-white hover:bg-black transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
