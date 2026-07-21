import "dotenv/config";
import bcrypt from "bcryptjs";

import type { CustomerStatus, ProductStatus, OrderStatus } from "../src/generated/prisma/client.js";
import { prisma } from "../src/lib/prisma.js";

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD must be set in .env to seed the admin account.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, name: "관리자", passwordHash },
  });
  console.log(`Admin ready: ${email}`);
}

const CATALOG: Record<string, string[]> = {
  생활잡화: ["멀티 수납함", "접이식 빨래건조대", "스텐 텀블러", "극세사 청소포", "원목 트레이"],
  주방용품: ["논스틱 프라이팬", "스텐 밀폐용기 세트", "전기 커피포트", "실리콘 뒤집개", "원목 도마 세트"],
  디지털: ["무선 이어폰", "보조배터리 10000mAh", "USB-C 멀티허브", "블루투스 스피커", "스마트워치 밴드"],
  뷰티: ["수분 크림", "선크림 SPF50", "립밤 3종 세트", "약산성 클렌징폼", "헤어 에센스"],
  식품: ["유기농 원두 1kg", "견과류 모둠팩", "제주 감귤청", "수제 그래놀라", "콜드브루 파우치"],
  패션잡화: ["캔버스 에코백", "니트 비니", "스트랩 손목시계", "레더 카드지갑", "기모 양말 세트"],
};

const FAMILY_NAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임"];
const GIVEN_NAMES = [
  "민준", "서연", "도윤", "지우", "하준", "서준", "예은", "지호", "수아", "유진",
  "시우", "하은", "주원", "지안", "은우", "수빈", "연우", "태윤", "채원", "민서",
];

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

async function seedProducts() {
  const rand = seededRandom(7);
  const entries = Object.entries(CATALOG).flatMap(([category, names]) =>
    names.map((name) => ({ category, name })),
  );

  const products = [];
  for (const { category, name } of entries) {
    const price = Math.round(rand() * 80 + 5) * 1000 - 100;
    const stock = Math.floor(rand() * 260);
    const status: ProductStatus = stock === 0 ? "SOLDOUT" : rand() < 0.1 ? "HIDDEN" : "SELLING";
    const product = await prisma.product.create({
      data: { name, category, price, stock, status },
    });
    products.push(product);
  }
  console.log(`Seeded ${products.length} products`);
  return products;
}

async function seedCustomers() {
  const rand = seededRandom(42);
  const statuses: CustomerStatus[] = ["ACTIVE", "ACTIVE", "ACTIVE", "INACTIVE", "SUSPENDED"];

  const customers = [];
  for (let i = 0; i < 40; i++) {
    const family = FAMILY_NAMES[Math.floor(rand() * FAMILY_NAMES.length)];
    const given = GIVEN_NAMES[Math.floor(rand() * GIVEN_NAMES.length)];
    const status = statuses[Math.floor(rand() * statuses.length)];
    const customer = await prisma.customer.create({
      data: {
        name: `${family}${given}`,
        email: `user${i + 1}@example.com`,
        phone: `010-${1000 + Math.floor(rand() * 8999)}-${1000 + Math.floor(rand() * 8999)}`,
        status,
      },
    });
    customers.push(customer);
  }
  console.log(`Seeded ${customers.length} customers`);
  return customers;
}

async function seedOrders(
  customers: { id: number }[],
  products: { id: number; price: number }[],
) {
  const rand = seededRandom(23);
  const statuses: OrderStatus[] = [
    "PAID", "PREPARING", "PREPARING", "SHIPPING", "SHIPPING",
    "DELIVERED", "DELIVERED", "DELIVERED", "DELIVERED", "CANCELLED",
  ];

  let count = 0;
  for (let i = 0; i < 50; i++) {
    const customer = customers[Math.floor(rand() * customers.length)];
    const status = statuses[Math.floor(rand() * statuses.length)];
    const trackingNo =
      status === "SHIPPING" || status === "DELIVERED"
        ? String(Math.floor(rand() * 900000000000) + 100000000000)
        : null;
    const itemCount = 1 + Math.floor(rand() * 2);
    const items = Array.from({ length: itemCount }, () => {
      const product = products[Math.floor(rand() * products.length)];
      return {
        productId: product.id,
        quantity: 1 + Math.floor(rand() * 3),
        unitPrice: product.price,
      };
    });

    await prisma.order.create({
      data: {
        customerId: customer.id,
        status,
        trackingNo,
        items: { create: items },
      },
    });
    count++;
  }
  console.log(`Seeded ${count} orders`);
}

async function main() {
  await seedAdmin();

  const existingProducts = await prisma.product.count();
  if (existingProducts > 0) {
    console.log("Products/customers/orders already seeded, skipping.");
    return;
  }

  const products = await seedProducts();
  const customers = await seedCustomers();
  await seedOrders(customers, products);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
