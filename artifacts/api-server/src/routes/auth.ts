import { Router } from "express";
import { isAdminEmail, signAdminToken, verifyAdminToken, TEST_MODE } from "../lib/admin.js";

const router = Router();

/**
 * POST /api/auth/admin-login
 * Body: { email: string, accessCode: string, testScenario?: "active"|"failed"|"cancelled" }
 *
 * Validates email against ADMIN_EMAILS whitelist and accessCode against ADMIN_ACCESS_CODE.
 * Returns a signed JWT on success. Never exposes whether the email exists.
 */
router.post("/admin-login", (req, res) => {
  const { email, accessCode, testScenario } = req.body as {
    email?: string;
    accessCode?: string;
    testScenario?: "active" | "failed" | "cancelled";
  };

  if (!email || typeof email !== "string" || !accessCode || typeof accessCode !== "string") {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  if (!isAdminEmail(email)) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const expectedCode = process.env.ADMIN_ACCESS_CODE;
  if (!expectedCode || accessCode !== expectedCode) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  if (TEST_MODE && testScenario) {
    res.json({
      token: signAdminToken(email),
      mode: "test",
      testScenario,
      simulatedSubscription: {
        active: { status: "active", plan: "pro" },
        failed: { status: "past_due", plan: "basic" },
        cancelled: { status: "cancelled", plan: "free" },
      }[testScenario] ?? { status: "active", plan: "pro" },
    });
    return;
  }

  const token = signAdminToken(email);
  res.json({ token, role: "admin", plan: "pro" });
});

/**
 * GET /api/auth/verify
 * Header: Authorization: Bearer <token>
 *
 * Verifies a JWT and returns the user's role/plan.
 * Used by the frontend on load to check if admin session is still valid.
 */
router.get("/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token" });
    return;
  }
  const token = authHeader.slice(7);
  const payload = verifyAdminToken(token);
  if (!payload) {
    res.status(403).json({ error: "Invalid or expired token" });
    return;
  }
  res.json({
    email: payload.email,
    role: payload.role,
    plan: payload.plan,
    isAdmin: payload.isAdmin,
    testMode: TEST_MODE,
  });
});

/**
 * POST /api/auth/admin-logout
 * Client should discard the JWT; this endpoint is a no-op server-side
 * (stateless JWT) but gives a clean logout API.
 */
router.post("/admin-logout", (_req, res) => {
  res.json({ success: true });
});

export default router;
