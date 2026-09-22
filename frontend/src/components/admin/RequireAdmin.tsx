import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../../hooks/authContext'
import AdminLayout from './AdminLayout'

/**
 * Gate in front of every /admin route. The API refuses these calls for anyone who is
 * not an admin, so this is not the security boundary - it is what stops a signed-in
 * user who guesses the URL from landing on pages that can only fail.
 */
export default function RequireAdmin() {
  const { session } = useAuth()

  if (session?.role !== 'Admin') {
    return <NoAccess />
  }

  return <AdminLayout />
}

function NoAccess() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#f8f9fa] p-8 text-[#172c23]">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-[14px] border border-[#e2e8e4] bg-white p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff1e3]">
          <ShieldAlert className="h-6 w-6 text-[#a54a00]" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <h1 className="text-lg font-bold">Admin access only</h1>
        <p className="text-[13px] text-[#718078]">
          This area is limited to platform administrators. If you think you should have access,
          ask an admin to change your role.
        </p>
        <Link
          to="/"
          className="mt-1 flex h-10.5 items-center rounded-[9px] bg-[#1b4332] px-5 text-[13px] font-bold text-white"
        >
          Back to internflow
        </Link>
      </div>
    </div>
  )
}
