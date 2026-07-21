import { Router } from "express";

import type { Product, ProductStatus } from "../generated/prisma/client.js";
import { formatProductCode } from "../lib/codes.js";
import { PRODUCT_STATUSES } from "../lib/constants.js";
import { parseFilter, parsePagination, parseSearch } from "../lib/pagination.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const productsRouter = Router();
productsRouter.use(requireAuth);

function serializeProduct(product: Product) {
  return {
    id: product.id,
    code: formatProductCode(product.id),
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
    status: product.status,
    updatedAt: product.updatedAt,
  };
}

productsRouter.get("/", async (req, res) => {
  const { page, pageSize, skip, take } = parsePagination(req.query);
  const search = parseSearch(req.query);
  const status = parseFilter(req.query, "status", PRODUCT_STATUSES);
  const category = typeof req.query.category === "string" ? req.query.category : undefined;

  const where = {
    ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
    ...(status ? { status } : {}),
    ...(category && category !== "all" ? { category } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take, orderBy: { id: "asc" } }),
    prisma.product.count({ where }),
  ]);

  res.json({ items: items.map(serializeProduct), total, page, pageSize });
});

productsRouter.get("/categories", async (_req, res) => {
  const categories = await prisma.product.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });
  res.json({ categories: categories.map((c) => c.category) });
});

productsRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    res.status(404).json({ error: "상품을 찾을 수 없습니다." });
    return;
  }
  res.json(serializeProduct(product));
});

productsRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const status = req.body?.status as ProductStatus | undefined;
  if (!status || !PRODUCT_STATUSES.includes(status)) {
    res.status(400).json({ error: "올바르지 않은 상태입니다." });
    return;
  }

  const product = await prisma.product
    .update({ where: { id }, data: { status } })
    .catch(() => null);
  if (!product) {
    res.status(404).json({ error: "상품을 찾을 수 없습니다." });
    return;
  }
  res.json(serializeProduct(product));
});
