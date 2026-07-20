export function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

export function pad(n: number, width = 2) {
  return String(n).padStart(width, '0')
}

const MOCK_DATA_END = new Date(2026, 6, 17).getTime()

export function randomDate(rand: () => number, startYear: number) {
  const start = new Date(startYear, 0, 1).getTime()
  const date = new Date(start + rand() * (MOCK_DATA_END - start))
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const FAMILY_NAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임']
export const GIVEN_NAMES = [
  '민준', '서연', '도윤', '지우', '하준', '서준', '예은', '지호', '수아', '유진',
  '시우', '하은', '주원', '지안', '은우', '수빈', '연우', '태윤', '채원', '민서',
]

export function randomKoreanName(rand: () => number) {
  const family = FAMILY_NAMES[Math.floor(rand() * FAMILY_NAMES.length)]
  const given = GIVEN_NAMES[Math.floor(rand() * GIVEN_NAMES.length)]
  return `${family}${given}`
}
