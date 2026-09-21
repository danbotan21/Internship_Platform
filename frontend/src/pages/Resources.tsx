import { useEffect, useMemo, useState } from 'react'
import { Bookmark, ChevronDown, Plus, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Topbar from '../components/Topbar'
import FluidBackground from '../components/FluidBackground'
import {
  addResourceFavorite,
  getResources,
  removeResourceFavorite,
  getUserRole,
  type Resource,
} from '../api/resources'

export default function Resources() {
  return (
    <div className="-m-8">
      <Topbar />
      <ResourceLibrary />
    </div>
  )
}

function ResourceLibrary() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All resources')
  const [category, setCategory] = useState('All')
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [sort, setSort] = useState('Newest first')
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canCreateResources = ['Mentor', 'Admin', 'Administrator'].includes(getUserRole())

  useEffect(() => {
    let isMounted = true

    getResources({
      mine: activeTab === 'My documents' || activeTab === 'Drafts' ? true : undefined,
      favorites: activeTab === 'Favorites' ? true : undefined,
      drafts: activeTab === 'Drafts' ? true : activeTab === 'All resources' || activeTab === 'Favorites' || activeTab === 'My documents' ? false : undefined,
    })
      .then((items) => {
        if (isMounted) setResources(items)
      })
      .catch((requestError: unknown) => {
        if (isMounted) setError(requestError instanceof Error ? requestError.message : 'Unable to load resources.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [activeTab])

  const toggleFavorite = async (resource: Resource) => {
    const nextIsFavorite = !resource.isFavorite
    setResources((currentResources) =>
      currentResources.map((currentResource) =>
        currentResource.id === resource.id ? { ...currentResource, isFavorite: nextIsFavorite } : currentResource,
      ),
    )

    try {
      if (nextIsFavorite) {
        await addResourceFavorite(resource.id)
      } else {
        await removeResourceFavorite(resource.id)
      }
    } catch (requestError: unknown) {
      setResources((currentResources) =>
        currentResources.map((currentResource) =>
          currentResource.id === resource.id ? { ...currentResource, isFavorite: resource.isFavorite } : currentResource,
        ),
      )
      setError(requestError instanceof Error ? requestError.message : 'Unable to update favorites.')
    }
  }

  const filteredResources = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const visibleResources = resources.filter((resource) => {
      const matchesSearch = [resource.title, resource.description, resource.type]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)
      const matchesTab =
        activeTab === 'All resources' ||
        activeTab === 'My documents' ||
        (activeTab === 'Favorites' && resource.isFavorite)
      const matchesCategory = category === 'All' || resource.type === category

      return matchesSearch && matchesTab && matchesCategory
    })

    return [...visibleResources].sort((first, second) => {
      const difference = new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
      return sort === 'Newest first' ? difference : -difference
    })
  }, [activeTab, category, resources, search, sort])

  return (
    <section className="min-h-[calc(100vh-6rem)] bg-[#f7f9f8] px-6 py-8 sm:px-8">
      <div className="max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight text-[#18352a]">Resource library</h1>
        <p className="mt-1 text-xs text-[#82908b]">Guides, templates and learning materials for your internship.</p>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-lg bg-[#e5e7e6] px-4 text-[#71817a]">
            <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search resources..."
              aria-label="Search resources"
              className="min-w-0 flex-1 bg-transparent text-xs text-[#18352a] outline-none placeholder:text-[#71817a]"
            />
          </label>

          <div className="relative w-full lg:w-44">
            <button
              type="button"
              onClick={() => setIsCategoryOpen((isOpen) => !isOpen)}
              aria-label="Filter by category"
              aria-expanded={isCategoryOpen}
              aria-haspopup="listbox"
              className="flex h-10 w-full items-center justify-between rounded-lg bg-white px-4 text-left text-xs text-[#71817a] outline-none"
            >
              <span>Category: {category}</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#71817a]" />
            </button>
            {isCategoryOpen && (
              <div className="absolute left-0 right-0 top-12 z-20 overflow-hidden rounded-lg border border-[#dfe6e2] bg-white p-1 shadow-lg" role="listbox" aria-label="Resource categories">
                {['All', 'Guide', 'Template', 'Policies'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={category === option}
                    onClick={() => {
                      setCategory(option)
                      setIsCategoryOpen(false)
                    }}
                    className={`w-full rounded-md px-3 py-2 text-left text-xs transition-colors ${
                      category === option
                        ? 'bg-[#e9f3ee] font-medium text-[#164c3a]'
                        : 'text-[#71817a] hover:bg-[#f1f4f2]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-full lg:w-44">
            <button
              type="button"
              onClick={() => setIsSortOpen((isOpen) => !isOpen)}
              aria-label="Sort resources"
              aria-expanded={isSortOpen}
              aria-haspopup="listbox"
              className="flex h-10 w-full items-center justify-between rounded-lg bg-white px-4 text-left text-xs text-[#71817a] outline-none"
            >
              <span>{sort}</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#71817a]" />
            </button>
            {isSortOpen && (
              <div className="absolute left-0 right-0 top-12 z-20 overflow-hidden rounded-lg border border-[#dfe6e2] bg-white p-1 shadow-lg" role="listbox" aria-label="Sort resources">
                {['Newest first', 'Oldest first'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={sort === option}
                    onClick={() => {
                      setSort(option)
                      setIsSortOpen(false)
                    }}
                    className={`w-full rounded-md px-3 py-2 text-left text-xs transition-colors ${
                      sort === option
                        ? 'bg-[#e9f3ee] font-medium text-[#164c3a]'
                        : 'text-[#71817a] hover:bg-[#f1f4f2]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {['All resources', 'Favorites', 'My documents', 'Drafts'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`h-9 rounded-lg px-8 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-[#164c3a] text-white'
                  : 'bg-white text-[#71817a] hover:bg-[#edf3ef]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {canCreateResources && (
          <Link
            to="/resources/create"
            className="mt-4 flex h-9 w-36 items-center justify-center gap-3 rounded-lg bg-white text-xs font-medium text-[#71817a] transition-colors hover:bg-[#edf3ef]"
          >
            <span>Create</span>
            <Plus className="h-3.5 w-3.5 text-[#164c3a]" strokeWidth={2} />
          </Link>
        )}

        {error && <p className="mt-6 rounded-lg bg-[#fff4df] px-4 py-3 text-xs text-[#9a6a18]">{error}</p>}
        {isLoading && <p className="mt-8 text-sm text-[#82908b]">Loading resources...</p>}

        {!isLoading && activeTab === 'Drafts' ? (
          <div className="mt-8 grid grid-cols-1 gap-5">
            {filteredResources.map((draft) => (
              <article key={draft.id} className="group relative isolate mx-auto flex h-[360px] w-full max-w-4xl overflow-hidden rounded-xl border border-white/20 bg-[#10201b] shadow-lg transition duration-300 hover:border-white/50 hover:shadow-2xl">
                  <FluidBackground
                    variant={
                      draft.type.toLowerCase() === 'template'
                        ? 'template'
                        : draft.type.toLowerCase() === 'policies'
                          ? 'policy'
                          : 'guide'
                    }
                  />
                <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/75 via-black/10 to-black/10" />
                <img src="/logo.svg" alt="" className="absolute right-5 top-5 z-10 h-12 w-12 opacity-90" />
                <div className="relative z-10 flex h-full w-full flex-col p-5">
                  <span className="w-fit rounded-full border border-white/30 bg-black/20 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">Draft article</span>
                  <div className="mt-auto">
                    <h2 className="max-w-[85%] text-2xl font-semibold leading-tight text-white drop-shadow-sm">{draft.title}</h2>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="rounded-md bg-white/15 px-2.5 py-1 text-[10px] text-white backdrop-blur-sm">{draft.category}</span>
                      <span className="rounded-full bg-[#fff4df]/90 px-2 py-1 text-[9px] font-medium text-[#9a6a18]">Draft</span>
                    </div>
                    <p className="mt-3 text-xs text-white/70">Last edited {new Date(draft.updatedAt).toLocaleDateString()}</p>
                    <Link to={`/resources/create?draft=${encodeURIComponent(draft.id)}`} className="mt-4 flex h-9 items-center justify-center rounded-lg bg-white/90 text-xs font-medium text-[#164c3a] transition hover:bg-white">
                      Continue editing
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : !isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-5">
          {filteredResources.map((resource) => (
            <article
              key={resource.title}
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/resources/${resource.slug}`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  navigate(`/resources/${resource.slug}`)
                }
              }}
              className="group relative isolate mx-auto flex h-[360px] w-full max-w-4xl cursor-pointer overflow-hidden rounded-xl border border-white/20 bg-[#10201b] shadow-lg transition duration-300 hover:border-white/50 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#164c3a]"
            >
              <FluidBackground
                variant={
                  resource.type.toLowerCase() === 'template'
                    ? 'template'
                    : resource.type.toLowerCase() === 'policies'
                      ? 'policy'
                      : 'guide'
                }
              />
              <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
              <img src="/logo.svg" alt="" className="absolute right-5 top-5 z-10 h-12 w-12 opacity-90" />
              <div className="relative z-10 flex h-full w-full flex-col p-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <span className="w-fit rounded-full border border-white/30 bg-black/20 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">{resource.type}</span>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      void toggleFavorite(resource)
                    }}
                    onMouseDown={(event) => event.stopPropagation()}
                    aria-label={`${resource.isFavorite ? 'Remove' : 'Add'} ${resource.title} ${
                      resource.isFavorite ? 'from' : 'to'
                    } favorites`}
                    aria-pressed={resource.isFavorite}
                    className="absolute right-5 top-20 rounded-full border border-white/30 bg-black/20 p-2 text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70"
                  >
                    <Bookmark className={`h-4 w-4 ${resource.isFavorite ? 'fill-white' : ''}`} strokeWidth={2.5} />
                  </button>
                </div>
                <div className="mt-auto">
                  <h2 className="max-w-[85%] text-2xl font-semibold leading-tight text-white drop-shadow-sm">{resource.title}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-5 text-white/75">{resource.description}</p>
                  <div className="mt-4 flex min-w-0 flex-wrap items-center gap-2 text-[10px] text-white/75">
                    {resource.tags.map((tag) => (
                      <span key={tag} className="rounded-md border border-white/25 bg-white/10 px-2.5 py-1 backdrop-blur-sm">{tag}</span>
                    ))}
                  </div>
                  <div className="mt-3 flex min-w-0 items-center justify-between gap-3 text-[10px] text-white/60">
                    <span className="min-w-0 truncate">{resource.owner} · Updated {new Date(resource.updatedAt).toLocaleDateString()}</span>
                    <span className="max-w-[180px] shrink-0 truncate rounded-full bg-white/15 px-3 py-2 text-xs text-white backdrop-blur-sm">{resource.mentorName}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        ) : null}

        {!isLoading && filteredResources.length === 0 && (
          <p className="mt-8 text-sm text-[#82908b]">No resources match your filters.</p>
        )}
      </div>
    </section>
  )
}
