import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/authContext'
import MentorEvaluationPage from './evaluations/MentorEvaluationPage'
import MentorEvaluationsPage from './evaluations/MentorEvaluationsPage'
import MentorStudentEvaluationsPage from './evaluations/MentorStudentEvaluationsPage'
import NewEvaluationPage from './evaluations/NewEvaluationPage'
import RubricHistoryPage from './evaluations/RubricHistoryPage'
import RubricPage from './evaluations/RubricPage'
import StudentCriteriaPage from './evaluations/StudentCriteriaPage'
import StudentEvaluationPage from './evaluations/StudentEvaluationPage'
import StudentEvaluationsPage from './evaluations/StudentEvaluationsPage'

// Remount detail pages when navigating from one evaluation to another.
function MentorEvaluationRoute() {
  const { id } = useParams()
  return <MentorEvaluationPage key={id} />
}

function StudentEvaluationRoute() {
  const { id } = useParams()
  return <StudentEvaluationPage key={id} />
}

// Evaluation routes, chosen by the signed-in user's role.
export default function Evaluation() {
  const { session } = useAuth()

  if (!session) return null

  if (session.role === 'Mentor' || session.role === 'Company') {
    return (
      <Routes key={session.userId}>
        <Route index element={<MentorEvaluationsPage />} />
        <Route path='rubric' element={<RubricPage />} />
        <Route path='rubric/history' element={<RubricHistoryPage />} />
        <Route path='new' element={<NewEvaluationPage />} />
        <Route path='students/:studentId' element={<MentorStudentEvaluationsPage />} />
        <Route path=':id' element={<MentorEvaluationRoute />} />
        <Route path='*' element={<Navigate to='/evaluation' replace />} />
      </Routes>
    )
  }

  if (session.role === 'Student') {
    return (
      <Routes key={session.userId}>
        <Route index element={<StudentEvaluationsPage />} />
        <Route path='criteria' element={<StudentCriteriaPage />} />
        <Route path=':id' element={<StudentEvaluationRoute />} />
        <Route path='*' element={<Navigate to='/evaluation' replace />} />
      </Routes>
    )
  }

  return (
    <p role='status'>Evaluation is available to students and mentors.</p>
  )
}
