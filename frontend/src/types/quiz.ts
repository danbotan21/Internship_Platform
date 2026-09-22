export type QuizDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface QuizOption {
  id: string
  label: 'A' | 'B' | 'C' | 'D'
  text: string
}

export interface QuizQuestion {
  id: string
  numberLabel: string // e.g. "Q01"
  category: string // e.g. "DATA STRUCTURES", "SORTING"
  question: string
  hint?: string
  options: QuizOption[]
  correctOptionId: string
}

export interface QuizCatalogItem {
  id: string
  title: string
  description: string
  category?: string
  questionCount: number
  durationMinutes: number
  passingScore: number // percentage, e.g. 70
  difficulty: QuizDifficulty
  theme: {
    iconBg: string
    iconBorder: string
    iconColor: string
  }
  questions?: QuizQuestion[]
}

export type ViolationType =
  | 'TAB_SWITCH'
  | 'WINDOW_BLUR'
  | 'SCREEN_SHARE_STOPPED'
  | 'NAVIGATION_EXIT'
  | 'PAGE_RELOAD_VIOLATION'

export interface AntiCheatViolation {
  id: string
  timestamp: Date
  type: ViolationType
  description: string
}

export interface QuizSubmissionResult {
  score: number
  totalQuestions: number
  percentage: number
  isPassed: boolean
  isCompromised: boolean
  violations: AntiCheatViolation[]
}
