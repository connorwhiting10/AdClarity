import { type NextFunction, type Request, type Response } from "express";
import { jwtVerify } from "jose";

/**
 * Supabase JWT verification middleware.
 *
 * NOT wired into any route yet. Reserved for endpoints that will be added
 * server-side in later migration phases (Stripe webhook confirmations,
 * PDF generation, admin overrides) — things that legitimately need the
 * service_role key or must run outside the browser.
 *
 * Expects `Authorization: Bearer <supabase-access-token>`.
 * Verifies HS256 against SUPABASE_JWT_SECRET (Project Settings → API).
 * On success, attaches `req.supabaseUser` with `sub` (user uuid), `role`,
 * and `email`. On failure, responds 401 and does not call next().
 */

export interface SupabaseAuthClaims {
  sub: string;
  email?: string;
  role?: string;
  aud?: string | string[];
  exp?: number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      supabaseUser?: SupabaseAuthClaims;
    }
  }
}

let cachedKey: Uint8Array | null = null;
function getSecretKey(): Uint8Array {
  if (cachedKey) return cachedKey;
  const secret = process.env["SUPABASE_JWT_SECRET"];
  if (!secret) {
    throw new Error(
      "SUPABASE_JWT_SECRET is not set. Supabase JWT verification cannot run.",
    );
  }
  cachedKey = new TextEncoder().encode(secret);
  return cachedKey;
}

export async function requireSupabaseUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }
  const token = header.slice(7);
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    if (typeof payload.sub !== "string") {
      res.status(401).json({ error: "Token missing sub claim" });
      return;
    }
    req.supabaseUser = {
      sub: payload.sub,
      email: typeof payload["email"] === "string" ? (payload["email"] as string) : undefined,
      role: typeof payload["role"] === "string" ? (payload["role"] as string) : undefined,
      aud: payload.aud,
      exp: payload.exp,
    };
    next();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid token";
    res.status(401).json({ error: "Invalid token", detail: message });
  }
}
