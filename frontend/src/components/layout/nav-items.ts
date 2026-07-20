import type { LucideIcon } from 'lucide-react'
import { LayoutDashboard, Package, Settings, Truck, Users } from 'lucide-react'

export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { title: '대시보드', url: '/', icon: LayoutDashboard },
  { title: '상품 관리', url: '/products', icon: Package },
  { title: '배송 관리', url: '/shipments', icon: Truck },
  { title: '고객 관리', url: '/users', icon: Users },
  { title: '설정', url: '/settings', icon: Settings },
]
