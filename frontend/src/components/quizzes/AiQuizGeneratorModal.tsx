import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Sparkles,
  X,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  Wand2,
  Sliders,
  Layers,
  BookOpen,
  Loader2,
} from 'lucide-react'
import {
  generateQuizWithGemini,
  getStoredGeminiKey,
  saveStoredGeminiKey,
  type GeneratedQuizResult,
} from '../../services/aiQuizGenerator'

interface AiQuizGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (result: GeneratedQuizResult) => void
  currentTopic?: string
  currentCategory?: string
}

const CATEGORIES = [
  { value: 'BACKEND', label: 'Backend Development (C#, .NET, Java, Go)' },
  { value: 'FRONTEND', label: 'Frontend Development (React, TypeScript, CSS)' },
  { value: 'DATABASE', label: 'Databases & SQL (PostgreSQL, EF Core, Indexing)' },
  { value: 'DEVOPS', label: 'DevOps & Cloud (Docker, CI/CD, Git, Azure)' },
  { value: 'ALGORITHMS', label: 'Data Structures & Algorithms' },
  { value: 'SECURITY', label: 'Application Security & Auth (JWT, OWASP)' },
  { value: 'GENERAL', label: 'General Software Engineering' },
]

export default function AiQuizGeneratorModal({
  isOpen,
  onClose,
  onSuccess,
  currentTopic = '',
  currentCategory = 'BACKEND',
}: AiQuizGeneratorModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [topic, setTopic] = useState(currentTopic)
  const [category, setCategory] = useState(currentCategory || 'BACKEND')
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM')
  const [questionCount, setQuestionCount] = useState<number>(5)
  const [instructions, setInstructions] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredGeminiKey()
      if (stored) setApiKey(stored)
      if (currentTopic && !topic) setTopic(currentTopic)
      if (currentCategory) setCategory(currentCategory)
      setError(null)
    }
  }, [isOpen, currentTopic, currentCategory])

  if (!isOpen) return null

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key.')
      return
    }

    if (!topic.trim()) {
      setError('Please specify a quiz title or topic.')
      return
    }

    setIsLoading(true)

    try {
      const result = await generateQuizWithGemini({
        apiKey: apiKey.trim(),
        topic: topic.trim(),
        category,
        difficulty,
        questionCount,
        instructions: instructions.trim() || undefined,
      })

      saveStoredGeminiKey(apiKey.trim())
      onSuccess(result)
      onClose()
    } catch (err: any) {
      console.error('Failed to generate quiz:', err)
      setError(err?.message || 'An error occurred while generating the quiz with Gemini.')
    } finally {
      setIsLoading(false)
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => !isLoading && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 my-8">
        {/* Top Gradient Banner */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-emerald-700 p-6 text-white relative">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="absolute top-5 right-5 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner text-white">
              <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold text-purple-100 mb-1 border border-white/20">
                <Wand2 className="h-3 w-3" />
                Powered by Google Gemini
              </div>
              <h2 className="text-xl font-bold font-serif tracking-tight">AI Quiz Generator</h2>
              <p className="text-xs text-white/80 mt-0.5">
                Automatically generate questions, options, answers, and educational hints.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 text-xs shadow-xs animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Generation Failed</p>
                <p className="mt-0.5 text-rose-700 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Gemini API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-purple-600" />
                Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-purple-600 hover:text-purple-800 font-medium underline flex items-center gap-1"
              >
                Get free API key
              </a>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-purple-600 focus:bg-white focus:ring-2 focus:ring-purple-600/10 font-mono transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Your key is saved locally in your browser and used only to communicate directly with Gemini.
            </p>
          </div>

          {/* Quiz Topic / Title */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Quiz Title / Topic <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. ASP.NET Core Dependency Injection & LINQ"
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 font-semibold outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 transition-all placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>

          {/* Category & Difficulty Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-gray-500" />
                Category
              </label>
              <select
                disabled={isLoading}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-800 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 cursor-pointer transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-gray-500" />
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-xl">
                {(['EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setDifficulty(diff)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      difficulty === diff
                        ? 'bg-white text-purple-700 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {diff === 'EASY' ? 'Junior' : diff === 'MEDIUM' ? 'Mid' : 'Senior'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Number of Questions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-gray-500" />
                Number of Questions
              </label>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                {questionCount} questions
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 8, 10].map((count) => (
                <button
                  key={count}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setQuestionCount(count)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    questionCount === count
                      ? 'border-purple-600 bg-purple-50/70 text-purple-800 shadow-2xs'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {count} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Custom Focus / Specific Requirements */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-gray-500" />
              Special Instructions / Focus Area (Optional)
            </label>
            <textarea
              rows={2}
              disabled={isLoading}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Focus on practical code scenarios, async/await edge cases, and include tricky distractors."
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs text-gray-900 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 transition-all placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || !topic.trim() || !apiKey.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Generating with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  <span>Generate Quiz</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
