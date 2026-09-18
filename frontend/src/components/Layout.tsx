import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useWorkspaceRole } from './WorkspaceRoleContext'
import WorkspaceRoleProvider from './WorkspaceRoleProvider'

function pageName(pathname: string) {
  const names: Record<string, string> = {
    '/': 'Overview',
    '/internship-progress': 'Internship progress',
    '/tasks': 'Tasks',
    '/attendance': 'Attendance',
    '/reports': 'Reports',
    '/contributions': 'Contributions',
    '/evaluation': 'Evaluation',
    '/opportunities': 'Opportunities',
    '/quizzes': 'Quizzes',
    '/messages': 'Messages',
    '/calendar': 'Calendar',
    '/resources': 'Resources',
    '/skills': 'Skills',
    '/audit-log': 'Audit log',
  }
  return names[pathname] ?? 'Workspace'
}

function LayoutFrame() {
  const { role, setRole } = useWorkspaceRole()
  const { pathname } = useLocation()

  return (
    <div className='flex min-h-screen w-full overflow-hidden bg-[#f5f7f6] text-[#14211b]'>
      <Sidebar role={role} />
      <div className='flex min-w-0 flex-1 flex-col'>
        <header className='flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-[#eef1ef] bg-white px-5 py-3 md:px-8'>
          <p className='text-[12px] text-[#6f7c76]'>
            {role === 'student' ? 'Student' : 'Mentor'} / {pageName(pathname)}
          </p>
          <div className='flex items-center gap-3'>
            {/* <span className="hidden text-[11px] text-[#8a5200] sm:block">
              Connected to API and PostgreSQL
            </span> */}
            <div
              className='flex rounded-lg border border-[#d9e0dc] p-1 text-[11px]'
              aria-label='Preview role'
            >
              <button
                type='button'
                onClick={() => setRole('student')}
                className={`rounded-md px-3 py-1.5 ${role === 'student' ? 'bg-[#184b38] text-white' : 'text-[#6f7c76]'}`}
              >
                Student
              </button>
              <button
                type='button'
                onClick={() => setRole('mentor')}
                className={`rounded-md px-3 py-1.5 ${role === 'mentor' ? 'bg-[#184b38] text-white' : 'text-[#6f7c76]'}`}
              >
                Mentor
              </button>
            </div>
          </div>
        </header>
        <main className='min-w-0 flex-1 overflow-y-auto'>
          <div className='mx-auto max-w-[1210px] px-5 py-7 md:px-8'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default function Layout() {
  return (
    <WorkspaceRoleProvider>
      <LayoutFrame />
    </WorkspaceRoleProvider>
  )
}
