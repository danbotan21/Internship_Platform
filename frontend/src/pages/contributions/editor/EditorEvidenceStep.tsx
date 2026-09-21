import { categoryMeta } from '../../../components/contributions/contributionLabels'
import EvidenceComposer from '../../../components/contributions/evidence/EvidenceComposer'
import EvidenceList from '../../../components/contributions/evidence/EvidenceList'
import Alert from '../../../components/ui/Alert'
import { card, sectionTitle } from '../../../components/ui/styles'
import type { ContributionDetails, Evidence } from '../../../types/contribution'
import { branchForName } from './editorForm'

type EditorEvidenceStepProps = {
  contribution: ContributionDetails
  removingId: string | null
  onAddGitHub: (url: string) => Promise<boolean>
  onUploadFile: (file: File, caption: string) => Promise<boolean>
  onAddLink: (name: string, url: string, caption: string) => Promise<boolean>
  onRemove: (evidence: Evidence) => void
}

export default function EditorEvidenceStep({
  contribution,
  removingId,
  onAddGitHub,
  onUploadFile,
  onAddLink,
  onRemove,
}: EditorEvidenceStepProps) {
  const revision = contribution.currentRevision
  const requirement = contribution.submissionChecks.find((check) => check.code === 'evidence')
  const attachedGitHubUrls = revision.evidence.filter((item) => item.gitHub).map((item) => item.url)

  return (
    <div className='space-y-5'>
      <Alert
        tone={requirement?.passed ? 'success' : 'info'}
        title={`${categoryMeta[revision.category].label}: ${requirement?.passed ? 'requirement met' : 'required evidence'}`}
      >
        {categoryMeta[revision.category].requirement}
        {requirement?.detail ? ` ${requirement.detail}` : ''}
      </Alert>

      <section className={`${card} p-5`}>
        <h2 className={sectionTitle}>Attached evidence ({revision.evidence.length})</h2>
        <p className='mb-4 mt-1 text-[13px] text-[#5d6b64]'>
          The checks under each item are what your mentor will see.
        </p>
        <EvidenceList
          evidence={revision.evidence}
          onRemove={onRemove}
          removingId={removingId}
          emptyText='Add GitHub commits, pull requests, screenshots or documents below.'
        />
      </section>

      <section className={`${card} p-5`}>
        <h2 className={sectionTitle}>Add evidence</h2>
        <div className='mt-4'>
          <EvidenceComposer
            category={revision.category}
            attachedGitHubUrls={attachedGitHubUrls}
            preferredBranch={branchForName(contribution.student.fullName)}
            onAddGitHub={onAddGitHub}
            onUploadFile={onUploadFile}
            onAddLink={onAddLink}
          />
        </div>
      </section>
    </div>
  )
}
