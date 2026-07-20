import { pad, randomDate, randomKoreanName, seededRandom } from '@/lib/mock-data-utils'

export type UserStatus = 'active' | 'inactive' | 'suspended'

export type MockUser = {
  id: string
  name: string
  email: string
  phone: string
  status: UserStatus
  joinedAt: string
  lastLoginAt: string
}

const STATUSES: UserStatus[] = ['active', 'active', 'active', 'inactive', 'suspended']

export function generateMockUsers(count = 68): MockUser[] {
  const rand = seededRandom(42)

  return Array.from({ length: count }, (_, i) => {
    const name = randomKoreanName(rand)
    const id = `U${pad(i + 1, 4)}`
    const status = STATUSES[Math.floor(rand() * STATUSES.length)]
    const joinedAt = randomDate(rand, 2024)
    const lastLoginAt = randomDate(rand, Number(joinedAt.slice(0, 4)))

    return {
      id,
      name,
      email: `user${i + 1}@example.com`,
      phone: `010-${1000 + Math.floor(rand() * 8999)}-${1000 + Math.floor(rand() * 8999)}`,
      status,
      joinedAt,
      lastLoginAt: lastLoginAt < joinedAt ? joinedAt : lastLoginAt,
    }
  })
}

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  active: '활성',
  inactive: '휴면',
  suspended: '정지',
}
