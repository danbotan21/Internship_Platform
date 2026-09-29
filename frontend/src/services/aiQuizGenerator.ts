export interface GenerateQuizParams {
  apiKey?: string
  topic: string
  category: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  questionCount: number
  instructions?: string
}

export interface GeneratedOption {
  id: string
  label: 'A' | 'B' | 'C' | 'D'
  text: string
  isCorrect: boolean
  feedback: string
}

export interface GeneratedQuestion {
  id: string
  numberLabel: string
  category: string
  question: string
  hint: string
  options: GeneratedOption[]
}

export interface GeneratedQuizResult {
  title: string
  description: string
  category: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  durationMinutes: number
  passingScore: number
  questions: GeneratedQuestion[]
}

const STORAGE_KEY_GEMINI_KEY = 'internflow_gemini_api_key'

export function getGeminiApiKey(): string {
  const envKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim()
  if (envKey) return envKey
  try {
    return localStorage.getItem(STORAGE_KEY_GEMINI_KEY)?.trim() || ''
  } catch {
    return ''
  }
}

export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey())
}

export function getStoredGeminiKey(): string {
  return getGeminiApiKey()
}

export function saveStoredGeminiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY_GEMINI_KEY, key.trim())
    } else {
      localStorage.removeItem(STORAGE_KEY_GEMINI_KEY)
    }
  } catch {}
}

export async function generateQuizWithGemini(
  params: GenerateQuizParams
): Promise<GeneratedQuizResult> {
  const cleanKey = (params.apiKey || getGeminiApiKey()).trim()
  if (!cleanKey) {
    throw new Error(
      'Gemini API Key is not configured. Please set VITE_GEMINI_API_KEY in frontend/.env and restart the Vite server.'
    )
  }

  const prompt = `You are a principal software engineer and expert technical assessment author creating an internship evaluation quiz.
Topic: ${params.topic}
Category: ${params.category}
Difficulty: ${params.difficulty}
Number of questions: ${params.questionCount}
${params.instructions?.trim() ? `Specific Focus/Instructions: ${params.instructions.trim()}` : ''}

Generate a rigorous, educational, multiple-choice quiz in JSON format following this exact schema:
{
  "title": "A concise, professional quiz title",
  "description": "A 1-2 sentence description summarizing what this assessment evaluates",
  "category": "${params.category}",
  "difficulty": "${params.difficulty}",
  "durationMinutes": ${Math.max(10, params.questionCount * 2)},
  "passingScore": 70,
  "questions": [
    {
      "numberLabel": "Q01",
      "category": "${params.category}",
      "question": "Clear, technically accurate question text presenting a realistic problem or concept",
      "hint": "A helpful, educational hint that clarifies the underlying concept or reasoning without giving away the direct answer",
      "correctOption": "A",
      "options": [
        { "label": "A", "text": "First option text", "feedback": "Explanation of why this is correct or incorrect" },
        { "label": "B", "text": "Second option text", "feedback": "Explanation of why this is correct or incorrect" },
        { "label": "C", "text": "Third option text", "feedback": "Explanation of why this is correct or incorrect" },
        { "label": "D", "text": "Fourth option text", "feedback": "Explanation of why this is correct or incorrect" }
      ]
    }
  ]
}

Important rules:
1. Generate exactly ${params.questionCount} questions.
2. Every question MUST have exactly 4 options with labels "A", "B", "C", and "D".
3. Every question MUST contain an insightful, didactic "hint" to guide the student during practice.
4. "correctOption" MUST be one of "A", "B", "C", or "D".
5. Return ONLY pure valid JSON, with no markdown code fences or preamble.`

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  }

  // Try gemini-2.0-flash first, fallback to gemini-1.5-flash
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash']
  let lastError: Error | null = null

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const msg = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(msg)
      }

      const data = await response.json()
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!rawText) {
        throw new Error('Empty response received from Gemini AI.')
      }

      // Parse JSON (handling any stray formatting)
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
      const parsed = JSON.parse(cleaned)

      if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error('Gemini did not return any questions in the expected format.')
      }

      // Convert questions to internal format
      const questions: GeneratedQuestion[] = parsed.questions.map((q: any, idx: number) => {
        const numLabel = q.numberLabel || `Q${(idx + 1).toString().padStart(2, '0')}`
        const correctLabel = String(q.correctOption || 'A').toUpperCase().trim()

        const options: GeneratedOption[] = (Array.isArray(q.options) ? q.options : []).map(
          (opt: any, oIdx: number) => {
            const label = (opt.label || ['A', 'B', 'C', 'D'][oIdx] || 'A').toUpperCase() as
              | 'A'
              | 'B'
              | 'C'
              | 'D'
            const isCorrect = label === correctLabel
            return {
              id: `opt-${Date.now()}-${idx}-${oIdx}`,
              label,
              text: opt.text || '',
              isCorrect,
              feedback: opt.feedback || '',
            }
          }
        )

        // Ensure at least one option is marked correct
        if (!options.some((o) => o.isCorrect) && options.length > 0) {
          options[0].isCorrect = true
        }

        return {
          id: `q-ai-${Date.now()}-${idx}`,
          numberLabel: numLabel,
          category: q.category || params.category,
          question: q.question || q.questionText || '',
          hint: q.hint || '',
          options,
        }
      })

      // Save valid key for future uses
      saveStoredGeminiKey(cleanKey)

      return {
        title: parsed.title || params.topic,
        description: parsed.description || `Assessment on ${params.topic}`,
        category: parsed.category || params.category,
        difficulty: params.difficulty,
        durationMinutes: Number(parsed.durationMinutes) || Math.max(10, questions.length * 2),
        passingScore: Number(parsed.passingScore) || 70,
        questions,
      }
    } catch (err: any) {
      lastError = err
      // If error is 404 on model name, try next model, otherwise rethrow
      if (err.message && err.message.includes('404')) {
        continue
      }
      throw err
    }
  }

  throw lastError || new Error('Failed to generate quiz with Gemini AI.')
}
