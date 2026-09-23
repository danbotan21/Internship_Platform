export interface QuizRequirement {
  id: string // slug or uuid
  quizId: string
  quizTitle: string
  minScore: number
}

const QUIZ_PREFIX = '[QUIZ:'

export function formatQuizRequirement(quizId: string, minScore: number, quizTitle: string): string {
  return `${QUIZ_PREFIX}${quizId}:${minScore}:${quizTitle}]`
}

export function isQuizRequirement(req: string): boolean {
  return typeof req === 'string' && req.startsWith(QUIZ_PREFIX) && req.endsWith(']')
}

export function parseQuizRequirement(req: string): QuizRequirement | null {
  if (!isQuizRequirement(req)) return null
  try {
    // Format: [QUIZ:slugOrId:minScore:Quiz Title]
    const inner = req.slice(QUIZ_PREFIX.length, -1)
    const firstColon = inner.indexOf(':')
    if (firstColon === -1) return null

    const quizId = inner.slice(0, firstColon)
    const rest = inner.slice(firstColon + 1)
    const secondColon = rest.indexOf(':')
    if (secondColon === -1) return null

    const minScoreStr = rest.slice(0, secondColon)
    const quizTitle = rest.slice(secondColon + 1)
    const minScore = parseInt(minScoreStr, 10) || 70

    return {
      id: quizId,
      quizId,
      quizTitle: quizTitle || quizId,
      minScore,
    }
  } catch {
    return null
  }
}

export function splitRequirements(requirements: string[] = []): {
  textRequirements: string[]
  quizRequirements: QuizRequirement[]
} {
  const textRequirements: string[] = []
  const quizRequirements: QuizRequirement[] = []

  requirements.forEach((req) => {
    const parsed = parseQuizRequirement(req)
    if (parsed) {
      quizRequirements.push(parsed)
    } else if (req && req.trim()) {
      textRequirements.push(req.trim())
    }
  })

  return { textRequirements, quizRequirements }
}

export function combineRequirements(
  textRequirements: string[],
  quizRequirements: QuizRequirement[]
): string[] {
  const formattedQuizzes = quizRequirements.map((q) =>
    formatQuizRequirement(q.quizId, q.minScore, q.quizTitle)
  )
  return [...textRequirements, ...formattedQuizzes]
}
