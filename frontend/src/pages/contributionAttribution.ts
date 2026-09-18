import type { Collaborator, Contribution } from '../types/contribution'

// Temporary client-side persistence for the React-only phase. The next backend
// step should replace this store with the collaborator/attribution API fields.
const storageKey = 'internflow.contribution-attribution.v1'

export type AttributionStore = Record<string, Collaborator[]>

export function readAttributionStore(): AttributionStore {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }
    return parsed as AttributionStore
  } catch {
    return {}
  }
}

export function writeAttributionStore(store: AttributionStore) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(storageKey, JSON.stringify(store))
}

export function withAttribution(
  item: Contribution,
  store: AttributionStore,
): Contribution {
  return {
    ...item,
    collaborators: store[item.id] ?? item.collaborators ?? [],
  }
}

export function createCollaboratorId() {
  return crypto.randomUUID?.() ?? `collaborator-${Date.now()}`
}
