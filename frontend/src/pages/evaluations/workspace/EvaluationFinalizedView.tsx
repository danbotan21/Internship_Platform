import EvaluationFeedbackView from '../../../components/evaluations/EvaluationFeedbackView'
import ScoreBreakdownTable from '../../../components/evaluations/ScoreBreakdownTable'
import ScoreHero from '../../../components/evaluations/ScoreHero'
import Alert from '../../../components/ui/Alert'
import { formatDateTime } from '../../../components/ui/formatDateTime'
import type { EvaluationDetails } from '../../../types/evaluation'

// Locked result, as published to the student.
export default function EvaluationFinalizedView({ evaluation }: { evaluation: EvaluationDetails }) {
  const acknowledged = Boolean(evaluation.acknowledgedAtUtc)
  return (
    <div className='space-y-5'>
      <ScoreHero
        score={evaluation.finalScore ?? 0}
        label={`Finalized ${formatDateTime(evaluation.finalizedAtUtc)}`}
        previousScore={evaluation.previousFinalScore}
        previousType={evaluation.previousType}
        caption='Scores, comments and feedback are locked and visible to the student.'
      />
      <Alert
        tone={acknowledged ? 'success' : 'info'}
        title={
          acknowledged
            ? `Acknowledged by the student ${formatDateTime(evaluation.acknowledgedAtUtc)}`
            : 'Not acknowledged by the student yet'
        }
      >
        {evaluation.studentResponse
          ? `“${evaluation.studentResponse}”`
          : acknowledged
            ? 'No comment left.'
            : 'The student confirms once they read the result.'}
      </Alert>
      <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]'>
        <ScoreBreakdownTable
          criteria={evaluation.criteria}
          description={`Frozen rubric v${evaluation.rubricVersionNumber}.`}
        />
        <EvaluationFeedbackView feedback={evaluation.feedback} />
      </div>
    </div>
  )
}
