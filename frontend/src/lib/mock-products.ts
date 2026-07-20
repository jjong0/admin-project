import { pad, randomDate, seededRandom } from '@/lib/mock-data-utils'

export type ProductStatus = 'selling' | 'soldout' | 'hidden'

export type MockProduct = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: ProductStatus
  updatedAt: string
}

const CATALOG: Record<string, string[]> = {
  생활잡화: ['멀티 수납함', '접이식 빨래건조대', '스텐 텀블러', '극세사 청소포', '원목 트레이'],
  주방용품: ['논스틱 프라이팬', '스텐 밀폐용기 세트', '전기 커피포트', '실리콘 뒤집개', '원목 도마 세트'],
  디지털: ['무선 이어폰', '보조배터리 10000mAh', 'USB-C 멀티허브', '블루투스 스피커', '스마트워치 밴드'],
  뷰티: ['수분 크림', '선크림 SPF50', '립밤 3종 세트', '약산성 클렌징폼', '헤어 에센스'],
  식품: ['유기농 원두 1kg', '견과류 모둠팩', '제주 감귤청', '수제 그래놀라', '콜드브루 파우치'],
  패션잡화: ['캔버스 에코백', '니트 비니', '스트랩 손목시계', '레더 카드지갑', '기모 양말 세트'],
}

export const CATEGORIES = Object.keys(CATALOG)

export function generateMockProducts(count = 42): MockProduct[] {
  const rand = seededRandom(7)

  return Array.from({ length: count }, (_, i) => {
    const category = CATEGORIES[Math.floor(rand() * CATEGORIES.length)]
    const names = CATALOG[category]
    const name = names[Math.floor(rand() * names.length)]
    const id = `P${pad(i + 1, 4)}`
    const price = Math.round(rand() * 80 + 5) * 1000 - 100
    const stock = Math.floor(rand() * 260)
    const status: ProductStatus =
      stock === 0 ? 'soldout' : rand() < 0.1 ? 'hidden' : 'selling'
    const updatedAt = randomDate(rand, 2025)

    return { id, name, category, price, stock, status, updatedAt }
  })
}

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  selling: '판매중',
  soldout: '품절',
  hidden: '숨김',
}

export const LOW_STOCK_THRESHOLD = 10

// Single source of truth: generated once and shared by every page/module
// that needs the product catalog (Products.tsx, mock-orders.ts), instead
// of each caller re-running the generator.
export const ALL_PRODUCTS = generateMockProducts()
