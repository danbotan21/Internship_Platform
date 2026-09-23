import {
  Briefcase,
  Calendar,
  FileCheck,
  FileText,
  FolderKanban,
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
  Pencil,
  Building2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { UserRole } from '../../types/auth'

export type NavItem = {
  label: string
  to: string
  icon: LucideIcon
}

export type NavSection = {
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
      { label: 'Reports', to: '/reports', icon: FileText },
      { label: 'Contributions', to: '/contributions', icon: Upload },
      { label: 'Evaluation', to: '/evaluation', icon: Star },
      { label: 'Opportunities', to: '/opportunities', icon: Briefcase },
      { label: 'My Applications', to: '/my-applications', icon: FileCheck },
      { label: 'Quizzes', to: '/quizzes', icon: Timer },
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
      { label: 'Represent a company', to: '/become-company', icon: Building2 },
    ],
  },
]

const mentorSections: NavSection[] = [
  {
    title: 'Work',
    items: [
      { label: 'Overview', to: '/', icon: LayoutGrid },
      { label: 'Internship progress', to: '/internship-progress', icon: TrendingUp },
      { label: 'Review queue', to: '/contributions', icon: Upload },
      { label: 'Custom Quizzes', to: '/custom-quizzes', icon: Pencil },
      { label: 'Reports', to: '/reports', icon: FileText },
      { label: 'Evaluation', to: '/evaluation', icon: Star },
      { label: 'Opportunities', to: '/opportunities', icon: Briefcase },
      { label: 'My Opportunities', to: '/my-opportunities', icon: FolderKanban },
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
    items: [{ label: 'Audit log', to: '/audit-log', icon: History }],
  },
]

export function navigationFor(role: UserRole) {
  return role === 'Student' ? studentSections : mentorSections
}

const pageTitles: Record<string, string> = {
  '/': 'Overview',
  '/internship-progress': 'Internship progress',
  '/tasks': 'Tasks',
  '/attendance': 'Attendance',
  '/reports': 'Reports',
  '/contributions': 'Contributions',
  '/evaluation': 'Evaluation',
  '/opportunities': 'Opportunities',
  '/my-applications': 'My Applications',
  '/my-opportunities': 'My Opportunities',
  '/quizzes': 'Quizzes',
  '/custom-quizzes': 'Custom Quizzes',
  '/messages': 'Messages',
  '/calendar': 'Calendar',
  '/documentation': 'Documentation',
  '/resources': 'Resources',
  '/skills': 'Skills',
  '/become-company': 'Represent a company',
  '/audit-log': 'Audit log',
}

export function pageTitleFor(pathname: string) {
  const section = `/${pathname.split('/')[1] ?? ''}`
  return pageTitles[pathname] ?? pageTitles[section] ?? 'Workspace'
}
