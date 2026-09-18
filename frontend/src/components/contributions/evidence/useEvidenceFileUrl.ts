import { useEffect, useState } from 'react'
import { contributionApi } from '../../../api/contributions'

// Evidence files are protected: they are fetched with the user's identity and
// shown through a temporary object URL instead of a public link.
export function useEvidenceFileUrl(url: string) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    let created: string | null = null
    contributionApi
      .downloadFile(url)
      .then((blob) => {
        if (!active) return
        created = URL.createObjectURL(blob)
        setObjectUrl(created)
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'File unavailable.')
      })
    return () => {
      active = false
      if (created) URL.revokeObjectURL(created)
    }
  }, [url])

  return { objectUrl, error }
}
