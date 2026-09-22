import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  const { pathname } = useLocation()
  const isResourceFullPage = pathname.startsWith('/resources/')

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {!isResourceFullPage && <Sidebar />}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
