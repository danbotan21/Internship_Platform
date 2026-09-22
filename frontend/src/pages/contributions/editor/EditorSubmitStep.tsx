import { Send } from 'lucide-react'
import CategoryTag from '../../../components/contributions/CategoryTag'
import EvidenceSummaryChips from '../../../components/contributions/EvidenceSummaryChips'
import RevisionComparisonCard from '../../../components/contributions/RevisionComparisonCard'
import SubmissionChecklist from '../../../components/contributions/SubmissionChecklist'
import FeedbackResponsesPanel from '../../../components/contributions/review/FeedbackResponsesPanel'
import Alert from '../../../components/ui/Alert'
import Button from '../../../components/ui/Button'
import Field from '../../../components/ui/Field'
import { formatPeriod } from '../../../components/ui/formatDateTime'
import { card, sectionTitle, textareaBase } from '../../../components/ui/styles'
import type { ContributionDetails, DraftInput, EvidenceSummary } from '../../../types/contribution'
import { openChangeRequest } from './editorForm'

type EditorSubmitStepProps = {
  contribution: ContributionDetails
  form: DraftInput
  dirty: boolean
  submitting: boolean
  onChange: (changes: Partial<DraftInput>) => void
  onSubmit: () => void
}

function summarize(contribution: ContributionDetails): EvidenceSummary {
  const evidence = contribution.currentRevision.evidence
  return {
    commits: evidence.filter((item) => item.type === 'githubCommit').length,
    pullRequests: evidence.filter((item) => item.type === 'githubPullRequest').length,
    images: evidence.filter((item) => item.type === 'image').length,
    documents: evidence.filter((item) => item.type === 'document').length,
    links: evidence.filter((item) => item.type === 'link').length,
    additions: evidence.reduce((sum, item) => sum + (item.gitHub?.additions ?? 0), 0),
    deletions: evidence.reduce((sum, item) => sum + (item.gitHub?.deletions ?? 0), 0),
  }
}

export default function EditorSubmitStep({
  contribution,
  form,
  dirty,
  submitting,
  onChange,
  onSubmit,
}: EditorSubmitStepProps) {
  const changeRequest = openChangeRequest(contribution)
  const responses = Object.fromEntries(
    form.feedbackResponses.map((item) => [item.feedbackItemId, item.response]),
  )
  const blocking = contribution.submissionChecks.filter(
    (check) => !check.passed && !(dirty && ['feedback', 'revisionNote', 'changed'].includes(check.code)),
  )

  return (
    <div className='space-y-5'>
      {changeRequest ? (
        <>
          <FeedbackResponsesPanel
            review={changeRequest}
            responses={responses}
            onChange={(feedbackItemId, response) =>
              onChange({
                feedbackResponses: form.feedbackResponses.map((item) =>
                  item.feedbackItemId === feedbackItemId ? { ...item, response } : item,
                ),
              })
            }
          />
          <section className={`${card} p-5`}>
            <Field
              label='Revision note'
              htmlFor='revision-note'
              required
              counter={{ value: (form.revisionNote ?? '').trim().length, min: 10, max: 1000 }}
              hint='A short summary of this revision for the mentor.'
            >
              <textarea
                id='revision-note'
                className={`${textareaBase} min-h-20`}
                maxLength={1000}
                value={form.revisionNote ?? ''}
                onChange={(event) => onChange({ revisionNote: event.target.value || null })}
              />
            </Field>
          </section>
          {contribution.comparison ? (
            <RevisionComparisonCard
              comparison={contribution.comparison}
              currentRevision={contribution.currentRevisionNumber}
            />
          ) : null}
        </>
      ) : null}

      <section className={`${card} p-5`}>
        <h2 className={sectionTitle}>What the mentor will receive</h2>
        <div className='mt-4 space-y-3'>
          <p className='text-[16px] font-semibold text-[#14211b]'>{form.title || 'Untitled'}</p>
          <div className='flex flex-wrap items-center gap-3 text-[13px] text-[#5d6b64]'>
            <CategoryTag category={form.category} />
            <span>{formatPeriod(form.workStartDate, form.workEndDate)}</span>
          </div>
          <EvidenceSummaryChips summary={summarize(contribution)} />
          <p className='text-[13px] text-[#5d6b64]'>
            {contribution.collaborators.length
              ? `${contribution.collaborators.length} collaborator(s) credited`
              : 'No collaborators — individual work'}
          </p>
        </div>
        <div className='mt-5 border-t border-[#eef1ef] pt-5'>
          <SubmissionChecklist checks={contribution.submissionChecks} />
        </div>
        {dirty ? (
          <Alert tone='info' className='mt-4'>
            Your latest edits are saved automatically when you submit; the checks are verified again then.
          </Alert>
        ) : null}
        <Button
          className='mt-5 w-full'
          icon={Send}
          loading={submitting}
          disabled={blocking.length > 0}
          onClick={onSubmit}
        >
          {changeRequest ? 'Resubmit for review' : 'Submit for review'}
        </Button>
        {blocking.length ? (
          <p className='mt-2 text-center text-[12px] text-[#a3530f]'>
            Complete the missing checks above to submit.
          </p>
        ) : (
          <p className='mt-2 text-center text-[12px] text-[#5d6b64]'>
            After submitting, the contribution is read-only until the mentor reviews it.
          </p>
        )}
      </section>
    </div>
  )
}
