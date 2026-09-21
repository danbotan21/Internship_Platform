import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { pageTitleFor } from './navigation'
import { useAuth } from '../../hooks/authContext'

export default function Layout() {
  const { session } = useAuth()
  const { pathname } = useLocation()

  const roleLabel = session?.role === 'Student' ? 'Student' : 'Mentor'

  return (
    <div className='flex h-screen w-full overflow-hidden bg-[#f5f7f6] text-[#14211b]'>
      <Sidebar />
      <div className='flex min-w-0 flex-1 flex-col'>
        <header className='flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[#e6ebe8] bg-white px-5 py-3 md:px-8'>
          <p className='text-[13px] text-[#5d6b64]'>
            {roleLabel} / {pageTitleFor(pathname)}
          </p>
        </header>
        <main className='min-w-0 flex-1 overflow-y-auto'>
          <div className='mx-auto max-w-[1240px] px-5 py-7 md:px-8'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
