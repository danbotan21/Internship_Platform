import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../hooks/authContext'
import AttributedContributionPage from './contributions/AttributedContributionPage'
import ContributionEditorPage from './contributions/ContributionEditorPage'
import MentorReviewPage from './contributions/MentorReviewPage'
import MentorReviewQueuePage from './contributions/MentorReviewQueuePage'
import StudentContributionPage from './contributions/StudentContributionPage'
import StudentContributionsPage from './contributions/StudentContributionsPage'

// Contribution Management routes, chosen by the signed-in user's role.
export default function Contributions() {
  const { session } = useAuth()

  if (session?.role === 'Mentor') {
    return (
      <Routes>
        <Route index element={<MentorReviewQueuePage />} />
        <Route path=':id' element={<MentorReviewPage />} />
        <Route path='*' element={<Navigate to='/contributions' replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route index element={<StudentContributionsPage />} />
      <Route path='new' element={<ContributionEditorPage />} />
      <Route path='shared/:id' element={<AttributedContributionPage />} />
      <Route path=':id' element={<StudentContributionPage />} />
      <Route path=':id/edit' element={<ContributionEditorPage />} />
      <Route path='*' element={<Navigate to='/contributions' replace />} />
    </Routes>
  )
}
