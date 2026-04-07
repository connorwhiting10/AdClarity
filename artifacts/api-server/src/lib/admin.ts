import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.ADMIN_ACCESS_CODE ?? "fallback-insecure-secret";
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const TEST_MODE = process.env.TEST_MODE === "true";

export type AdminTokenPayload = {
  email: string;
  role: "admin";
  plan: "pro";
  isAdmin: true;
  iat?: number;
  exp?: number;
};

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export function signAdminToken(email: string): string {
  const payload: Omit<AdminTokenPayload, "iat" | "exp"> = {
    email: email.toLowerCase(),
    role: "admin",
    plan: "pro",
    isAdmin: true,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
    if (!payload.isAdmin || payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}
