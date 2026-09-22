const storageKey = 'internflow-resource-favorites'

export function getFavoriteResourceSlugs(defaultSlugs: string[] = []) {
  if (typeof window === 'undefined') {
    return defaultSlugs
  }

  const storedSlugs = window.localStorage.getItem(storageKey)
  return storedSlugs ? (JSON.parse(storedSlugs) as string[]) : defaultSlugs
}

export function saveFavoriteResourceSlugs(slugs: Set<string>) {
  window.localStorage.setItem(storageKey, JSON.stringify([...slugs]))
}