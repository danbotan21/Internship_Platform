import { NavLink } from 'react-router-dom'
import {
  LayoutGrid,
  ListChecks,
  Clock,
  FileText,
  Upload,
  Star,
  Briefcase,
  Timer,
  TrendingUp,
  MessageSquare,
  Calendar,
  FolderOpen,
  Box,
  History,
  LogOut,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

type NavItem = {
  label: string
  to: string
  icon: LucideIcon
}

type NavSection = {
  title: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    title: 'Work',
    items: [
      { label: 'Overview', to: '/', icon: LayoutGrid },
      { label: 'Internship progress', to: '/internship-progress', icon: TrendingUp },
      { label: 'Tasks', to: '/tasks', icon: ListChecks },
      { label: 'Attendance', to: '/attendance', icon: Clock },
      { label: 'Reports', to: '/reports', icon: FileText },
      { label: 'Contributions', to: '/contributions', icon: Upload },
      { label: 'Evaluation', to: '/evaluation', icon: Star },
      { label: 'Opportunities', to: '/opportunities', icon: Briefcase },
      { label: 'Quizzes', to: '/quizzes', icon: Timer },
    ],
  },
  {
    title: 'Connect',
    items: [
      { label: 'Messages', to: '/messages', icon: MessageSquare },
      { label: 'Calendar', to: '/calendar', icon: Calendar },
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

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function Sidebar() {
  const { session, logout } = useAuth()

  return (
    <aside className="flex h-screen w-64 flex-col justify-between bg-[#1e3a2c] px-3 py-5">
      <div>
        <div className="flex items-center gap-2 px-2 pb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white p-1.5">
            <img src="/logo.svg" alt="internflow logo" className="h-full w-full" />
          </div>
          <span className="text-xl font-semibold text-white">internflow.</span>
        </div>

        <div className="mb-5 rounded-xl bg-white/5 px-3 py-3">
          <p className="text-sm font-medium text-white">internflow</p>
          <p className="text-xs text-white/50">Student workspace</p>
        </div>

        <nav className="flex flex-col gap-5">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="mb-1 px-2 text-[11px] font-medium tracking-wide text-white/40 uppercase">
                {section.title}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 border-t border-white/10 px-2 pt-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white">
          {session ? getInitials(session.fullName) : ''}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-white">{session?.fullName}</p>
          <p className="text-xs text-white/40">{session?.role}</p>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/5 hover:text-white"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </aside>
  )
}
