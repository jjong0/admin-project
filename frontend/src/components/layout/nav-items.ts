import type { LucideIcon } from 'lucide-react'
import { LayoutDashboard, Settings, Users } from 'lucide-react'

export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { title: '대시보드', url: '/', icon: LayoutDashboard },
  { title: '고객 관리', url: '/users', icon: Users },
  { title: '설정', url: '/settings', icon: Settings },
]
