import { NavLink } from 'react-router-dom'
import type { InternshipMember } from '../../types/user'
import { navigationFor } from './navigation'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function Sidebar({ user }: { user: InternshipMember }) {
  const role = user.role
  const sections = navigationFor(role)

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
          {initials(user.fullName)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm">{user.fullName}</p>
          <p className="text-xs text-white/40">
            {role === 'student' ? 'Student' : 'Mentor'}
            {user.gitHubUsername ? ` · @${user.gitHubUsername}` : ''}
          </p>
        </div>
      </div>
    </aside>
  )
}
