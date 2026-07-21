import type { CustomerStatus, OrderStatus, ProductStatus } from "@/lib/api-types";

export const CUSTOMER_STATUS_LABEL: Record<CustomerStatus, string> = {
  ACTIVE: "활성",
  INACTIVE: "휴면",
  SUSPENDED: "정지",
};

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  SELLING: "판매중",
  SOLDOUT: "품절",
  HIDDEN: "숨김",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PAID: "결제완료",
  PREPARING: "상품준비중",
  SHIPPING: "배송중",
  DELIVERED: "배송완료",
  CANCELLED: "취소·반품",
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PAID: "var(--chart-1)",
  PREPARING: "var(--chart-2)",
  SHIPPING: "var(--chart-3)",
  DELIVERED: "var(--chart-4)",
  CANCELLED: "var(--chart-5)",
};

export const LOW_STOCK_THRESHOLD = 10;

export function formatDate(iso: string | null) {
  return iso ? iso.slice(0, 10) : "-";
}

export function formatWon(amount: number) {
  return `₩${amount.toLocaleString("ko-KR")}`;
}
