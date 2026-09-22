import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Returns the current URL search params and a function that patches them.
 * An empty value removes the key; by default the page number resets, because
 * changing a filter or tab should always start from the first page.
 */
export function useSearchParamsUpdater() {
  const [searchParams, setSearchParams] = useSearchParams()

  const updateParams = useCallback(
    (changes: Record<string, string | undefined>, resetPage = true) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          for (const [key, value] of Object.entries(changes)) {
            if (value) {
              next.set(key, value)
            } else {
              next.delete(key)
            }
          }
          if (resetPage) {
            next.delete('page')
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return [searchParams, updateParams] as const
}
