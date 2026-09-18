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
import OpportunityApply from './pages/OpportunityApply'
import MyApplications from './pages/MyApplications'
import ApplicationDetails from './pages/ApplicationDetails'
import MyOpportunities from './pages/MyOpportunities'
import CreateOpportunity from './pages/CreateOpportunity'
import EditOpportunity from './pages/EditOpportunity'
import OpportunityApplications from './pages/OpportunityApplications'
import ApplicantReview from './pages/ApplicantReview'
import Quizzes from './pages/Quizzes'
import Messages from './pages/Messages'
import Calendar from './pages/Calendar'
import Resources from './pages/Resources'
import Skills from './pages/Skills'
import AuditLog from './pages/AuditLog'

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
        <Route path="/opportunities/apply" element={<OpportunityApply />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/my-applications/application-details" element={<ApplicationDetails />} />
        <Route path="/my-opportunities" element={<MyOpportunities />} />
        <Route path="/my-opportunities/create" element={<CreateOpportunity />} />
        <Route path="/my-opportunities/edit" element={<EditOpportunity />} />
        <Route path="/my-opportunities/applications" element={<OpportunityApplications />} />
        <Route path="/my-opportunities/review" element={<ApplicantReview />} />
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
