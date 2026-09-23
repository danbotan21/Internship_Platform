import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutGrid,
  ListChecks,
  FileText,
  Upload,
  Star,
  Briefcase,
  FileCheck,
  Timer,
  TrendingUp,
  MessageSquare,
  Calendar,
  FolderOpen,
  Box,
  History,
  FolderKanban,
  UserCheck,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import ConfirmLogoutModal from './ConfirmLogoutModal'
import { useUserRole } from '../hooks/useUserRole'

type NavItem = {
  label: string
  to: string
  icon: LucideIcon
}

type NavSection = {
  title: string
  items: NavItem[]
}

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function Sidebar() {
  const { role, setRole } = useUserRole()
  const { session, logout } = useAuth()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const sections: NavSection[] = [
    {
      title: 'Work',
      items: [
        { label: 'Overview', to: '/', icon: LayoutGrid },
        { label: 'Internship progress', to: '/internship-progress', icon: TrendingUp },
        { label: 'Tasks', to: '/tasks', icon: ListChecks },
        { label: 'Reports', to: '/reports', icon: FileText },
        { label: 'Contributions', to: '/contributions', icon: Upload },
        { label: 'Evaluation', to: '/evaluation', icon: Star },
        { label: 'Opportunities', to: '/opportunities', icon: Briefcase },
        role === 'Student'
          ? { label: 'My Applications', to: '/my-applications', icon: FileCheck }
          : { label: 'My Opportunities', to: '/my-opportunities', icon: FolderKanban },
        { label: 'Quizzes', to: '/quizzes', icon: Timer },
        ...(role !== 'Student'
          ? [{ label: 'Skill Match', to: '/skill-match', icon: SlidersHorizontal }]
          : []),
      ],
    },
    {
      title: 'Connect',
      items: [
        { label: 'Messages', to: '/messages', icon: MessageSquare },
        { label: 'Calendar', to: '/calendar', icon: Calendar },
        { label: 'Documentation', to: '/documentation', icon: FileText },
        { label: 'Resources', to: '/resources', icon: FolderOpen },
      ],
    },
    {
      title: 'Manage',
      items: [
        { label: 'Skills', to: '/skills', icon: Box },
        { label: 'Audit log', to: '/audit-log', icon: History },
      ],
    },
  ]

  return (
    <>
      <aside id="app-sidebar" className="flex h-screen w-72 shrink-0 flex-col bg-[#1e3a2c] select-none">
        <div id="sidebar-navigation" className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-4 py-6">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2 px-2 pb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white p-1.5 shadow-xs">
              <img src="/logo.svg" alt="internflow logo" className="h-full w-full" />
            </div>
            <span className="text-2xl font-semibold text-white">internflow.</span>
          </div>

          {/* Workspace Card */}
          <div className="mb-6 rounded-xl bg-white/5 px-4 py-4">
            <p className="text-base font-medium text-white">internflow</p>
            <p className="text-sm text-white/50">
              {role === 'Student' ? 'Student workspace' : 'Mentor workspace'}
            </p>
          </div>

          {/* Navigation Sections */}
          <nav className="flex flex-col gap-6">
            {sections.map((section) => (
              <div key={section.title}>
                <p className="mb-2 px-3 text-xs font-medium tracking-wide text-white/40 uppercase">
                  {section.title}
                </p>
                <div className="flex flex-col gap-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `flex items-center gap-3.5 rounded-lg px-3 py-2.5 text-base transition-colors ${isActive
                          ? 'bg-white/10 text-white font-medium'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" strokeWidth={1.75} />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          </div>
        </div>

        {/* User Footer with Role Toggle & Logout */}
        <div className="mx-4 mt-4 flex items-center gap-3 border-t border-white/10 px-3 pt-5 pb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white shrink-0">
            {session ? getInitials(session.fullName) : ''}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-medium text-white">{session?.fullName}</p>
            <p className="text-sm text-white/50 truncate">{role}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setRole(role === 'Student' ? 'Mentor' : 'Student')}
              title={`Switch to ${role === 'Student' ? 'Mentor' : 'Student'} view`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            >
              <UserCheck className="h-4.5 w-4.5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Log out"
              title="Sign out"
            >
              <LogOut className="h-4.5 w-4.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </aside>

      <ConfirmLogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
      />
    </>
  )
}
