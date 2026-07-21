import jwt from "jsonwebtoken";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET must be set");
  }
  return secret;
}

export type AdminTokenPayload = { adminId: number };

export function signAdminToken(payload: AdminTokenPayload) {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  return jwt.verify(token, getSecret()) as AdminTokenPayload;
}
