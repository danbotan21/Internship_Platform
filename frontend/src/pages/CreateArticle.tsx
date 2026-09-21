import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ImagePlus, Link as LinkIcon, List, ListOrdered } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Topbar from '../components/Topbar'
import { createResource, getResources, getUserRole, updateResource, type Resource } from '../api/resources'

export default function CreateArticle() {
  const canCreateResources = ['Mentor', 'Admin', 'Administrator'].includes(getUserRole())
  const [searchParams] = useSearchParams()
  const draftId = searchParams.get('draft')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Guides and learning')
  const [tags, setTags] = useState('')
  const [targetGroup, setTargetGroup] = useState('')
  const [characterCount, setCharacterCount] = useState(0)
  const [draftSaved, setDraftSaved] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [draft, setDraft] = useState<Resource | null>(null)
  const navigate = useNavigate()
  const editorRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const savedSelectionRef = useRef<Range | null>(null)

  useEffect(() => {
    if (!canCreateResources) navigate('/resources', { replace: true })
  }, [canCreateResources, navigate])

  useEffect(() => {
    if (!draftId || !editorRef.current) return

    getResources({ mine: true, drafts: true })
      .then((drafts) => {
        const currentDraft = drafts.find((item) => item.id === draftId)
        if (!currentDraft || !editorRef.current) return
        setDraft(currentDraft)
        setTitle(currentDraft.title)
        setCategory(currentDraft.category)
        setTags(currentDraft.tags.join(', '))
        editorRef.current.innerHTML = currentDraft.contentHtml
        setCharacterCount(editorRef.current.textContent?.length ?? 0)
      })
      .catch((requestError: unknown) => {
        setPublishError(requestError instanceof Error ? requestError.message : 'Unable to load the draft.')
      })
  }, [draftId])

  const saveEditorSelection = () => {
    const selection = window.getSelection()
    const editor = editorRef.current

    if (!selection || !editor || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    if (editor.contains(range.commonAncestorContainer)) {
      savedSelectionRef.current = range.cloneRange()
    }
  }

  const handleEditorInput = (event: React.FormEvent<HTMLDivElement>) => {
    const editor = event.currentTarget
    setCharacterCount(editor.textContent?.length ?? 0)
    saveEditorSelection()
  }

  const runEditorCommand = (command: string, value?: string) => {
    const editor = editorRef.current
    if (!editor) return

    editor.focus()
    const selection = window.getSelection()
    if (savedSelectionRef.current && selection) {
      selection.removeAllRanges()
      selection.addRange(savedSelectionRef.current)
    }

    document.execCommand(command, false, value)
    setCharacterCount(editor.textContent?.length ?? 0)
    saveEditorSelection()
  }

  const preserveSelection = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    saveEditorSelection()
  }

  const addLink = () => {
    const url = window.prompt('Enter a URL')
    if (url) runEditorCommand('createLink', url)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    const editor = editorRef.current

    if (!file || !editor) return

    const imageUrl = URL.createObjectURL(file)
    editor.focus()

    const selection = window.getSelection()
    if (savedSelectionRef.current && selection) {
      selection.removeAllRanges()
      selection.addRange(savedSelectionRef.current)
    }

    const range = savedSelectionRef.current ?? document.createRange()
    if (!savedSelectionRef.current) range.selectNodeContents(editor)
    range.deleteContents()

    const image = document.createElement('img')
    image.src = imageUrl
    image.alt = file.name.replace(/\.[^/.]+$/, '')
    image.className = 'my-4 max-h-80 max-w-full rounded-lg object-contain'
    range.insertNode(image)

    const paragraph = document.createElement('p')
    paragraph.innerHTML = '<br>'
    image.parentNode?.insertBefore(paragraph, image.nextSibling)

    const nextRange = document.createRange()
    nextRange.selectNodeContents(paragraph)
    nextRange.collapse(true)
    selection?.removeAllRanges()
    selection?.addRange(nextRange)
    savedSelectionRef.current = nextRange.cloneRange()

    setCharacterCount(editor.textContent?.length ?? 0)
    event.target.value = ''
  }

  const getResourceRequest = (isDraft: boolean) => ({
    title: title.trim() || 'Untitled draft',
    description: editorRef.current?.textContent?.trim().slice(0, 240) ?? '',
    contentHtml: editorRef.current?.innerHTML ?? '',
    type: category === 'Templates' ? 'Template' : category === 'Policies' ? 'Policies' : 'Guide',
    format: 'Article',
    category,
    owner: 'Programme team',
    mentorName: '',
    tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    targetGroup: targetGroup || null,
    isDraft,
  })

  const handleSaveDraft = async () => {
    setPublishError(null)
    try {
      const savedResource = draft
        ? await updateResource(draft.id, getResourceRequest(true))
        : await createResource(getResourceRequest(true))
      setDraft(savedResource)
      setDraftSaved(true)
      navigate('/resources')
    } catch (requestError: unknown) {
      setPublishError(requestError instanceof Error ? requestError.message : 'Unable to save the draft.')
    }
  }

  const handlePublish = async () => {
    const contentHtml = editorRef.current?.innerHTML ?? ''
    if (!title.trim()) {
      setPublishError('Article title is required.')
      return
    }

    setIsPublishing(true)
    setPublishError(null)

    try {
      const resource = draft
        ? await updateResource(draft.id, getResourceRequest(false))
        : await createResource({ ...getResourceRequest(false), contentHtml })
      navigate(`/resources/${resource.slug}`)
    } catch (requestError: unknown) {
      setPublishError(requestError instanceof Error ? requestError.message : 'Unable to publish the article.')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="-m-8">
      <Topbar />
      <section className="min-h-[calc(100vh-6rem)] bg-[#f7f9f8] px-6 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#527467] transition-colors hover:text-[#164c3a]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to resources
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#18352a]">Create article</h1>
              <p className="mt-1 text-xs text-[#82908b]">Add useful content to the resource library for students and mentors.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={handleSaveDraft} className="h-9 rounded-lg border border-[#dfe6e2] bg-white px-4 text-xs font-medium text-[#18352a] hover:bg-[#edf3ef]">
                {draftSaved ? 'Draft saved' : 'Save draft'}
              </button>
              <button
                type="button"
                onClick={() => void handlePublish()}
                disabled={isPublishing}
                className="h-9 rounded-lg bg-[#164c3a] px-4 text-xs font-medium text-white hover:bg-[#0f3d2e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPublishing ? 'Publishing...' : 'Publish article'}
              </button>
            </div>
          </div>

          {publishError && <p className="mt-4 rounded-lg bg-[#fff4df] px-4 py-3 text-xs text-[#9a6a18]">{publishError}</p>}

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(250px,0.9fr)]">
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-[#18352a]">Article details</h2>
              <p className="mt-1 text-xs text-[#82908b]">Give your article a clear title and structure the main story.</p>

              <label className="mt-5 block text-xs font-semibold text-[#18352a]">
                Article title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter a descriptive article title"
                  className="mt-2 h-9 w-full rounded-lg border border-[#dfe6e2] px-3 text-xs font-normal text-[#18352a] outline-none focus:border-[#164c3a]"
                />
              </label>

              <label className="mt-5 block text-xs font-semibold text-[#18352a]">
                Article content
                <div className="mt-2 overflow-hidden rounded-lg border border-[#dfe6e2]">
                  <div className="flex flex-wrap gap-1 border-b border-[#dfe6e2] bg-[#f1f4f2] p-1.5">
                    <button
                      type="button"
                      onMouseDown={preserveSelection}
                      onClick={() => runEditorCommand('formatBlock', 'p')}
                      className="rounded bg-white px-2 py-1 text-[10px] text-[#18352a] hover:bg-[#e9f3ee]"
                    >
                      Paragraph
                    </button>
                    <button
                      type="button"
                      aria-label="Bold"
                      onMouseDown={preserveSelection}
                      onClick={() => runEditorCommand('bold')}
                      className="rounded bg-white px-2 py-1 text-[10px] font-bold text-[#18352a] hover:bg-[#e9f3ee]"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      aria-label="Italic"
                      onMouseDown={preserveSelection}
                      onClick={() => runEditorCommand('italic')}
                      className="rounded bg-white px-2 py-1 text-[10px] italic text-[#18352a] hover:bg-[#e9f3ee]"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      aria-label="Underline"
                      onMouseDown={preserveSelection}
                      onClick={() => runEditorCommand('underline')}
                      className="rounded bg-white px-2 py-1 text-[10px] underline text-[#18352a] hover:bg-[#e9f3ee]"
                    >
                      U
                    </button>
                    <button
                      type="button"
                      aria-label="Bulleted list"
                      onMouseDown={preserveSelection}
                      onClick={() => runEditorCommand('insertUnorderedList')}
                      className="rounded bg-white p-1.5 text-[#18352a] hover:bg-[#e9f3ee]"
                    >
                      <List className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      aria-label="Numbered list"
                      onMouseDown={preserveSelection}
                      onClick={() => runEditorCommand('insertOrderedList')}
                      className="rounded bg-white p-1.5 text-[#18352a] hover:bg-[#e9f3ee]"
                    >
                      <ListOrdered className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      aria-label="Add link"
                      onMouseDown={preserveSelection}
                      onClick={addLink}
                      className="rounded bg-white p-1.5 text-[#18352a] hover:bg-[#e9f3ee]"
                    >
                      <LinkIcon className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      aria-label="Insert image"
                      onMouseDown={preserveSelection}
                      onClick={() => imageInputRef.current?.click()}
                      className="rounded bg-white p-1.5 text-[#18352a] hover:bg-[#e9f3ee]"
                    >
                      <ImagePlus className="h-3 w-3" />
                    </button>
                  </div>
                  <div
                    ref={editorRef}
                    contentEditable
                    role="textbox"
                    aria-label="Article content"
                    data-placeholder="Start writing your article..."
                    onInput={handleEditorInput}
                    onKeyUp={saveEditorSelection}
                    onMouseUp={saveEditorSelection}
                    onBlur={saveEditorSelection}
                    className="article-editor min-h-80 p-3 text-xs font-normal text-[#18352a] outline-none"
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="px-3 pb-2 text-right text-[9px] font-normal text-[#82908b]">{characterCount} characters</p>
                </div>
              </label>
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-[#18352a]">Publishing details</h2>
                <label className="mt-4 block text-xs font-semibold text-[#18352a]">
                  Category
                  <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 h-9 w-full rounded-lg border border-[#dfe6e2] bg-white px-3 text-xs font-normal text-[#52665d] outline-none">
                    <option>Guides and learning</option>
                    <option>Templates</option>
                    <option>Policies</option>
                  </select>
                </label>
                <label className="mt-4 block text-xs font-semibold text-[#18352a]">
                  Target group
                  <select
                    value={targetGroup}
                    onChange={(event) => setTargetGroup(event.target.value)}
                    className="mt-2 h-9 w-full rounded-lg border border-[#dfe6e2] bg-white px-3 text-xs font-normal text-[#52665d] outline-none"
                  >
                    <option value="">All users</option>
                    <option value="Frontend group">Frontend group</option>
                    <option value="Backend group">Backend group</option>
                    <option value="QA group">QA group</option>
                  </select>
                </label>
                <label className="mt-4 block text-xs font-semibold text-[#18352a]">
                  Tags
                  <input
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="Guide, Internship"
                    className="mt-2 h-9 w-full rounded-lg border border-[#dfe6e2] px-3 text-xs font-normal text-[#18352a] outline-none focus:border-[#164c3a]"
                  />
                </label>
                <p className="mt-4 rounded-lg bg-[#f1f4f2] px-3 py-2 text-[10px] text-[#82908b]">Drafts remain private until you publish the article.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}