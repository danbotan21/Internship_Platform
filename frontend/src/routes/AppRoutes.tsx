import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Attendance from '../pages/Attendance'
import AuditLog from '../pages/AuditLog'
import Calendar from '../pages/Calendar'
import Contributions from '../pages/Contributions'
import CreateArticle from '../pages/CreateArticle'
import Evaluation from '../pages/Evaluation'
import InternshipProgress from '../pages/InternshipProgress'
import Messages from '../pages/Messages'
import Opportunities from '../pages/Opportunities'
import Overview from '../pages/Overview'
import Quizzes from '../pages/Quizzes'
import Reports from '../pages/Reports'
import Resources from '../pages/Resources'
import ResourceDetails from '../pages/ResourceDetails'
import Skills from '../pages/Skills'
import Tasks from '../pages/Tasks'
import PagePlaceholder from '../components/PagePlaceholder'
import AdminLayout from '../components/admin/AdminLayout'
import AdminDashboardPage from '../pages/admin/dashboard/AdminDashboardPage'
import CompanyDetailPage from '../pages/admin/companies/CompanyDetailPage'
import CompanyListPage from '../pages/admin/companies/CompanyListPage'
import UserDetailPage from '../pages/admin/users/UserDetailPage'
import UserDirectoryPage from '../pages/admin/users/UserDirectoryPage'
import VerificationDetailPage from '../pages/admin/verification/VerificationDetailPage'
import VerificationQueuePage from '../pages/admin/verification/VerificationQueuePage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Overview />} />
        <Route path='/internship-progress' element={<InternshipProgress />} />
        <Route path='/tasks' element={<Tasks />} />
        <Route path='/attendance' element={<Attendance />} />
        <Route path='/reports' element={<Reports />} />
        <Route path='/contributions/*' element={<Contributions />} />
        <Route path='/evaluation' element={<Evaluation />} />
        <Route path='/opportunities' element={<Opportunities />} />
        <Route path='/quizzes' element={<Quizzes />} />
        <Route path='/messages' element={<Messages />} />
        <Route path='/calendar' element={<Calendar />} />
        <Route path='/resources' element={<Resources />} />
        <Route path='/resources/create' element={<CreateArticle />} />
        <Route path='/resources/:resourceSlug' element={<ResourceDetails />} />
        <Route path='/skills' element={<Skills />} />
        <Route path='/audit-log' element={<AuditLog />} />
      </Route>

      <Route path='/admin' element={<AdminLayout />}>
        <Route index element={<Navigate to='overview' replace />} />
        <Route path='overview' element={<AdminDashboardPage />} />
        <Route path='users' element={<UserDirectoryPage />} />
        <Route path='users/:userId' element={<UserDetailPage />} />
        <Route path='verification' element={<VerificationQueuePage />} />
        <Route path='verification/:requestId' element={<VerificationDetailPage />} />
        <Route path='companies' element={<CompanyListPage />} />
        <Route path='companies/:companyId' element={<CompanyDetailPage />} />
        <Route
          path='*'
          element={
            <div className='p-8'>
              <PagePlaceholder title='Coming soon' description='This admin section is not built yet.' />
            </div>
          }
        />
      </Route>

      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}
