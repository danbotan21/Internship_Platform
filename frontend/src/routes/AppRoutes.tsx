import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from '../components/Layout'
import Attendance from '../pages/Attendance'
import AuditLog from '../pages/AuditLog'
import Calendar from '../pages/Calendar'
import Contributions from '../pages/Contributions'
import Evaluation from '../pages/Evaluation'
import InternshipProgress from '../pages/InternshipProgress'
import Messages from '../pages/Messages'
import Opportunities from '../pages/Opportunities'
import Overview from '../pages/Overview'
import Quizzes from '../pages/Quizzes'
import Reports from '../pages/Reports'
import Resources from '../pages/Resources'
import Skills from '../pages/Skills'
import Tasks from '../pages/Tasks'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Overview />} />
        <Route path='/internship-progress' element={<InternshipProgress />} />
        <Route path='/tasks' element={<Tasks />} />
        <Route path='/attendance' element={<Attendance />} />
        <Route path='/reports' element={<Reports />} />
        <Route path='/contributions' element={<Contributions />} />
        <Route path='/evaluation' element={<Evaluation />} />
        <Route path='/opportunities' element={<Opportunities />} />
        <Route path='/quizzes' element={<Quizzes />} />
        <Route path='/messages' element={<Messages />} />
        <Route path='/calendar' element={<Calendar />} />
        <Route path='/resources' element={<Resources />} />
        <Route path='/skills' element={<Skills />} />
        <Route path='/audit-log' element={<AuditLog />} />
      </Route>
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}
