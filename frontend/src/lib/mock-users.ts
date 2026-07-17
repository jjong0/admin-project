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

const FAMILY_NAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임']
const GIVEN_NAMES = [
  '민준', '서연', '도윤', '지우', '하준', '서준', '예은', '지호', '수아', '유진',
  '시우', '하은', '주원', '지안', '은우', '수빈', '연우', '태윤', '채원', '민서',
]

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function randomDate(rand: () => number, startYear = 2024) {
  const start = new Date(startYear, 0, 1).getTime()
  const end = new Date(2026, 6, 17).getTime()
  const date = new Date(start + rand() * (end - start))
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const STATUSES: UserStatus[] = ['active', 'active', 'active', 'inactive', 'suspended']

export function generateMockUsers(count = 68): MockUser[] {
  const rand = seededRandom(42)

  return Array.from({ length: count }, (_, i) => {
    const family = FAMILY_NAMES[Math.floor(rand() * FAMILY_NAMES.length)]
    const given = GIVEN_NAMES[Math.floor(rand() * GIVEN_NAMES.length)]
    const name = `${family}${given}`
    const id = `U${String(i + 1).padStart(4, '0')}`
    const status = STATUSES[Math.floor(rand() * STATUSES.length)]
    const joinedAt = randomDate(rand)
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
