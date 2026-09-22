import { useState } from 'react'
import type { ContributionCategory } from '../../../types/contribution'
import Tabs from '../../ui/Tabs'
import FileEvidenceForm from './FileEvidenceForm'
import GitHubEvidencePicker from './GitHubEvidencePicker'
import LinkEvidenceForm from './LinkEvidenceForm'

type Source = 'github' | 'file' | 'link'

type EvidenceComposerProps = {
  category: ContributionCategory
  attachedGitHubUrls: string[]
  preferredBranch?: string
  onAddGitHub: (url: string) => Promise<boolean>
  onUploadFile: (file: File, caption: string) => Promise<boolean>
  onAddLink: (name: string, url: string, caption: string) => Promise<boolean>
}

// Opens on the source that fits the category best.
function defaultSource(category: ContributionCategory): Source {
  if (category === 'uiUxDesign') return 'file'
  if (category === 'research') return 'link'
  return 'github'
}

export default function EvidenceComposer({
  category,
  attachedGitHubUrls,
  preferredBranch,
  onAddGitHub,
  onUploadFile,
  onAddLink,
}: EvidenceComposerProps) {
  const [source, setSource] = useState<Source>(() => defaultSource(category))

  return (
    <div className='space-y-4'>
      <Tabs<Source>
        label='Evidence source'
        value={source}
        onChange={setSource}
        tabs={[
          { value: 'github', label: 'From GitHub' },
          { value: 'file', label: 'Screenshot / PDF' },
          { value: 'link', label: 'External link' },
        ]}
      />
      {source === 'github' ? (
        <GitHubEvidencePicker
          attachedUrls={attachedGitHubUrls}
          onAdd={onAddGitHub}
          preferredBranch={preferredBranch}
        />
      ) : source === 'file' ? (
        <FileEvidenceForm onUpload={onUploadFile} />
      ) : (
        <LinkEvidenceForm onAdd={onAddLink} />
      )}
    </div>
  )
}
