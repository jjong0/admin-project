import bcrypt from "bcryptjs";
import { Router } from "express";

import { signAdminToken } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "이메일과 비밀번호를 입력하세요." });
    return;
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  const valid = admin ? await bcrypt.compare(password, admin.passwordHash) : false;
  if (!admin || !valid) {
    res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
    return;
  }

  const token = signAdminToken({ adminId: admin.id });
  res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ admin: req.admin });
});
