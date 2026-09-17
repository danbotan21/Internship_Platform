<<<<<<< Updated upstream
function App() {
  return (
    <h1 className='text-3xl font-bold text-blue-600'>Internship Platform</h1>
=======
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import InternshipProgress from './pages/InternshipProgress'
import Tasks from './pages/Tasks'
import Attendance from './pages/Attendance'
import Reports from './pages/Reports'
import Contributions from './pages/Contributions'
import Evaluation from './pages/Evaluation'
import Opportunities from './pages/Opportunities'
import Quizzes from './pages/Quizzes'
import Messages from './pages/Messages'
import Calendar from './pages/Calendar'
import Resources from './pages/Resources'
import Skills from './pages/Skills'
import AuditLog from './pages/AuditLog'

import DocumentationPage from './pages/DocumentationPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Overview />} />
        <Route path="/internship-progress" element={<InternshipProgress />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/contributions" element={<Contributions />} />
        <Route path="/evaluation" element={<Evaluation />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/documentation" element={<DocumentationPage />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/audit-log" element={<AuditLog />} />
      </Route>
    </Routes>
>>>>>>> Stashed changes
  )
}

export default App
