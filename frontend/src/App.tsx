import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import AuthModal from './components/AuthModal'
import { useAuth } from './hooks/useAuth'
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

function App() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <AuthModal />
  }

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
        <Route path="/skills" element={<Skills />} />
        <Route path="/audit-log" element={<AuditLog />} />
      </Route>
    </Routes>
  )
}

export default App
