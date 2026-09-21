import { Navigate, Routes, Route } from 'react-router-dom'
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
import CreateArticle from './pages/CreateArticle'
import ResourceDetails from './pages/ResourceDetails'
import Skills from './pages/Skills'
import AuditLog from './pages/AuditLog'
import PagePlaceholder from './components/PagePlaceholder'
import AdminLayout from './components/admin/AdminLayout'
import UserDirectoryPage from './pages/admin/users/UserDirectoryPage'
import UserDetailPage from './pages/admin/users/UserDetailPage'
import VerificationQueuePage from './pages/admin/verification/VerificationQueuePage'
import VerificationDetailPage from './pages/admin/verification/VerificationDetailPage'
import CompanyListPage from './pages/admin/companies/CompanyListPage'
import CompanyDetailPage from './pages/admin/companies/CompanyDetailPage'
import AdminDashboardPage from './pages/admin/dashboard/AdminDashboardPage'

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
        <Route path="/resources/create" element={<CreateArticle />} />
        <Route path="/resources/:resourceSlug" element={<ResourceDetails />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/audit-log" element={<AuditLog />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<AdminDashboardPage />} />
        <Route path="users" element={<UserDirectoryPage />} />
        <Route path="users/:userId" element={<UserDetailPage />} />
        <Route path="verification" element={<VerificationQueuePage />} />
        <Route path="verification/:requestId" element={<VerificationDetailPage />} />
        <Route path="companies" element={<CompanyListPage />} />
        <Route path="companies/:companyId" element={<CompanyDetailPage />} />
        <Route
          path="*"
          element={
            <div className="p-8">
              <PagePlaceholder title="Coming soon" description="This admin section is not built yet." />
            </div>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
