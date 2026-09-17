import { Navigate, Route, Routes } from 'react-router-dom'
import ContributionWorkspace from '../pages/ContributionWorkspace'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path='/contributions' element={<ContributionWorkspace />} />
      <Route path='*' element={<Navigate to='/contributions' replace />} />
    </Routes>
  )
}
