import { Router } from "express";

import type { OrderStatus } from "../generated/prisma/client.js";
import { formatCustomerCode, formatOrderCode, formatProductCode } from "../lib/codes.js";
import { ORDER_STATUSES } from "../lib/constants.js";
import { parseFilter, parsePagination, parseSearch } from "../lib/pagination.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const ordersRouter = Router();
ordersRouter.use(requireAuth);

const orderWithRelations = {
  include: {
    customer: true,
    items: { include: { product: true } },
  },
} as const;

type OrderWithRelations = Awaited<
  ReturnType<typeof prisma.order.findFirstOrThrow<typeof orderWithRelations>>
>;

function summarizeProductNames(items: OrderWithRelations["items"]) {
  if (items.length === 0) return "-";
  const [first, ...rest] = items;
  return rest.length > 0 ? `${first.product.name} 외 ${rest.length}건` : first.product.name;
}

function serializeOrderSummary(order: OrderWithRelations) {
  return {
    id: order.id,
    code: formatOrderCode(order.id),
    customerName: order.customer.name,
    customerCode: formatCustomerCode(order.customer.id),
    productSummary: summarizeProductNames(order.items),
    status: order.status,
    trackingNo: order.trackingNo,
    orderedAt: order.orderedAt,
  };
}

function serializeOrderDetail(order: OrderWithRelations) {
  return {
    ...serializeOrderSummary(order),
    items: order.items.map((item) => ({
      productId: item.productId,
      productCode: formatProductCode(item.productId),
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  };
}

ordersRouter.get("/", async (req, res) => {
  const { page, pageSize, skip, take } = parsePagination(req.query);
  const search = parseSearch(req.query);
  const status = parseFilter(req.query, "status", ORDER_STATUSES);

  const where = {
    ...(search
      ? {
          OR: [
            { customer: { name: { contains: search, mode: "insensitive" as const } } },
            { items: { some: { product: { name: { contains: search, mode: "insensitive" as const } } } } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({ where, skip, take, orderBy: { id: "asc" }, ...orderWithRelations }),
    prisma.order.count({ where }),
  ]);

  res.json({ items: items.map(serializeOrderSummary), total, page, pageSize });
});

ordersRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const order = await prisma.order.findUnique({ where: { id }, ...orderWithRelations });
  if (!order) {
    res.status(404).json({ error: "주문을 찾을 수 없습니다." });
    return;
  }
  res.json(serializeOrderDetail(order));
});

ordersRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const status = req.body?.status as OrderStatus | undefined;
  if (!status || !ORDER_STATUSES.includes(status)) {
    res.status(400).json({ error: "올바르지 않은 상태입니다." });
    return;
  }

  const order = await prisma.order
    .update({ where: { id }, data: { status }, ...orderWithRelations })
    .catch(() => null);
  if (!order) {
    res.status(404).json({ error: "주문을 찾을 수 없습니다." });
    return;
  }
  res.json(serializeOrderDetail(order));
});
