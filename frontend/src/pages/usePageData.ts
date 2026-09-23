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

export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'failed'

// Saves `value` shortly after it stops changing, one request at a time.
// `save` resolves when the value is stored and throws when it is rejected.
// `flush` lets a manual action wait until nothing is being saved anymore.
export function useAutosave<T>(value: T, enabled: boolean, save: (value: T) => Promise<void>, delay = 1200) {
  const saveRef = useRef(save)
  const timer = useRef<number | undefined>(undefined)
  const inFlight = useRef<Promise<void> | null>(null)
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    saveRef.current = save
  })

  const persist = useCallback(async (snapshot: T) => {
    while (inFlight.current) await inFlight.current
    setStatus('saving')
    const request = saveRef.current(snapshot)
    inFlight.current = request.then(
      () => undefined,
      () => undefined,
    )
    try {
      await request
      setStatus('saved')
      setError('')
    } catch (reason) {
      setStatus('failed')
      setError(messageOf(reason))
    } finally {
      inFlight.current = null
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    timer.current = window.setTimeout(() => {
      timer.current = undefined
      void persist(value)
    }, delay)
    return () => window.clearTimeout(timer.current)
  }, [value, enabled, delay, persist])

  const flush = useCallback(async () => {
    window.clearTimeout(timer.current)
    timer.current = undefined
    while (inFlight.current) await inFlight.current
  }, [])

  return { status: enabled && status !== 'saving' && status !== 'failed' ? 'pending' : status, error, flush }
}
