import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import DocumentationPage from '../pages/DocumentationPage'
import Attendance from '../pages/Attendance'
import AuditLog from '../pages/AuditLog'
import Calendar from '../pages/Calendar'
import Contributions from '../pages/Contributions'
import CreateArticle from '../pages/CreateArticle'
import Evaluation from '../pages/Evaluation'
import InternshipProgress from '../pages/InternshipProgress'
import Messages from '../pages/Messages'
import Opportunities from '../pages/Opportunities'
import OpportunityApply from '../pages/OpportunityApply'
import MyApplications from '../pages/MyApplications'
import ApplicationDetails from '../pages/ApplicationDetails'
import MyOpportunities from '../pages/MyOpportunities'
import CreateOpportunity from '../pages/CreateOpportunity'
import EditOpportunity from '../pages/EditOpportunity'
import OpportunityApplications from '../pages/OpportunityApplications'
import ApplicantReview from '../pages/ApplicantReview'
import Overview from '../pages/Overview'
import Quizzes from '../pages/Quizzes'
import Reports from '../pages/Reports'
import Resources from '../pages/Resources'
import ResourceDetails from '../pages/ResourceDetails'
import Skills from '../pages/Skills'
import SkillMatch from '../pages/SkillMatch'
import Tasks from '../pages/Tasks'
import PagePlaceholder from '../components/PagePlaceholder'
import RequireAdmin from '../components/admin/RequireAdmin'
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
        <Route path='/opportunities/apply' element={<OpportunityApply />} />
        <Route path='/my-applications' element={<MyApplications />} />
        <Route path='/my-applications/application-details' element={<ApplicationDetails />} />
        <Route path='/my-opportunities' element={<MyOpportunities />} />
        <Route path='/my-opportunities/create' element={<CreateOpportunity />} />
        <Route path='/my-opportunities/edit' element={<EditOpportunity />} />
        <Route path='/my-opportunities/applications' element={<OpportunityApplications />} />
        <Route path='/my-opportunities/review' element={<ApplicantReview />} />
        <Route path='/quizzes' element={<Quizzes />} />
        <Route path='/custom-quizzes' element={<Quizzes />} />
        <Route path='/messages' element={<Messages />} />
        <Route path='/calendar' element={<Calendar />} />
        <Route path='/resources' element={<Resources />} />
        <Route path='/resources/create' element={<CreateArticle />} />
        <Route path='/resources/:resourceSlug' element={<ResourceDetails />} />
        <Route path='/documentation' element={<DocumentationPage />} />
        <Route path='/skills' element={<Skills />} />
        <Route path='/skill-match' element={<SkillMatch />} />
        <Route path='/audit-log' element={<AuditLog />} />
      </Route>

      <Route path='/admin' element={<RequireAdmin />}>
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
