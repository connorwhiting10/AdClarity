import { Router } from "express";

const router = Router();

/**
 * GET /api/users/me
 * Stubbed 401 — frontend now reads profile directly from Supabase.
 * Route file scheduled for removal in Phase 6 of the Supabase migration.
 */
router.get("/me", async (_req, res) => {
  res.status(401).json({ error: "Unauthorized" });
});

export default router;
