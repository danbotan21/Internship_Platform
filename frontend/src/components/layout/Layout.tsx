import { Outlet, useLocation } from 'react-router-dom'
import CurrentUserProvider from '../CurrentUserProvider'
import { useCurrentUser } from '../CurrentUserContext'
import Sidebar from './Sidebar'
import UserSwitcher from './UserSwitcher'
import { pageTitleFor } from './navigation'

function LayoutFrame() {
  const { user, role } = useCurrentUser()
  const { pathname } = useLocation()

  return (
    <div className='flex h-screen w-full overflow-hidden bg-[#f5f7f6] text-[#14211b]'>
      <Sidebar user={user} />
      <div className='flex min-w-0 flex-1 flex-col'>
        <header className='flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[#e6ebe8] bg-white px-5 py-3 md:px-8'>
          <p className='text-[13px] text-[#5d6b64]'>
            {role === 'student' ? 'Student' : 'Mentor'} / {pageTitleFor(pathname)}
          </p>
          <UserSwitcher />
        </header>
        <main className='min-w-0 flex-1 overflow-y-auto'>
          {/* Remount pages when the previewed user changes. */}
          <div key={user.userId} className='mx-auto max-w-[1240px] px-5 py-7 md:px-8'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default function Layout() {
  return (
    <CurrentUserProvider>
      <LayoutFrame />
    </CurrentUserProvider>
  )
}
