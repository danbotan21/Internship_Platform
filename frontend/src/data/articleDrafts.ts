export type ArticleDraft = {
  id: string
  title: string
  content: string
  category: string
  updatedAt: string
}

const storageKey = 'internflow-article-drafts'

export function getArticleDrafts() {
  if (typeof window === 'undefined') return []

  const storedDrafts = window.localStorage.getItem(storageKey)
  return storedDrafts ? (JSON.parse(storedDrafts) as ArticleDraft[]) : []
}

export function saveArticleDraft(draft: ArticleDraft) {
  const drafts = getArticleDrafts().filter((currentDraft) => currentDraft.id !== draft.id)
  window.localStorage.setItem(storageKey, JSON.stringify([draft, ...drafts]))
}
