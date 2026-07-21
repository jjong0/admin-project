import { Router } from "express";

import type { Customer, CustomerStatus } from "../generated/prisma/client.js";
import { formatCustomerCode } from "../lib/codes.js";
import { CUSTOMER_STATUSES } from "../lib/constants.js";
import { toCsv } from "../lib/csv.js";
import { parseFilter, parsePagination, parseSearch } from "../lib/pagination.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const customersRouter = Router();
customersRouter.use(requireAuth);

function serializeCustomer(customer: Customer) {
  return {
    id: customer.id,
    code: formatCustomerCode(customer.id),
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    status: customer.status,
    joinedAt: customer.joinedAt,
    lastLoginAt: customer.lastLoginAt,
  };
}

function buildWhere(req: { query: Record<string, unknown> }) {
  const search = parseSearch(req.query);
  const status = parseFilter(req.query, "status", CUSTOMER_STATUSES);

  return {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
  };
}

customersRouter.get("/export", async (req, res) => {
  const where = buildWhere(req);
  const customers = await prisma.customer.findMany({ where, orderBy: { id: "asc" } });

  const csv = toCsv(
    ["ID", "이름", "이메일", "전화번호", "상태", "가입일", "최근 로그인"],
    customers.map((c) => [
      formatCustomerCode(c.id),
      c.name,
      c.email,
      c.phone,
      c.status,
      c.joinedAt.toISOString().slice(0, 10),
      c.lastLoginAt?.toISOString().slice(0, 10) ?? "",
    ]),
  );

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="customers-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csv);
});

customersRouter.get("/", async (req, res) => {
  const { page, pageSize, skip, take } = parsePagination(req.query);
  const where = buildWhere(req);

  const [items, total] = await Promise.all([
    prisma.customer.findMany({ where, skip, take, orderBy: { id: "asc" } }),
    prisma.customer.count({ where }),
  ]);

  res.json({ items: items.map(serializeCustomer), total, page, pageSize });
});

customersRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    res.status(404).json({ error: "고객을 찾을 수 없습니다." });
    return;
  }
  res.json(serializeCustomer(customer));
});

customersRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const status = req.body?.status as CustomerStatus | undefined;
  if (!status || !CUSTOMER_STATUSES.includes(status)) {
    res.status(400).json({ error: "올바르지 않은 상태입니다." });
    return;
  }

  const customer = await prisma.customer
    .update({ where: { id }, data: { status } })
    .catch(() => null);
  if (!customer) {
    res.status(404).json({ error: "고객을 찾을 수 없습니다." });
    return;
  }
  res.json(serializeCustomer(customer));
});
