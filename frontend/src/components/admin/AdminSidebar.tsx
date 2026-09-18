import { NavLink } from 'react-router-dom'
import {
  BadgeCheck,
  Building2,
  History,
  LayoutGrid,
  ShieldAlert,
  UserCog,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
      { label: 'Overview', to: '/admin/overview', icon: LayoutGrid },
      { label: 'Users', to: '/admin/users', icon: Users },
      { label: 'Companies', to: '/admin/companies', icon: Building2 },
      { label: 'Verification', to: '/admin/verification', icon: BadgeCheck },
      { label: 'Moderation', to: '/admin/moderation', icon: ShieldAlert },
      { label: 'Mentor assignment', to: '/admin/mentor-assignment', icon: UserCog },
    ],
  },
  {
    title: 'Oversight',
    items: [{ label: 'Audit log', to: '/admin/audit-log', icon: History }],
  },
]

export default function AdminSidebar() {
  return (
    <aside className="flex h-screen w-58 shrink-0 flex-col justify-between bg-[#1b4332] p-5">
      <div className="flex flex-col gap-5.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-[10px] bg-white p-1.5">
            <img src="/logo.svg" alt="internflow logo" className="h-full w-full" />
          </div>
          <span className="text-[25px] font-bold text-white">internflow.</span>
        </div>

        <div className="rounded-[10px] bg-[#244f3c] p-3">
          <p className="text-xs font-semibold text-white">internflow</p>
          <p className="text-[11px] text-[#b5ccbe]">Admin workspace</p>
        </div>

        <nav className="flex flex-col gap-4" aria-label="Admin navigation">
          {sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-1.25">
              <p className="text-[9px] font-bold tracking-wide text-[#8fae9c] uppercase">
                {section.title}
              </p>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex h-10 items-center gap-3 rounded-lg px-2.5 text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'bg-[#315c47] text-white'
                        : 'text-[#cfe0d6] hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" strokeWidth={1.75} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* TODO: show the signed-in admin once the Authentication epic is merged. */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
          AD
        </div>
        <div>
          <p className="text-[13px] font-bold text-white">Administrator</p>
          <p className="text-[11px] text-[#b5ccbe]">Admin · Settings</p>
        </div>
      </div>
    </aside>
  )
}
