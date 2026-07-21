import { Router } from "express";

import { ORDER_STATUSES } from "../lib/constants.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const TREND_WEEKS = 5;

dashboardRouter.get("/stats", async (_req, res) => {
  const statusCounts = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const stages = ORDER_STATUSES.map((status) => ({
    status,
    count: statusCounts.find((row) => row.status === status)?._count._all ?? 0,
  }));

  const customers = await prisma.customer.findMany({
    select: { joinedAt: true },
    orderBy: { joinedAt: "asc" },
  });

  const now = Date.now();
  const trend = Array.from({ length: TREND_WEEKS }, (_, i) => {
    const weeksAgo = TREND_WEEKS - 1 - i;
    const weekEnd = now - weeksAgo * WEEK_MS;
    const signups = customers.filter((c) => {
      const diff = weekEnd - c.joinedAt.getTime();
      return diff >= 0 && diff < WEEK_MS;
    }).length;
    const users = customers.filter((c) => c.joinedAt.getTime() <= weekEnd).length;
    return { date: new Date(weekEnd).toISOString().slice(0, 10), users, signups };
  });

  res.json({ stages, trend });
});
