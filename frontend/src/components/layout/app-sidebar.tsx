import { Link, useLocation } from 'react-router-dom'

import { navItems } from '@/components/layout/nav-items'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="group-data-[collapsible=icon]:justify-center"
              render={<Link to="/" />}
            >
              <span className="flex size-6 shrink-0 flex-col justify-center gap-[3px] rounded-[3px] border border-sidebar-primary/40 px-1">
                <span className="h-px w-full bg-sidebar-primary" />
                <span className="h-px w-2/3 bg-sidebar-primary" />
              </span>
              <div className="flex flex-col leading-none group-data-[collapsible=icon]:hidden">
                <span className="truncate font-heading text-base font-extrabold tracking-tight">
                  Admin
                </span>
                <span className="font-mono text-[10px] tracking-[0.18em] text-sidebar-foreground/55 uppercase">
                  Commerce Ops
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={location.pathname === item.url}
                    render={<Link to={item.url} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
