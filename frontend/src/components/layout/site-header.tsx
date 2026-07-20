import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { navItems } from '@/components/layout/nav-items'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SidebarTrigger } from '@/components/ui/sidebar'

function formatNow(date: Date) {
  const dateLabel = date.toLocaleDateString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  })
  const timeLabel = date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return `${dateLabel} ${timeLabel}`
}

export function SiteHeader() {
  const location = useLocation()
  const current = navItems.find((item) => item.url === location.pathname)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <SidebarTrigger />
      <h2 className="text-sm font-semibold" aria-current="page">
        {current?.title ?? '대시보드'}
      </h2>

      <div className="ml-auto flex items-center gap-4">
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {formatNow(now)}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1 outline-none hover:bg-muted">
            <Avatar className="size-7">
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>프로필</DropdownMenuItem>
            <DropdownMenuItem>설정</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">로그아웃</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
