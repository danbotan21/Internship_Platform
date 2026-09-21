import { useEffect, useState } from 'react'
import { ArrowLeft, Bookmark, Trash2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Topbar from '../components/Topbar'
import FluidBackground from '../components/FluidBackground'
import {
  addResourceFavorite,
  deleteResource,
  getResource,
  getUserRole,
  removeResourceFavorite,
  type Resource,
} from '../api/resources'

export default function ResourceDetails() {
  const { resourceSlug } = useParams()
  const [resource, setResource] = useState<Resource | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const userRole = getUserRole()
  const canDeleteResources = ['Mentor', 'Admin', 'Administrator'].includes(userRole)

  useEffect(() => {
    if (!resourceSlug) return

    getResource(resourceSlug)
      .then(setResource)
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load this resource.')
      })
      .finally(() => setIsLoading(false))
  }, [resourceSlug])

  const toggleFavorite = async () => {
    if (!resource) return

    const nextIsFavorite = !resource.isFavorite
    setResource({ ...resource, isFavorite: nextIsFavorite })

    try {
      if (nextIsFavorite) {
        await addResourceFavorite(resource.id)
      } else {
        await removeResourceFavorite(resource.id)
      }

    } catch (requestError: unknown) {
      setResource({ ...resource, isFavorite: resource.isFavorite })
      setError(requestError instanceof Error ? requestError.message : 'Unable to update favorites.')
    }
  }

  const handleDelete = async () => {
    if (!resource || !window.confirm(`Delete "${resource.title}"?`)) return

    setIsDeleting(true)
    setError(null)
    try {
      await deleteResource(resource.id)
      window.location.assign('/resources')
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete this resource.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="-m-8">
      <Topbar />
      <section className="min-h-[calc(100vh-6rem)] bg-[#f7f9f8] px-6 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Link to="/resources" className="inline-flex items-center gap-2 text-xs font-medium text-[#527467] hover:text-[#164c3a]">
            <ArrowLeft className="h-4 w-4" /> Back to resources
          </Link>

          {isLoading && <p className="mt-8 text-sm text-[#82908b]">Loading resource...</p>}
          {error && <p className="mt-6 rounded-lg bg-[#fff4df] px-4 py-3 text-xs text-[#9a6a18]">{error}</p>}

          {!isLoading && !resource && (
            <h1 className="mt-8 text-2xl font-semibold text-[#18352a]">Resource not found</h1>
          )}

          {resource && (
            <article className="mt-5 overflow-hidden rounded-xl border border-[#dfe6e2] bg-white shadow-sm">
              <div className="resource-detail-shader flex items-end p-6">
                <FluidBackground
                  key={resource.id}
                  variant={
                    resource.type.toLowerCase() === 'template'
                      ? 'template'
                      : resource.type.toLowerCase() === 'policies'
                        ? 'policy'
                        : 'guide'
                  }
                />
                <img src="/logo.svg" alt="" className="absolute right-6 top-6 z-10 h-16 w-16 opacity-90" />
                <div className="relative z-10">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75">
                    {resource.type} · {resource.format}
                  </span>
                  <h1 className="mt-2 text-3xl font-semibold text-white">{resource.title}</h1>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1ee] pb-5">
                  <div>
                    <p className="text-sm text-[#52665d]">{resource.description}</p>
                    <p className="mt-2 text-xs text-[#82908b]">
                      {resource.owner} · Updated {new Date(resource.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleFavorite()}
                      aria-pressed={resource.isFavorite}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#e9f3ee] px-3 py-2 text-xs font-medium text-[#164c3a]"
                    >
                      <Bookmark className={`h-4 w-4 ${resource.isFavorite ? 'fill-[#164c3a]' : ''}`} />
                      {resource.isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                    </button>
                    {canDeleteResources && (
                      <button
                        type="button"
                        onClick={() => void handleDelete()}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#fff0ef] px-3 py-2 text-xs font-medium text-[#a13b35] disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                        {isDeleting ? 'Deleting...' : 'Delete guide'}
                      </button>
                    )}
                  </div>
                </div>

                <div
                  className="prose prose-sm mt-6 max-w-none text-[#52665d]"
                  dangerouslySetInnerHTML={{ __html: resource.contentHtml }}
                />
              </div>
            </article>
          )}
        </div>
      </section>
    </div>
  )
}
