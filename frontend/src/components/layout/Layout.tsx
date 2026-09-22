import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from '../documentation/TopBar'

export default function Layout() {
  return (
    <div className='flex h-screen w-full overflow-hidden bg-[#f5f7f6] text-[#14211b]'>
      <Sidebar />
      <div className='flex min-w-0 flex-1 flex-col'>
        <TopBar />
        <main className='min-w-0 flex-1 overflow-y-auto hardware-scroll'>
          <div className='w-full px-5 py-7 md:px-8 relative'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
