import { NavLink } from 'react-router-dom'
import {
  Briefcase,
  Calendar,
  Clock,
  FileText,
  FolderOpen,
  History,
  LayoutGrid,
  ListChecks,
  MessageSquare,
  Star,
  Timer,
  TrendingUp,
  Upload,
  Box,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Role } from '../types/contribution'

type NavItem = {
  label: string
  to: string
  icon: LucideIcon
}

type NavSection = {
  title: string
  items: NavItem[]
}

const studentSections: NavSection[] = [
  {
    title: 'Work',
    items: [
      { label: 'Overview', to: '/', icon: LayoutGrid },
      {
        label: 'Internship progress',
        to: '/internship-progress',
        icon: TrendingUp,
      },
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
    items: [{ label: 'Skills', to: '/skills', icon: Box }],
  },
]

const mentorSections: NavSection[] = [
  {
    title: 'Work',
    items: [
      { label: 'Overview', to: '/', icon: LayoutGrid },
      { label: 'Internship progress', to: '/internship-progress', icon: TrendingUp },
      { label: 'Review queue', to: '/contributions', icon: Upload },
      { label: 'Reports', to: '/reports', icon: FileText },
      { label: 'Evaluation', to: '/evaluation', icon: Star },
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
    items: [{ label: 'Audit log', to: '/audit-log', icon: History }],
  },
]

export default function Sidebar({ role }: { role: Role }) {
  const sections = role === 'student' ? studentSections : mentorSections

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col justify-between bg-[#1e3a2c] px-3 py-5 text-white">
      <div className="min-h-0 overflow-y-auto">
        <div className="flex items-center gap-2 px-2 pb-5">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5">
            <img
              src="/Logo/logo.svg"
              alt="internflow logo"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-xl font-semibold">internflow.</span>
        </div>

        <div className="mb-5 rounded-xl bg-white/5 px-3 py-3">
          <p className="text-sm font-medium">practica</p>
          <p className="text-xs text-white/50">
            {role === 'student' ? 'Student workspace' : 'Mentor workspace'}
          </p>
        </div>

        <nav aria-label="Workspace navigation" className="flex flex-col gap-5">
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
                          ? 'bg-white/10 font-medium text-white'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="size-[18px]" strokeWidth={1.75} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 border-t border-white/10 px-2 pt-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
          DB
        </div>
        <div>
          <p className="text-sm">Daniel Botan</p>
          <p className="text-xs text-white/40">
            {role === 'student' ? 'Student' : 'Mentor preview'}
          </p>
        </div>
      </div>
    </aside>
  )
}
