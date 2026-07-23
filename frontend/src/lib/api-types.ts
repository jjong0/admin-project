export type CustomerStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type ProductStatus = "SELLING" | "SOLDOUT" | "HIDDEN";
export type OrderStatus = "PAID" | "PREPARING" | "SHIPPING" | "DELIVERED" | "CANCELLED";

export type Customer = {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  joinedAt: string;
};

export type Product = {
  id: number;
  code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  updatedAt: string;
};

export type OrderSummary = {
  id: number;
  code: string;
  customerName: string;
  customerCode: string;
  productSummary: string;
  status: OrderStatus;
  trackingNo: string | null;
  orderedAt: string;
};

export type OrderItem = {
  productId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

export type OrderDetail = OrderSummary & { items: OrderItem[] };

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type DashboardStats = {
  stages: { status: OrderStatus; count: number }[];
  trend: { date: string; users: number; signups: number }[];
};

export type AdminInfo = { id: number; email: string; name: string };
