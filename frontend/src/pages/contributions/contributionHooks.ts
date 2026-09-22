import { useCallback, useEffect, useRef, useState } from 'react'

function messageOf(reason: unknown) {
  return reason instanceof Error ? reason.message : 'The contribution service is unavailable.'
}

// Loads data whenever `key` changes and lets the page replace it after actions.
export function useLoadedData<T>(load: () => Promise<T>, key: string) {
  const loadRef = useRef(load)
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    loadRef.current = load
  })

  useEffect(() => {
    let active = true
    loadRef.current()
      .then((result) => {
        if (!active) return
        setData(result)
        setError('')
      })
      .catch((reason: unknown) => {
        if (active) setError(messageOf(reason))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [key, version])

  const reload = useCallback(() => {
    setLoading(true)
    setVersion((current) => current + 1)
  }, [])

  return { data, setData, error, loading, reload }
}

// Runs one API action at a time and keeps its error for display.
export function useAction() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const run = useCallback(async <T>(action: () => Promise<T>): Promise<T | null> => {
    setBusy(true)
    setError('')
    try {
      return await action()
    } catch (reason) {
      setError(messageOf(reason))
      return null
    } finally {
      setBusy(false)
    }
  }, [])

  return { busy, error, setError, run }
}
