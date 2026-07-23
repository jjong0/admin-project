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
  const weekEnds = Array.from(
    { length: TREND_WEEKS },
    (_, i) => now - (TREND_WEEKS - 1 - i) * WEEK_MS,
  );

  // customers is sorted by joinedAt ascending, so a single forward-moving
  // cursor across the weekly boundaries computes both the cumulative total
  // and each week's signups in one O(n) pass, instead of re-filtering the
  // full array from scratch for every week.
  let cursor = 0;
  let cumulativeUsers = 0;
  const trend = weekEnds.map((weekEnd) => {
    const prevWeekEnd = weekEnd - WEEK_MS;
    let signups = 0;
    while (cursor < customers.length && customers[cursor].joinedAt.getTime() <= weekEnd) {
      cumulativeUsers++;
      if (customers[cursor].joinedAt.getTime() > prevWeekEnd) signups++;
      cursor++;
    }
    return { date: new Date(weekEnd).toISOString().slice(0, 10), users: cumulativeUsers, signups };
  });

  res.json({ stages, trend });
});
