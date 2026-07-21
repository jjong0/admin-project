import "dotenv/config";
import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";

import { authRouter } from "./routes/auth.js";
import { customersRouter } from "./routes/customers.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { ordersRouter } from "./routes/orders.js";
import { productsRouter } from "./routes/products.js";

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/customers", customersRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/dashboard", dashboardRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "요청한 경로를 찾을 수 없습니다." });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "서버 오류가 발생했습니다." });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
