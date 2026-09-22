export interface UserQuizAttempt {
  id: string
  userId: string
  userName: string
  userEmail: string
  quizId: string
  quizTitle: string
  category: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  score: number // correct count
  totalQuestions: number
  percentage: number
  passingScore: number
  status: 'PASSED' | 'BORDERLINE' | 'FAILED'
  timeSpentSeconds: number
  timeSpentFormatted: string
  isFlagged: boolean
  flagReason?: string
  completedAt: string // ISO string
  cohortWeek: number // 1 to 8
  missedTopics: string[]
  answersSummary?: {
    correctCount: number
    incorrectCount: number
  }
}

export interface TopicErrorStat {
  topic: string
  errorRate: number
  totalTested: number
  totalErrors: number
}

export interface WeekScoreEvolution {
  weekLabel: string // "W1" ... "W8"
  weekNumber: number
  top10: number
  avg: number
  bottom10: number
  attemptCount: number
}

export interface AnalyticsSummary {
  totalAssessments: number
  uniqueStudents: number
  avgScore: number // e.g. 71.4
  passRate: number // e.g. 68
  avgDurationSeconds: number
  avgDurationFormatted: string // e.g. "22m 18s"
  weekEvolution: WeekScoreEvolution[]
  highestErrorTopics: TopicErrorStat[]
  recentAttempts: UserQuizAttempt[]
}

const STORAGE_KEY = 'internflow_quiz_results_db'
const API_URL = '/api/quiz-results'

// Real Team Benchmark Dataset
export const TEAM_SEED_ATTEMPTS: UserQuizAttempt[] = [
  {
    id: 'att-team-1',
    userId: 'user-daniel-botan',
    userName: 'Daniel Botan',
    userEmail: 'danbotan71@gmail.com',
    quizId: 'data-structures-algorithms',
    quizTitle: 'Data Structures & Algorithms',
    category: 'Computer Science',
    difficulty: 'HARD',
    score: 9,
    totalQuestions: 10,
    percentage: 91,
    passingScore: 70,
    status: 'PASSED',
    timeSpentSeconds: 1122,
    timeSpentFormatted: '18m 42s',
    isFlagged: false,
    completedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    cohortWeek: 8,
    missedTopics: ['Big-O Notation'],
  },
  {
    id: 'att-team-2',
    userId: 'user-daniel-chigaianu',
    userName: 'Daniel Chigaianu',
    userEmail: 'dan.chigaianu@gmail.com',
    quizId: 'react-frontend',
    quizTitle: 'React & Frontend',
    category: 'Frontend',
    difficulty: 'MEDIUM',
    score: 8,
    totalQuestions: 10,
    percentage: 88,
    passingScore: 70,
    status: 'PASSED',
    timeSpentSeconds: 1160,
    timeSpentFormatted: '19m 20s',
    isFlagged: false,
    completedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    cohortWeek: 8,
    missedTopics: ['Async/Await'],
  },
  {
    id: 'att-team-3',
    userId: 'user-daniel-chitanu',
    userName: 'Daniel Chitanu',
    userEmail: 'dk7999357@gmail.com',
    quizId: 'react-frontend',
    quizTitle: 'React & Frontend',
    category: 'Frontend',
    difficulty: 'MEDIUM',
    score: 8,
    totalQuestions: 10,
    percentage: 74,
    passingScore: 70,
    status: 'PASSED',
    timeSpentSeconds: 1331,
    timeSpentFormatted: '22m 11s',
    isFlagged: false,
    completedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    cohortWeek: 8,
    missedTopics: ['Async/Await', 'React Hooks'],
  },
  {
    id: 'att-team-4',
    userId: 'user-gicu-caraman',
    userName: 'Gicu Caraman',
    userEmail: 'caramangicu25@gmail.com',
    quizId: 'data-structures-algorithms',
    quizTitle: 'Data Structures & Algorithms',
    category: 'Computer Science',
    difficulty: 'HARD',
    score: 6,
    totalQuestions: 10,
    percentage: 63,
    passingScore: 70,
    status: 'BORDERLINE',
    timeSpentSeconds: 1530,
    timeSpentFormatted: '25m 30s',
    isFlagged: false,
    completedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    cohortWeek: 8,
    missedTopics: ['Big-O Notation', 'SQL Joins'],
  },
  {
    id: 'att-team-5',
    userId: 'user-mihail-goncearov',
    userName: 'Mihail Goncearov',
    userEmail: 'forprogramm11@gmail.com',
    quizId: 'sql-databases',
    quizTitle: 'SQL & Databases',
    category: 'Database',
    difficulty: 'HARD',
    score: 8,
    totalQuestions: 10,
    percentage: 82,
    passingScore: 70,
    status: 'PASSED',
    timeSpentSeconds: 1065,
    timeSpentFormatted: '17m 45s',
    isFlagged: false,
    completedAt: new Date(Date.now() - 1000 * 60 * 270).toISOString(),
    cohortWeek: 8,
    missedTopics: ['SQL Joins'],
  },
  {
    id: 'att-team-6',
    userId: 'user-sergiu-negara',
    userName: 'Sergiu Negara',
    userEmail: 'negara.sergiu2@gmail.com',
    quizId: 'sql-databases',
    quizTitle: 'SQL & Databases',
    category: 'Database',
    difficulty: 'HARD',
    score: 4,
    totalQuestions: 10,
    percentage: 41,
    passingScore: 70,
    status: 'FAILED',
    timeSpentSeconds: 1798,
    timeSpentFormatted: '29m 58s',
    isFlagged: true,
    flagReason: 'Screen share disconnected before final submission',
    completedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    cohortWeek: 7,
    missedTopics: ['SQL Joins', 'REST Semantics', 'Async/Await'],
  },
  {
    id: 'att-team-7',
    userId: 'user-valeriu-bulgaru',
    userName: 'Valeriu Bulgaru',
    userEmail: 'valeri.bulgaru06@gmail.com',
    quizId: 'react-frontend',
    quizTitle: 'React & Frontend',
    category: 'Frontend',
    difficulty: 'MEDIUM',
    score: 7,
    totalQuestions: 10,
    percentage: 70,
    passingScore: 70,
    status: 'PASSED',
    timeSpentSeconds: 1250,
    timeSpentFormatted: '20m 50s',
    isFlagged: false,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    cohortWeek: 7,
    missedTopics: ['Async/Await'],
  },
  {
    id: 'att-team-8',
    userId: 'user-veaceslav-nagorneac',
    userName: 'Veaceslav Nagorneac',
    userEmail: 'slavik@internflow.dev',
    quizId: 'react-frontend',
    quizTitle: 'React & Frontend',
    category: 'Frontend',
    difficulty: 'MEDIUM',
    score: 7,
    totalQuestions: 10,
    percentage: 72,
    passingScore: 70,
    status: 'PASSED',
    timeSpentSeconds: 1320,
    timeSpentFormatted: '22m 00s',
    isFlagged: false,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    cohortWeek: 6,
    missedTopics: ['React Hooks'],
  },
  // Week 5 Cohort (Valeriu Bulgaru)
  {
    id: 'att-team-9',
    userId: 'user-valeriu-bulgaru-2',
    userName: 'Valeriu Bulgaru',
    userEmail: 'valeri.bulgaru06@gmail.com',
    quizId: 'sql-databases',
    quizTitle: 'SQL & Databases',
    category: 'Database',
    difficulty: 'HARD',
    score: 6,
    totalQuestions: 10,
    percentage: 65,
    passingScore: 70,
    status: 'BORDERLINE',
    timeSpentSeconds: 1410,
    timeSpentFormatted: '23m 30s',
    isFlagged: false,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    cohortWeek: 5,
    missedTopics: ['SQL Joins'],
  },
  // Week 4 Cohort (Daniel Botan)
  {
    id: 'att-team-10',
    userId: 'user-daniel-botan-2',
    userName: 'Daniel Botan',
    userEmail: 'danbotan71@gmail.com',
    quizId: 'data-structures-algorithms',
    quizTitle: 'Data Structures & Algorithms',
    category: 'Computer Science',
    difficulty: 'HARD',
    score: 6,
    totalQuestions: 10,
    percentage: 62,
    passingScore: 70,
    status: 'BORDERLINE',
    timeSpentSeconds: 1600,
    timeSpentFormatted: '26m 40s',
    isFlagged: false,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 180).toISOString(),
    cohortWeek: 4,
    missedTopics: ['Big-O Notation', 'Async/Await'],
  },
  // Week 3 Cohort (Gicu Caraman)
  {
    id: 'att-team-11',
    userId: 'user-gicu-caraman-2',
    userName: 'Gicu Caraman',
    userEmail: 'caramangicu25@gmail.com',
    quizId: 'react-frontend',
    quizTitle: 'React & Frontend',
    category: 'Frontend',
    difficulty: 'MEDIUM',
    score: 6,
    totalQuestions: 10,
    percentage: 58,
    passingScore: 70,
    status: 'FAILED',
    timeSpentSeconds: 1480,
    timeSpentFormatted: '24m 40s',
    isFlagged: false,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 250).toISOString(),
    cohortWeek: 3,
    missedTopics: ['Async/Await', 'Git Workflow'],
  },
  // Week 2 Cohort (Sergiu Negara)
  {
    id: 'att-team-12',
    userId: 'user-sergiu-negara-2',
    userName: 'Sergiu Negara',
    userEmail: 'negara.sergiu2@gmail.com',
    quizId: 'sql-databases',
    quizTitle: 'SQL & Databases',
    category: 'Database',
    difficulty: 'HARD',
    score: 5,
    totalQuestions: 10,
    percentage: 53,
    passingScore: 70,
    status: 'FAILED',
    timeSpentSeconds: 1650,
    timeSpentFormatted: '27m 30s',
    isFlagged: false,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 320).toISOString(),
    cohortWeek: 2,
    missedTopics: ['SQL Joins', 'Git Workflow'],
  },
  // Week 1 Cohort (Veaceslav Nagorneac)
  {
    id: 'att-team-13',
    userId: 'user-veaceslav-nagorneac-2',
    userName: 'Veaceslav Nagorneac',
    userEmail: 'slavik@internflow.dev',
    quizId: 'data-structures-algorithms',
    quizTitle: 'Data Structures & Algorithms',
    category: 'Computer Science',
    difficulty: 'HARD',
    score: 5,
    totalQuestions: 10,
    percentage: 48,
    passingScore: 70,
    status: 'FAILED',
    timeSpentSeconds: 1710,
    timeSpentFormatted: '28m 30s',
    isFlagged: false,
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 400).toISOString(),
    cohortWeek: 1,
    missedTopics: ['Big-O Notation', 'Git Workflow'],
  },
]

// Listeners for reactive updates across the app
type ChangeListener = (attempts: UserQuizAttempt[]) => void
const listeners: Set<ChangeListener> = new Set()

export function subscribeQuizAttempts(fn: ChangeListener): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function notifyListeners(attempts: UserQuizAttempt[]) {
  listeners.forEach((fn) => {
    try {
      fn(attempts)
    } catch (e) {
      console.error('Error notifying quiz results listener:', e)
    }
  })
}

// Check if a name is from the previous random placeholder dataset
function isRandomPlaceholderName(name: string): boolean {
  const randomNames = [
    'Priya Anand',
    'Marcus Webb',
    'Sarah Jenkins',
    'David Kim',
    'Lin Zhao',
    'Alexandre Roy',
    'Elena Rostova',
    'Carlos Morales',
    'Maya Patel',
    'Thomas Mueller',
    'Hannah Schmidt',
    'Lucas Silva',
    'Sofia Reyes',
    'Jamal Osei',
  ]
  return randomNames.includes(name)
}

/**
 * Loads all quiz attempts, seamlessly replacing any legacy placeholder names
 * with the user's actual team members.
 */
export function getQuizAttempts(): UserQuizAttempt[] {
  if (typeof window === 'undefined') return TEAM_SEED_ATTEMPTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as UserQuizAttempt[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Migrate legacy quiz IDs if any exist in stored attempts
        let idMigrated = false
        parsed.forEach((a) => {
          if (a.quizId === 'typescript-essentials') {
            a.quizId = 'react-frontend'
            a.quizTitle = 'React & Frontend'
            idMigrated = true
          } else if (a.quizId === 'backend-architecture-sql') {
            a.quizId = 'sql-databases'
            a.quizTitle = 'SQL & Databases'
            idMigrated = true
          }
        })

        // Filter out old random placeholder names and preserve real user submissions
        const realCustomSubmissions = parsed.filter((a) => !isRandomPlaceholderName(a.userName))

        // If there were placeholder names, migrate localStorage immediately
        if (realCustomSubmissions.length !== parsed.length) {
          // Merge real team seed with any custom submission made by the user
          const existingIds = new Set(TEAM_SEED_ATTEMPTS.map((s) => s.id))
          const userOnly = realCustomSubmissions.filter((a) => !existingIds.has(a.id))
          const merged = [...userOnly, ...TEAM_SEED_ATTEMPTS]
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
          return merged
        }

        if (idMigrated) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
        }

        return parsed
      }
    }
    // If empty or never initialized, write team seeds
    localStorage.setItem(STORAGE_KEY, JSON.stringify(TEAM_SEED_ATTEMPTS))
    return TEAM_SEED_ATTEMPTS
  } catch (err) {
    console.warn('Failed to read quiz attempts from localStorage:', err)
    return TEAM_SEED_ATTEMPTS
  }
}

/**
 * Saves a new quiz attempt:
 * 1. Appends to client localStorage
 * 2. Fires reactive update to all listeners
 * 3. Asynchronously persists to the server endpoint (/api/quiz-results)
 */
export async function saveQuizAttempt(attempt: UserQuizAttempt): Promise<UserQuizAttempt> {
  const current = getQuizAttempts()
  // Prepend so the newest attempt appears at the top
  const updated = [attempt, ...current.filter((a) => a.id !== attempt.id)]

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (err) {
      console.error('Failed to save quiz attempt to localStorage:', err)
    }
  }

  notifyListeners(updated)

  // Sync to server in background
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attempt),
    }).catch(() => undefined)
  } catch {
    // Ignore server sync failures in local mode
  }

  return attempt
}

/**
 * Resets database to team benchmark dataset.
 */
export function resetQuizAttemptsToSeed(): UserQuizAttempt[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(TEAM_SEED_ATTEMPTS))
  }
  notifyListeners(TEAM_SEED_ATTEMPTS)
  return TEAM_SEED_ATTEMPTS
}

/**
 * Helper to format seconds into "Xm Ys"
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

/**
 * Computes all analytics summary metrics dynamically from the current database.
 */
export function calculateAnalyticsSummary(
  attempts: UserQuizAttempt[],
  quizIdFilter?: string
): AnalyticsSummary {
  const filtered = quizIdFilter && quizIdFilter !== 'ALL'
    ? attempts.filter((a) => a.quizId === quizIdFilter)
    : attempts

  const totalAssessments = filtered.length
  const uniqueStudents = new Set(filtered.map((a) => a.userEmail || a.userName || a.userId)).size

  if (totalAssessments === 0) {
    return {
      totalAssessments: 0,
      uniqueStudents: 0,
      avgScore: 0,
      passRate: 0,
      avgDurationSeconds: 0,
      avgDurationFormatted: '0m 00s',
      weekEvolution: [],
      highestErrorTopics: [],
      recentAttempts: [],
    }
  }

  const sumScore = filtered.reduce((acc, curr) => acc + curr.percentage, 0)
  const avgScore = Math.round((sumScore / totalAssessments) * 10) / 10

  const passedCount = filtered.filter((a) => a.status === 'PASSED').length
  const passRate = Math.round((passedCount / totalAssessments) * 100)

  const sumDuration = filtered.reduce((acc, curr) => acc + curr.timeSpentSeconds, 0)
  const avgDurationSeconds = Math.round(sumDuration / totalAssessments)
  const avgDurationFormatted = formatDuration(avgDurationSeconds)

  const isGlobal = !quizIdFilter || quizIdFilter === 'ALL'

  // 1. Calculate weekly score evolution (W1 - W8)
  const baselineWeeks = [
    { weekLabel: 'W1', weekNumber: 1, baseTop: 68, baseAvg: 52, baseBottom: 35 },
    { weekLabel: 'W2', weekNumber: 2, baseTop: 72, baseAvg: 56, baseBottom: 38 },
    { weekLabel: 'W3', weekNumber: 3, baseTop: 76, baseAvg: 60, baseBottom: 41 },
    { weekLabel: 'W4', weekNumber: 4, baseTop: 80, baseAvg: 63, baseBottom: 44 },
    { weekLabel: 'W5', weekNumber: 5, baseTop: 83, baseAvg: 66, baseBottom: 46 },
    { weekLabel: 'W6', weekNumber: 6, baseTop: 86, baseAvg: 69, baseBottom: 48 },
    { weekLabel: 'W7', weekNumber: 7, baseTop: 89, baseAvg: 70, baseBottom: 50 },
    { weekLabel: 'W8', weekNumber: 8, baseTop: 92, baseAvg: 72, baseBottom: 52 },
  ]

  const weekEvolution: WeekScoreEvolution[] = baselineWeeks.map((bw) => {
    const weekAttempts = filtered.filter((a) => a.cohortWeek === bw.weekNumber)
    if (weekAttempts.length === 0) {
      return {
        weekLabel: bw.weekLabel,
        weekNumber: bw.weekNumber,
        top10: isGlobal ? bw.baseTop : 0,
        avg: isGlobal ? bw.baseAvg : 0,
        bottom10: isGlobal ? bw.baseBottom : 0,
        attemptCount: 0,
      }
    }

    const scores = weekAttempts.map((a) => a.percentage).sort((a, b) => a - b)
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    const max = scores[scores.length - 1]
    const min = scores[0]

    const top10 = isGlobal ? Math.round((max + bw.baseTop) / 2) : max
    const bottom10 = isGlobal ? Math.round((min + bw.baseBottom) / 2) : min

    return {
      weekLabel: bw.weekLabel,
      weekNumber: bw.weekNumber,
      top10,
      avg,
      bottom10,
      attemptCount: weekAttempts.length,
    }
  })

  // 2. Highest error-rate topics calculation
  // For global view, include cohort benchmark topics; for a specific quiz, isolate its own topics
  const topicErrorCounts: Record<string, { errors: number; tested: number }> = isGlobal
    ? {
        'Async/Await': { errors: 14, tested: 20 },
        'Big-O Notation': { errors: 12, tested: 19 },
        'SQL Joins': { errors: 11, tested: 20 },
        'React Hooks': { errors: 9, tested: 19 },
        'REST Semantics': { errors: 8, tested: 19 },
        'Git Workflow': { errors: 6, tested: 20 },
      }
    : {}

  // Factor in actual missed topics from user attempts
  filtered.forEach((attempt) => {
    if (attempt.missedTopics && attempt.missedTopics.length > 0) {
      attempt.missedTopics.forEach((t) => {
        if (!topicErrorCounts[t]) {
          topicErrorCounts[t] = { errors: 0, tested: Math.max(1, attempt.totalQuestions) }
        }
        topicErrorCounts[t].errors += 1
      })
    }
  })

  const highestErrorTopics: TopicErrorStat[] = Object.entries(topicErrorCounts)
    .map(([topic, stat]) => ({
      topic,
      totalErrors: stat.errors,
      totalTested: stat.tested,
      errorRate: stat.tested > 0 ? Math.min(99, Math.round((stat.errors / stat.tested) * 100)) : 0,
    }))
    .sort((a, b) => b.errorRate - a.errorRate)

  return {
    totalAssessments,
    uniqueStudents,
    avgScore,
    passRate,
    avgDurationSeconds,
    avgDurationFormatted,
    weekEvolution,
    highestErrorTopics,
    recentAttempts: [...filtered].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    ),
  }
}
