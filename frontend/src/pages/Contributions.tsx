import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const previousUserId = useRef(session?.userId ?? null)

  useEffect(() => {
    if (session?.userId && previousUserId.current && previousUserId.current !== session.userId) {
      // A URL opened by the previous account must not become this account's landing page.
      navigate('/contributions', { replace: true })
    }
    if (session?.userId) previousUserId.current = session.userId
  }, [navigate, session?.userId])

  // The auth modal may cover this route before login; do not fetch as a guest.
  if (!session) return null

  if (session.role === 'Mentor' || session.role === 'Company') {
    return (
      <Routes key={session.userId}>
        <Route index element={<MentorReviewQueuePage />} />
        <Route path=':id' element={<MentorReviewPage />} />
        <Route path='*' element={<Navigate to='/contributions' replace />} />
      </Routes>
    )
  }

  if (session?.role !== 'Student') {
    return <p role="status">Contribution management is available to students and mentors.</p>
  }

  return (
    <Routes key={session.userId}>
      <Route index element={<StudentContributionsPage />} />
      <Route path='new' element={<ContributionEditorPage />} />
      <Route path='shared/:id' element={<AttributedContributionPage />} />
      <Route path=':id' element={<StudentContributionPage />} />
      <Route path=':id/edit' element={<ContributionEditorPage />} />
      <Route path='*' element={<Navigate to='/contributions' replace />} />
    </Routes>
  )
}
