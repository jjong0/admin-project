import type { NextFunction, Request, Response } from "express";

import { verifyAdminToken } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: { id: number; email: string; name: string };
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "인증이 필요합니다." });
    return;
  }

  try {
    const payload = verifyAdminToken(header.slice("Bearer ".length));
    const admin = await prisma.admin.findUnique({ where: { id: payload.adminId } });
    if (!admin) {
      res.status(401).json({ error: "유효하지 않은 토큰입니다." });
      return;
    }
    req.admin = { id: admin.id, email: admin.email, name: admin.name };
    next();
  } catch {
    res.status(401).json({ error: "유효하지 않은 토큰입니다." });
  }
}
