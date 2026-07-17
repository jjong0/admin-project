import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const chartData = [
  { date: '2026-06-18', users: 186, signups: 42 },
  { date: '2026-06-25', users: 205, signups: 51 },
  { date: '2026-07-02', users: 237, signups: 48 },
  { date: '2026-07-09', users: 273, signups: 61 },
  { date: '2026-07-16', users: 309, signups: 55 },
]

const chartConfig = {
  users: {
    label: '전체 사용자',
    color: 'var(--chart-1)',
  },
  signups: {
    label: '신규 가입',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">대시보드</h1>

      <Card>
        <CardHeader>
          <CardTitle>사용자 추이</CardTitle>
          <CardDescription>최근 5주간 전체 사용자 및 신규 가입 추이</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillSignups" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-signups)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-signups)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value: string) =>
                  new Date(value).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                  })
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value: string) =>
                      new Date(value).toLocaleDateString('ko-KR', {
                        month: 'long',
                        day: 'numeric',
                      })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="signups"
                type="natural"
                fill="url(#fillSignups)"
                stroke="var(--color-signups)"
                stackId="a"
              />
              <Area
                dataKey="users"
                type="natural"
                fill="url(#fillUsers)"
                stroke="var(--color-users)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
