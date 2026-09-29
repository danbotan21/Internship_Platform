import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Sparkles,
  X,
  AlertCircle,
  HelpCircle,
  Wand2,
  CheckCircle2,
  Sliders,
  Layers,
  BookOpen,
  Loader2,
} from 'lucide-react'
import {
  generateQuizWithGemini,
  isGeminiConfigured,
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
  const [topic, setTopic] = useState(currentTopic)
  const [category, setCategory] = useState(currentCategory || 'BACKEND')
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM')
  const [questionCount, setQuestionCount] = useState<number>(5)
  const [instructions, setInstructions] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isConfigured = isGeminiConfigured()

  useEffect(() => {
    if (isOpen) {
      if (currentTopic && !topic) setTopic(currentTopic)
      if (currentCategory) setCategory(currentCategory)
      setError(null)
    }
  }, [isOpen, currentTopic, currentCategory])

  if (!isOpen) return null

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isConfigured) {
      setError(
        'VITE_GEMINI_API_KEY nu este setat în frontend/.env. Te rugăm să adaugi cheia în fișierul .env și să repornești serverul Vite.'
      )
      return
    }

    if (!topic.trim()) {
      setError('Te rugăm să introduci un titlu sau subiect pentru quiz.')
      return
    }

    setIsLoading(true)

    try {
      const result = await generateQuizWithGemini({
        topic: topic.trim(),
        category,
        difficulty,
        questionCount,
        instructions: instructions.trim() || undefined,
      })

      onSuccess(result)
      onClose()
    } catch (err: any) {
      console.error('Failed to generate quiz:', err)
      setError(err?.message || 'A apărut o eroare la generarea quiz-ului cu Gemini AI.')
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
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold text-purple-100 border border-white/20">
                  <Wand2 className="h-3 w-3" />
                  Powered by Google Gemini
                </span>
                {isConfigured ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-[11px] font-semibold text-emerald-200 border border-emerald-400/30">
                    <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                    Key loaded from .env
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-[11px] font-semibold text-amber-200 border border-amber-400/30">
                    <AlertCircle className="h-3 w-3 text-amber-300" />
                    No key in .env
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold font-serif tracking-tight">AI Quiz Generator</h2>
              <p className="text-xs text-white/80 mt-0.5">
                Generează automat întrebări, variante de răspuns, explicații și indicii didactice (hints).
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="p-6 space-y-5">
          {!isConfigured && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 text-xs shadow-xs animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Cheia Gemini API lipsește din .env</p>
                <p className="mt-0.5 text-amber-800 leading-relaxed">
                  Pentru a folosi generatorul, adaugă linia:{' '}
                  <code className="bg-amber-100/80 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold text-amber-950">
                    VITE_GEMINI_API_KEY=cheia_ta_aici
                  </code>{' '}
                  în fișierul <code className="font-bold">frontend/.env</code> și repornește serverul Vite (<code className="font-bold">npm run dev</code>).
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 text-xs shadow-xs animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Eroare la generare</p>
                <p className="mt-0.5 text-rose-700 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Quiz Topic / Title */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Titlu sau Subiect Quiz <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="ex: C# ASP.NET Core Web API, Docker Containers, React Hooks..."
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 font-semibold outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 transition-all placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>

          {/* Category & Difficulty Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-gray-500" />
                Categorie
              </label>
              <select
                disabled={isLoading}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-900 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 transition-all cursor-pointer font-medium"
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
                Dificultate
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['EASY', 'MEDIUM', 'HARD'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      difficulty === lvl
                        ? lvl === 'EASY'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : lvl === 'MEDIUM'
                          ? 'bg-amber-50 border-amber-500 text-amber-700'
                          : 'bg-rose-50 border-rose-500 text-rose-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {lvl === 'EASY' ? 'Junior' : lvl === 'MEDIUM' ? 'Mid' : 'Senior'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question Count Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-gray-500" />
                Număr de Întrebări
              </label>
              <span className="text-[11px] text-gray-500">
                Timp estimat: ~{Math.max(10, questionCount * 2)} min
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 8, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setQuestionCount(num)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    questionCount === num
                      ? 'border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-600/20'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {num} întrebări
                </button>
              ))}
            </div>
          </div>

          {/* Optional Prompt Instructions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-gray-500" />
                Instrucțiuni Specifice (Opțional)
              </label>
              <span className="text-[11px] text-gray-400">ex: focus pe scenarii practice</span>
            </div>
            <textarea
              rows={2}
              disabled={isLoading}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="ex: Pune accent pe scenarii de producție, cazuri limită de performanță sau capcane comune de sintaxă."
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
              Anulează
            </button>

            <button
              type="submit"
              disabled={isLoading || !topic.trim() || !isConfigured}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Se generează cu Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  <span>Generează Quiz</span>
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
