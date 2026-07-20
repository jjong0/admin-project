import { ALL_PRODUCTS } from '@/lib/mock-products'
import { pad, randomDate, randomKoreanName, seededRandom } from '@/lib/mock-data-utils'

export type OrderStatus = 'paid' | 'preparing' | 'shipping' | 'delivered' | 'cancelled'

export type MockOrder = {
  id: string
  customerName: string
  productName: string
  status: OrderStatus
  trackingNo: string | null
  orderedAt: string
}

const STATUSES: OrderStatus[] = [
  'paid', 'preparing', 'preparing', 'shipping', 'shipping',
  'delivered', 'delivered', 'delivered', 'delivered', 'cancelled',
]

const PRODUCT_NAMES = ALL_PRODUCTS.map((p) => p.name)

export function generateMockOrders(count = 56): MockOrder[] {
  const rand = seededRandom(23)

  return Array.from({ length: count }, (_, i) => {
    const id = `O${pad(i + 1, 6)}`
    const status = STATUSES[Math.floor(rand() * STATUSES.length)]
    const productName = PRODUCT_NAMES[Math.floor(rand() * PRODUCT_NAMES.length)]
    const trackingNo =
      status === 'shipping' || status === 'delivered'
        ? String(Math.floor(rand() * 900000000000) + 100000000000)
        : null

    return {
      id,
      customerName: randomKoreanName(rand),
      productName,
      status,
      trackingNo,
      orderedAt: randomDate(rand, 2026),
    }
  })
}

// Single source of truth: generated once and shared by every page/module
// that needs the order list (Shipments.tsx, Dashboard.tsx), instead of
// each caller re-running the generator with its own copy.
export const ALL_ORDERS = generateMockOrders()

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  paid: '결제완료',
  preparing: '상품준비중',
  shipping: '배송중',
  delivered: '배송완료',
  cancelled: '취소·반품',
}

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  paid: 'var(--chart-1)',
  preparing: 'var(--chart-2)',
  shipping: 'var(--chart-3)',
  delivered: 'var(--chart-4)',
  cancelled: 'var(--chart-5)',
}
