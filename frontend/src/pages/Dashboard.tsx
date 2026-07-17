import { Fragment } from 'react'
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

type Stage = {
  key: string
  label: string
  count: number
  color: string
}

const STAGES: Stage[] = [
  { key: 'paid', label: '결제완료', count: 21, color: 'var(--chart-1)' },
  { key: 'preparing', label: '상품준비중', count: 47, color: 'var(--chart-2)' },
  { key: 'shipping', label: '배송중', count: 63, color: 'var(--chart-3)' },
  { key: 'delivered', label: '배송완료', count: 312, color: 'var(--chart-4)' },
  { key: 'cancelled', label: '취소·반품', count: 5, color: 'var(--chart-5)' },
]

const chartData = [
  { date: '2026-06-18', users: 186, signups: 42 },
  { date: '2026-06-25', users: 205, signups: 51 },
  { date: '2026-07-02', users: 237, signups: 48 },
  { date: '2026-07-09', users: 273, signups: 61 },
  { date: '2026-07-16', users: 309, signups: 55 },
]

const chartConfig = {
  users: {
    label: '전체 고객',
    color: 'var(--chart-2)',
  },
  signups: {
    label: '신규 가입',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">오늘의 주문 현황</h1>
        <p className="text-sm text-muted-foreground">
          결제부터 배송 완료까지, 지금 이 순간 진행 중인 주문의 흐름입니다.
        </p>
      </div>

      <Card>
        <CardContent className="flex items-stretch overflow-x-auto">
          {STAGES.map((stage, i) => (
            <Fragment key={stage.key}>
              <div className="flex min-w-32 flex-1 flex-col gap-2 px-1 py-1">
                <span
                  className="h-1.5 w-7 rounded-full"
                  style={{ background: stage.color }}
                />
                <span
                  className="font-mono text-3xl leading-none font-semibold tabular-nums"
                  style={{ color: stage.color }}
                >
                  {stage.count}
                </span>
                <span className="text-xs text-muted-foreground">{stage.label}</span>
              </div>
              {i < STAGES.length - 1 && (
                <div aria-hidden className="flex w-6 shrink-0 items-center justify-center">
                  <div className="h-0 w-full border-t-2 border-dashed border-border" />
                </div>
              )}
            </Fragment>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>최근 5주 고객 추이</CardTitle>
          <CardDescription>전체 고객 수와 신규 가입 추이입니다.</CardDescription>
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
