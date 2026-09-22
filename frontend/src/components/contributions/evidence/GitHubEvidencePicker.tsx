import { Check, GitCommitHorizontal, GitPullRequest, Plus, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { contributionApi } from '../../../api/contributions'
import type {
  GitHubCommitOption,
  GitHubPullRequestOption,
  GitHubRepositoryOption,
} from '../../../types/contribution'
import Alert from '../../ui/Alert'
import Button from '../../ui/Button'
import Field from '../../ui/Field'
import Tabs from '../../ui/Tabs'
import { formatDateTime } from '../../ui/formatDateTime'
import { inputBase } from '../../ui/styles'

type GitHubEvidencePickerProps = {
  // GitHub URLs already attached, so they are shown as added.
  attachedUrls: string[]
  onAdd: (url: string) => Promise<boolean>
  preferredBranch?: string
}

type Source = 'commits' | 'pullRequests'

export default function GitHubEvidencePicker({ attachedUrls, onAdd, preferredBranch }: GitHubEvidencePickerProps) {
  const [repositories, setRepositories] = useState<GitHubRepositoryOption[]>([])
  const [repository, setRepository] = useState('')
  const [branch, setBranch] = useState('')
  const [source, setSource] = useState<Source>('commits')
  const [commits, setCommits] = useState<GitHubCommitOption[]>([])
  const [pullRequests, setPullRequests] = useState<GitHubPullRequestOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pastedUrl, setPastedUrl] = useState('')
  const [adding, setAdding] = useState<string | null>(null)

  useEffect(() => {
    contributionApi
      .gitHubRepositories()
      .then((items) => {
        setRepositories(items)
        const first = items[0]
        if (!first) return
        setRepository(first.fullName)
        setBranch(
          preferredBranch && first.branches.includes(preferredBranch) ? preferredBranch : first.defaultBranch,
        )
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'GitHub is unavailable.'))
  }, [preferredBranch])

  const load = useCallback(async () => {
    if (!repository) return
    setLoading(true)
    setError('')
    try {
      if (source === 'commits') {
        if (branch) setCommits(await contributionApi.gitHubCommits(repository, branch))
      } else {
        setPullRequests(await contributionApi.gitHubPullRequests(repository))
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'GitHub is unavailable.')
    } finally {
      setLoading(false)
    }
  }, [repository, branch, source])

  useEffect(() => {
    // Loading GitHub data is the external sync this effect exists for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  const add = async (url: string) => {
    setAdding(url)
    const added = await onAdd(url)
    setAdding(null)
    if (added && url === pastedUrl) setPastedUrl('')
  }

  const selectedRepository = repositories.find((item) => item.fullName === repository)
  const isAttached = (url: string) => attachedUrls.some((attached) => attached.startsWith(url) || url.startsWith(attached))

  return (
    <div className='space-y-4'>
      <div className='grid gap-3 sm:grid-cols-2'>
        <Field label='Team repository' htmlFor='github-repository'>
          <select
            id='github-repository'
            className={inputBase}
            value={repository}
            onChange={(event) => setRepository(event.target.value)}
          >
            {repositories.map((item) => (
              <option key={item.fullName} value={item.fullName}>
                {item.fullName}
              </option>
            ))}
          </select>
        </Field>
        {source === 'commits' ? (
          <Field label='Branch' htmlFor='github-branch'>
            <select
              id='github-branch'
              className={inputBase}
              value={branch}
              onChange={(event) => setBranch(event.target.value)}
            >
              {selectedRepository?.branches.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
      </div>

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Tabs<Source>
          label='GitHub item type'
          value={source}
          onChange={setSource}
          tabs={[
            { value: 'commits', label: 'My commits' },
            { value: 'pullRequests', label: 'My pull requests' },
          ]}
        />
        <Button variant='ghost' size='sm' icon={RefreshCw} onClick={() => void load()} loading={loading}>
          Refresh
        </Button>
      </div>

      {error ? <Alert tone='warning'>{error}</Alert> : null}

      <ul className='max-h-80 divide-y divide-[#eef1ef] overflow-y-auto rounded-xl border border-[#e3e8e5] bg-white'>
        {source === 'commits'
          ? commits.map((commit) => (
              <PickerRow
                key={commit.sha}
                icon={<GitCommitHorizontal className='size-4' aria-hidden='true' />}
                title={commit.message}
                meta={`${commit.sha.slice(0, 7)} · ${formatDateTime(commit.authoredAtUtc)}`}
                attached={isAttached(commit.url)}
                adding={adding === commit.url}
                onAdd={() => void add(commit.url)}
              />
            ))
          : pullRequests.map((pull) => (
              <PickerRow
                key={pull.number}
                icon={<GitPullRequest className='size-4' aria-hidden='true' />}
                title={`#${pull.number} ${pull.title}`}
                meta={`${pull.state} · opened ${formatDateTime(pull.createdAtUtc)}`}
                attached={isAttached(pull.url)}
                adding={adding === pull.url}
                onAdd={() => void add(pull.url)}
              />
            ))}
        {!loading && (source === 'commits' ? commits : pullRequests).length === 0 ? (
          <li className='px-4 py-6 text-center text-[13px] text-[#5d6b64]'>
            {source === 'commits'
              ? 'No commits authored by you on this branch.'
              : 'No pull requests opened by you in this repository.'}
          </li>
        ) : null}
      </ul>

      <div className='rounded-xl bg-[#f7f9f8] p-4'>
        <Field
          label='Or paste a commit / pull request URL'
          htmlFor='github-url'
          hint='Only commits and pull requests of the team repository are accepted.'
        >
          <div className='flex gap-2'>
            <input
              id='github-url'
              className={inputBase}
              value={pastedUrl}
              onChange={(event) => setPastedUrl(event.target.value)}
              placeholder='https://github.com/owner/repo/pull/12'
            />
            <Button
              variant='secondary'
              icon={Plus}
              disabled={!pastedUrl.trim()}
              loading={adding === pastedUrl}
              onClick={() => void add(pastedUrl.trim())}
            >
              Add
            </Button>
          </div>
        </Field>
      </div>
    </div>
  )
}

type PickerRowProps = {
  icon: ReactNode
  title: string
  meta: string
  attached: boolean
  adding: boolean
  onAdd: () => void
}

function PickerRow({ icon, title, meta, attached, adding, onAdd }: PickerRowProps) {
  return (
    <li className='flex items-center gap-3 px-4 py-3'>
      <span className='text-[#5d6b64]'>{icon}</span>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-[13px] font-medium text-[#14211b]'>{title}</p>
        <p className='font-mono text-[11px] text-[#8a958f]'>{meta}</p>
      </div>
      {attached ? (
        <span className='inline-flex items-center gap-1 text-[12px] font-semibold text-[#17603f]'>
          <Check className='size-4' aria-hidden='true' /> Added
        </span>
      ) : (
        <Button variant='secondary' size='sm' icon={Plus} loading={adding} onClick={onAdd}>
          Add
        </Button>
      )}
    </li>
  )
}
